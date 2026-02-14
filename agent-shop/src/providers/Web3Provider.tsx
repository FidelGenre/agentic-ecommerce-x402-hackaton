'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import {
    RainbowKitProvider,
    darkTheme,
    connectorsForWallets,
} from '@rainbow-me/rainbowkit'
import {
    coinbaseWallet,
    metaMaskWallet,
    rainbowWallet,
    walletConnectWallet,
    okxWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { skaleBiteSandbox } from '@/config/chains'
import { createConfig, http } from 'wagmi'

const queryClient = new QueryClient()

const connectors = connectorsForWallets(
    [
        {
            groupName: 'Recommended',
            wallets: [
                coinbaseWallet, // Explicitly listed first
                metaMaskWallet, // Explicitly listed second
                rainbowWallet,
                walletConnectWallet,
            ],
        },
        {
            groupName: 'Others',
            wallets: [
                okxWallet, // Explicitly listed so it has its own button and doesn't hijack "Browser Wallet"
            ],
        },
    ],
    {
        appName: 'Agent Shop',
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '3a8170812b534d0ff9d794f19a901d64',
    }
)

const config = createConfig({
    connectors,
    chains: [skaleBiteSandbox],
    transports: {
        [skaleBiteSandbox.id]: http(process.env.NEXT_PUBLIC_SKALE_RPC_URL || 'https://base-sepolia-testnet.skalenodes.com/v1/bite-v2-sandbox'),
    },
    pollingInterval: 250, // Optimize for SKALE instant finality
    ssr: true,
})

export function Web3Provider({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: '#10b981', // Emerald-500
                        accentColorForeground: 'black',
                        borderRadius: 'medium',
                    })}
                    modalSize="compact"
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
