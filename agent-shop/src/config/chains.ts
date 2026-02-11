import { defineChain } from 'viem'

export const skaleBaseTestnet = defineChain({
    id: 324_705_682,
    name: 'SKALE Base Sepolia',
    nativeCurrency: {
        decimals: 18,
        name: 'CREDIT',
        symbol: 'CREDIT',
    },
    rpcUrls: {
        default: { http: ['https://base-sepolia-testnet.skalenodes.com/v1/jubilant-horrible-ancha'] },
    },
    blockExplorers: {
        default: { name: 'SKALE Explorer', url: 'https://jubilant-horrible-ancha.explorer.base-sepolia-testnet.skalenodes.com' },
    },
    testnet: true,
})

// Backward-compatible alias
export const skaleChaosTestnet = skaleBaseTestnet
