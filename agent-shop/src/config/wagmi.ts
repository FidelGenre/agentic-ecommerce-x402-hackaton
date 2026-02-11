import { createConfig, http } from 'wagmi'
import { skaleBaseTestnet } from '@/config/chains'

export const config = createConfig({
    chains: [skaleBaseTestnet],
    transports: {
        [skaleBaseTestnet.id]: http(process.env.NEXT_PUBLIC_SKALE_RPC_URL || 'https://base-sepolia-testnet.skalenodes.com/v1/jubilant-horrible-ancha'),
    },
})
