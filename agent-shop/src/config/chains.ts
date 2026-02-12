import { defineChain } from 'viem'

export const skaleBiteSandbox = defineChain({
    id: 103_698_795,
    name: 'SKALE BITE V2 Sandbox',
    nativeCurrency: {
        decimals: 18,
        name: 'sFUEL',
        symbol: 'sFUEL',
    },
    rpcUrls: {
        default: { http: ['https://base-sepolia-testnet.skalenodes.com/v1/bite-v2-sandbox'] },
    },
    blockExplorers: {
        default: { name: 'SKALE Explorer', url: 'https://base-sepolia-testnet-explorer.skalenodes.com:10032' },
    },
    testnet: true,
})

// Update alias to point to the new Sandbox
export const skaleChaosTestnet = skaleBiteSandbox
