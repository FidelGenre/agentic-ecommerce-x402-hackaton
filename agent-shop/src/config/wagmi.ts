import { createConfig, http } from 'wagmi'
import { coinbaseWallet, injected } from 'wagmi/connectors'
import { skaleBiteSandbox } from '@/config/chains'

export const config = createConfig({
    chains: [skaleBiteSandbox],
    connectors: [
        coinbaseWallet({
            appName: 'Agent Shop',
            preference: 'all'
        }),
        injected()
    ],
    transports: {
        [skaleBiteSandbox.id]: http(process.env.NEXT_PUBLIC_SKALE_RPC_URL || 'https://base-sepolia-testnet.skalenodes.com/v1/bite-v2-sandbox'),
    },
})
