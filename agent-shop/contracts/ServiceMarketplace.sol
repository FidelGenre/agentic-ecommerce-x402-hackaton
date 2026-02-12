// SPDX-License-Identifier: MIT
pragma solidity >=0.8.27;

import {BITE} from "@skalenetwork/bite-solidity/contracts/BITE.sol";
import {IBiteSupplicant} from "@skalenetwork/bite-solidity/contracts/interfaces/IBiteSupplicant.sol";

/**
 * @title ServiceMarketplace
 * @notice Decentralized marketplace for autonomous agent service arbitrage on SKALE.
 *         Implements BITE V2 (Phase I & Phase II) + x402-style payment flows.
 *
 *         Phase I:  Encrypted Transactions — bid data encrypted before consensus
 *         Phase II: Conditional Transactions (CTX) — auto-execute on condition met
 *
 * @dev Uses official @skalenetwork/bite-solidity library for CTX callbacks.
 *      Requires Solidity >=0.8.27 and EVM Istanbul compiler.
 */
contract ServiceMarketplace is IBiteSupplicant {
    // ──────────────────────── Types ────────────────────────
    struct Service {
        address payable provider; // 20 bytes
        // Packed 1st slot (20 + 1 + 1 + 1 + 9 = 32 bytes)
        bool active;              // 1 byte
        uint8 uptime;             // 1 byte
        uint8 rating;             // 1 byte
        // Remaining 9 bytes specific to provider could go here, but this is good enough
        string name;
        string description;
        uint256 pricePerUnit;     // 32 bytes
        uint256 ratingCount;      // 32 bytes
    }

    struct ServiceRequest {
        address requester;
        uint256 serviceId;
        string objective;
        uint256 budget;
        RequestStatus status;
    }

    struct EncryptedOffer {
        address provider;
        bytes32 offerHash;     // BITE Phase I: keccak256(price, nonce) — hidden until reveal
        uint256 revealedPrice;
        bool revealed;
        bool accepted;
    }

    enum RequestStatus { Open, Matched, Settled, Cancelled }

    // ──────────────────────── State ────────────────────────
    uint256 public nextServiceId;
    uint256 public nextRequestId;

    mapping(uint256 => Service) public services;
    mapping(uint256 => ServiceRequest) public requests;
    // requestId => provider => EncryptedOffer
    mapping(uint256 => mapping(address => EncryptedOffer)) public offers;
    // requestId => list of bidder addresses
    mapping(uint256 => address[]) public requestBidders;

    // ──────── BITE Phase II: Conditional Transaction State ────────
    /// @dev Maps CTX callback sender address to the request it belongs to
    mapping(address => uint256) public ctxCallbackToRequest;
    /// @dev Maps CTX callback sender to the provider who submitted it
    mapping(address => address) public ctxCallbackToProvider;
    /// @dev Tracks the last CTX callback sender for verification
    address public lastCTXSender;

    // ──────────────────────── Events ────────────────────────
    event ServiceRegistered(uint256 indexed serviceId, address indexed provider, string name, uint256 price);
    event ServiceRequestCreated(uint256 indexed requestId, address indexed requester, uint256 serviceId, uint256 budget);
    event EncryptedOfferSubmitted(uint256 indexed requestId, address indexed provider, bytes32 offerHash);
    event OfferRevealed(uint256 indexed requestId, address indexed provider, uint256 price);
    event PaymentSettled(uint256 indexed requestId, address indexed provider, uint256 amount, string protocol);
    event ServiceRated(uint256 indexed serviceId, address indexed rater, uint8 rating);

    // BITE Phase II events
    event CTXOfferSubmitted(uint256 indexed requestId, address indexed provider, address callbackSender);
    event CTXOfferDecrypted(uint256 indexed requestId, address indexed provider, uint256 decryptedPrice);

    // ──────────────────────── Service Registry ────────────────────────

    /**
     * @notice Register a new service as a provider agent.
     */
    function registerService(
        string calldata _name,
        string calldata _description,
        uint256 _pricePerUnit,
        uint8 _uptime,
        uint8 _rating
    ) external returns (uint256 serviceId) {
        serviceId = nextServiceId++;
        services[serviceId] = Service({
            provider: payable(msg.sender),
            name: _name,
            description: _description,
            pricePerUnit: _pricePerUnit,
            active: true,
            uptime: _uptime,
            rating: _rating,
            ratingCount: 1
        });
        emit ServiceRegistered(serviceId, msg.sender, _name, _pricePerUnit);
    }

    /**
     * @notice Create a service request as a requester agent.
     */
    function createRequest(
        uint256 _serviceId,
        string calldata _objective
    ) external payable returns (uint256 requestId) {
        require(msg.value > 0, "Budget must be > 0");
        requestId = nextRequestId++;
        requests[requestId] = ServiceRequest({
            requester: msg.sender,
            serviceId: _serviceId,
            objective: _objective,
            budget: msg.value,
            status: RequestStatus.Open
        });
        emit ServiceRequestCreated(requestId, msg.sender, _serviceId, msg.value);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // BITE PHASE I: Encrypted Transactions (Commit-Reveal)
    // The transaction data is encrypted client-side by the BITE SDK
    // before reaching the blockchain. Validators decrypt after consensus.
    // No changes in Solidity needed — any tx is automatically protected.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * @notice Submit an encrypted (hashed) offer for a request.
     *         The hash = keccak256(abi.encodePacked(price, nonce))
     *         When sent via BITE encrypted transaction, the calldata
     *         itself is encrypted at the consensus level, providing
     *         double protection against MEV and front-running.
     */
    function submitEncryptedOffer(
        uint256 _requestId,
        bytes32 _offerHash
    ) external {
        require(requests[_requestId].status == RequestStatus.Open, "Request not open");
        require(offers[_requestId][msg.sender].offerHash == bytes32(0), "Already submitted");

        offers[_requestId][msg.sender] = EncryptedOffer({
            provider: msg.sender,
            offerHash: _offerHash,
            revealedPrice: 0,
            revealed: false,
            accepted: false
        });
        requestBidders[_requestId].push(msg.sender);

        emit EncryptedOfferSubmitted(_requestId, msg.sender, _offerHash);
    }

    /**
     * @notice Reveal a previously committed offer.
     *         Provider must supply the original price + nonce to prove the hash.
     */
    function revealOffer(
        uint256 _requestId,
        uint256 _price,
        uint256 _nonce
    ) external {
        EncryptedOffer storage offer = offers[_requestId][msg.sender];
        require(offer.offerHash != bytes32(0), "No offer found");
        require(!offer.revealed, "Already revealed");

        bytes32 computedHash = keccak256(abi.encodePacked(_price, _nonce));
        require(computedHash == offer.offerHash, "Hash mismatch - invalid reveal");

        offer.revealedPrice = _price;
        offer.revealed = true;

        emit OfferRevealed(_requestId, msg.sender, _price);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // BITE PHASE II: Conditional Transactions (CTX)
    // Encrypted data is stored on-chain. When a condition is met,
    // the SKALE validators automatically decrypt and call onDecrypt().
    // Uses official @skalenetwork/bite-solidity library.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * @notice Submit an encrypted offer using BITE CTX (Phase II).
     *         The encrypted price data will be decrypted by validators
     *         and delivered via the onDecrypt() callback automatically.
     *
     * @param _requestId The request to bid on
     * @param _encryptedPrice The BITE-encrypted price data (from bite-ts SDK)
     */
    function submitCTXOffer(
        uint256 _requestId,
        bytes calldata _encryptedPrice
    ) external payable {
        require(requests[_requestId].status == RequestStatus.Open, "Request not open");
        require(offers[_requestId][msg.sender].offerHash == bytes32(0), "Already submitted");

        // Prepare encrypted arguments for BITE
        bytes[] memory encryptedArgs = new bytes[](1);
        encryptedArgs[0] = _encryptedPrice;

        // Pass requestId and provider as plaintext for the callback
        bytes[] memory plaintextArgs = new bytes[](2);
        plaintextArgs[0] = abi.encode(_requestId);
        plaintextArgs[1] = abi.encode(msg.sender);

        // Submit CTX via official BITE library
        address callbackSender = BITE.submitCTX(
            BITE.SUBMIT_CTX_ADDRESS,
            msg.value / tx.gasprice,
            encryptedArgs,
            plaintextArgs
        );

        // Fund the callback sender for gas
        payable(callbackSender).transfer(msg.value);

        // Track CTX state
        ctxCallbackToRequest[callbackSender] = _requestId;
        ctxCallbackToProvider[callbackSender] = msg.sender;
        lastCTXSender = callbackSender;

        // Create a placeholder offer (will be filled by onDecrypt)
        offers[_requestId][msg.sender] = EncryptedOffer({
            provider: msg.sender,
            offerHash: keccak256(abi.encodePacked(_requestId, msg.sender, block.number)),
            revealedPrice: 0,
            revealed: false,
            accepted: false
        });
        requestBidders[_requestId].push(msg.sender);

        emit CTXOfferSubmitted(_requestId, msg.sender, callbackSender);
    }

    /**
     * @notice BITE callback — called by validators after decrypting CTX data.
     *         Automatically reveals the offer with the decrypted price.
     *
     * @param decryptedArguments Array of decrypted byte arrays (index 0 = price)
     * @param plaintextArguments Array of plaintext byte arrays (index 0 = requestId, index 1 = provider)
     */
    function onDecrypt(
        bytes[] calldata decryptedArguments,
        bytes[] calldata plaintextArguments
    ) external override {
        // Verify the callback is from a valid CTX sender
        require(ctxCallbackToRequest[msg.sender] != 0 || msg.sender == lastCTXSender, "Unauthorized CTX callback");

        // Decode plaintext context
        uint256 requestId = abi.decode(plaintextArguments[0], (uint256));
        address provider = abi.decode(plaintextArguments[1], (address));

        // Decode the decrypted price
        uint256 decryptedPrice = abi.decode(decryptedArguments[0], (uint256));

        // Auto-reveal the offer with decrypted data
        EncryptedOffer storage offer = offers[requestId][provider];
        require(!offer.revealed, "Already revealed");

        offer.revealedPrice = decryptedPrice;
        offer.revealed = true;

        emit CTXOfferDecrypted(requestId, provider, decryptedPrice);
        emit OfferRevealed(requestId, provider, decryptedPrice);
    }

    // ──────────────────────── x402: Payment Settlement ────────────────────────

    /**
     * @notice Accept an offer and settle payment via x402.
     *         Only the requester can call this. Transfers funds to the provider.
     *         On SKALE this is gasless — the perfect demo of agentic commerce.
     */
    function settlePayment(
        uint256 _requestId,
        address _provider
    ) external {
        ServiceRequest storage req = requests[_requestId];
        require(msg.sender == req.requester, "Only requester can settle");
        require(req.status == RequestStatus.Open, "Request not open");

        EncryptedOffer storage offer = offers[_requestId][_provider];
        require(offer.revealed, "Offer not revealed yet");
        require(offer.revealedPrice <= req.budget, "Price exceeds budget");

        // Mark as settled
        req.status = RequestStatus.Settled;
        offer.accepted = true;

        // Transfer payment (x402-style instant settlement)
        (bool success, ) = payable(_provider).call{value: offer.revealedPrice}("");
        require(success, "Payment transfer failed");

        // Refund remaining budget to requester
        uint256 refund = req.budget - offer.revealedPrice;
        if (refund > 0) {
            (bool refundSuccess, ) = payable(req.requester).call{value: refund}("");
            require(refundSuccess, "Refund failed");
        }

        emit PaymentSettled(_requestId, _provider, offer.revealedPrice, "x402");
    }

    // ──────────────────────── View Helpers ────────────────────────

    function getRequestBidders(uint256 _requestId) external view returns (address[] memory) {
        return requestBidders[_requestId];
    }

    function getOffer(uint256 _requestId, address _provider) external view returns (EncryptedOffer memory) {
        return offers[_requestId][_provider];
    }

    /// @notice Check if a CTX callback sender is registered
    function getCTXInfo(address _callbackSender) external view returns (uint256 requestId, address provider) {
        return (ctxCallbackToRequest[_callbackSender], ctxCallbackToProvider[_callbackSender]);
    }

    /**
     * @notice Rate a service after completion. Updates the provider's on-chain reputation score.
     *         Uses a moving average calculation: newRating = ((oldRating * count) + newRate) / (count + 1).
     */
    function rateService(uint256 _serviceId, uint8 _rating) external {
        require(_rating <= 50, "Rating must be 0-50 (e.g. 50 = 5.0)");
        Service storage svc = services[_serviceId];
        require(svc.provider != address(0), "Service not found");

        // Calculate new moving average
        // Cast to uint256 to avoid overflow during calculation
        uint256 currentTotal = uint256(svc.rating) * svc.ratingCount;
        uint256 newTotal = currentTotal + _rating;
        
        svc.ratingCount++;
        svc.rating = uint8(newTotal / svc.ratingCount);

        emit ServiceRated(_serviceId, msg.sender, _rating);
    }
}
