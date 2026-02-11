import { createConfig, http } from 'wagmi'
import { skaleChaosTestnet } from '@/config/chains'

export const config = createConfig({
    chains: [skaleChaosTestnet],
    transports: {
        [skaleChaosTestnet.id]: http(process.env.NEXT_PUBLIC_SKALE_RPC_URL || 'https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix'),
    },
})
