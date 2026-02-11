import { defineChain } from 'viem'

export const skaleChaosTestnet = defineChain({
    id: 1_351_057_110,
    name: 'SKALE Chaos Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'sFUEL',
        symbol: 'sFUEL',
    },
    rpcUrls: {
        default: { http: ['https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix'] },
    },
    blockExplorers: {
        default: { name: 'SKALE Explorer', url: 'https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com' },
    },
    testnet: true,
})
