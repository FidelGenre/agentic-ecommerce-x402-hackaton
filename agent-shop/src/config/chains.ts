import { defineChain } from 'viem'

export const skaleCalypsoHub = defineChain({
    id: 1_564_830_818,
    name: 'SKALE Calypso Hub',
    nativeCurrency: {
        decimals: 18,
        name: 'sFUEL',
        symbol: 'sFUEL',
    },
    rpcUrls: {
        default: { http: ['https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague'] },
    },
    blockExplorers: {
        default: { name: 'SKALE Explorer', url: 'https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com' },
    },
    testnet: false,
})

// Backward-compatible alias
export const skaleChaosTestnet = skaleCalypsoHub
