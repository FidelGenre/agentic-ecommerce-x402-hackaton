// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ServiceMarketplace
 * @notice Decentralized marketplace for autonomous agent service arbitrage on SKALE.
 *         Implements x402-style payment flows and BITE (commit-reveal) offer logic.
 */
contract ServiceMarketplace {
    // ──────────────────────── Types ────────────────────────
    struct Service {
        address provider;
        string name;
        string description;
        uint256 pricePerUnit; // in wei (sFUEL)
        bool active;
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
        bytes32 offerHash;     // BITE: keccak256(price, nonce) — hidden until reveal
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

    // ──────────────────────── Events ────────────────────────
    event ServiceRegistered(uint256 indexed serviceId, address indexed provider, string name, uint256 price);
    event ServiceRequestCreated(uint256 indexed requestId, address indexed requester, uint256 serviceId, uint256 budget);
    event EncryptedOfferSubmitted(uint256 indexed requestId, address indexed provider, bytes32 offerHash);
    event OfferRevealed(uint256 indexed requestId, address indexed provider, uint256 price);
    event PaymentSettled(uint256 indexed requestId, address indexed provider, uint256 amount, string protocol);

    // ──────────────────────── Service Registry ────────────────────────

    /**
     * @notice Register a new service as a provider agent.
     */
    function registerService(
        string calldata _name,
        string calldata _description,
        uint256 _pricePerUnit
    ) external returns (uint256 serviceId) {
        serviceId = nextServiceId++;
        services[serviceId] = Service({
            provider: msg.sender,
            name: _name,
            description: _description,
            pricePerUnit: _pricePerUnit,
            active: true
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

    // ──────────────────────── BITE: Commit-Reveal Offers ────────────────────────

    /**
     * @notice Submit an encrypted (hashed) offer for a request.
     *         The hash = keccak256(abi.encodePacked(price, nonce))
     *         This prevents front-running and hides the bid until reveal.
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
        require(computedHash == offer.offerHash, "Hash mismatch — invalid reveal");

        offer.revealedPrice = _price;
        offer.revealed = true;

        emit OfferRevealed(_requestId, msg.sender, _price);
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
}
