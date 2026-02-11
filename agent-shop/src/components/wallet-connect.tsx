'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

export function WalletConnect() {
    const { address, isConnected } = useAccount()
    const { connect } = useConnect()
    const { disconnect } = useDisconnect()

    if (isConnected) {
        return (
            <div className="flex items-center gap-4">
                <div className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-mono text-sm">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
                <button
                    onClick={() => disconnect()}
                    className="text-xs text-white/50 hover:text-white transition-colors"
                >
                    Disconnect
                </button>
            </div>
        )
    }

    return (
        <button
            onClick={() => connect({ connector: injected() })}
            className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all font-medium text-sm backdrop-blur-md"
        >
            Connect Agent Wallet
        </button>
    )
}
