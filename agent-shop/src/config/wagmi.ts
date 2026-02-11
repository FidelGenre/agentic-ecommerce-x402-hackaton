import { createConfig, http } from 'wagmi'
import { skaleCalypsoHub } from '@/config/chains'

export const config = createConfig({
    chains: [skaleCalypsoHub],
    transports: {
        [skaleCalypsoHub.id]: http(process.env.NEXT_PUBLIC_SKALE_RPC_URL || 'https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague'),
    },
})
