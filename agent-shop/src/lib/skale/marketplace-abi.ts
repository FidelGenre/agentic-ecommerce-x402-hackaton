// ABI for ServiceMarketplace contract (auto-generated from Foundry build output)
// Only includes the functions we call from the frontend agent engine.

export const SERVICE_MARKETPLACE_ABI = [
    // Service Registry
    {
        type: "function",
        name: "registerService",
        inputs: [
            { name: "_name", type: "string" },
            { name: "_description", type: "string" },
            { name: "_pricePerUnit", type: "uint256" },
            { name: "_uptime", type: "uint8" },
            { name: "_rating", type: "uint8" },
        ],
        outputs: [{ name: "serviceId", type: "uint256" }],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "createRequest",
        inputs: [
            { name: "_serviceId", type: "uint256" },
            { name: "_objective", type: "string" },
        ],
        outputs: [{ name: "requestId", type: "uint256" }],
        stateMutability: "payable",
    },
    // BITE Commit-Reveal
    {
        type: "function",
        name: "submitEncryptedOffer",
        inputs: [
            { name: "_requestId", type: "uint256" },
            { name: "_offerHash", type: "bytes32" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "revealOffer",
        inputs: [
            { name: "_requestId", type: "uint256" },
            { name: "_price", type: "uint256" },
            { name: "_nonce", type: "uint256" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    // x402 Payment Settlement
    {
        type: "function",
        name: "settlePayment",
        inputs: [
            { name: "_requestId", type: "uint256" },
            { name: "_provider", type: "address" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    // View
    {
        type: "function",
        name: "getRequestBidders",
        inputs: [{ name: "_requestId", type: "uint256" }],
        outputs: [{ name: "", type: "address[]" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "nextServiceId",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "services",
        inputs: [{ name: "", type: "uint256" }],
        outputs: [
            { name: "provider", type: "address" },
            { name: "name", type: "string" },
            { name: "description", type: "string" },
            { name: "pricePerUnit", type: "uint256" },
            { name: "uptime", type: "uint8" },
            { name: "rating", type: "uint8" },
            { name: "isRegistered", type: "bool" },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "nextRequestId",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    // Events
    {
        type: "event",
        name: "ServiceRegistered",
        inputs: [
            { name: "serviceId", type: "uint256", indexed: true },
            { name: "provider", type: "address", indexed: true },
            { name: "name", type: "string", indexed: false },
            { name: "price", type: "uint256", indexed: false },
        ],
    },
    {
        type: "event",
        name: "ServiceRequestCreated",
        inputs: [
            { name: "requestId", type: "uint256", indexed: true },
            { name: "requester", type: "address", indexed: true },
            { name: "serviceId", type: "uint256", indexed: false },
            { name: "budget", type: "uint256", indexed: false },
        ],
    },
    {
        type: "event",
        name: "EncryptedOfferSubmitted",
        inputs: [
            { name: "requestId", type: "uint256", indexed: true },
            { name: "provider", type: "address", indexed: true },
            { name: "offerHash", type: "bytes32", indexed: false },
        ],
    },
    {
        type: "event",
        name: "OfferRevealed",
        inputs: [
            { name: "requestId", type: "uint256", indexed: true },
            { name: "provider", type: "address", indexed: true },
            { name: "price", type: "uint256", indexed: false },
        ],
    },
    {
        type: "event",
        name: "PaymentSettled",
        inputs: [
            { name: "requestId", type: "uint256", indexed: true },
            { name: "provider", type: "address", indexed: true },
            { name: "amount", type: "uint256", indexed: false },
            { name: "protocol", type: "string", indexed: false },
        ],
    },
] as const;
