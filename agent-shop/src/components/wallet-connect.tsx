'use client'

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function WalletConnect() {
    const { address, isConnected } = useAccount()
    const { connect } = useConnect()
    const { disconnect } = useDisconnect()
    const { data: balance } = useBalance({ address })

    if (isConnected) {
        return (
            <div className="flex items-center gap-3">
                {balance && (
                    <div className="text-[10px] text-white/30 font-mono">
                        {(Number(balance.value) / 10 ** balance.decimals).toFixed(4)} {balance.symbol}
                    </div>
                )}
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => disconnect()}
                    className="group flex items-center gap-2 px-4 py-2 rounded-full glass glow-border cursor-pointer hover:border-red-500/30 transition-all"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 group-hover:bg-red-400" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 group-hover:bg-red-500 transition-colors" />
                    </span>
                    <span className="font-mono text-sm text-green-400 group-hover:hidden">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                    <span className="font-mono text-sm text-red-400 hidden group-hover:inline">
                        Disconnect
                    </span>
                </motion.button>
            </div>
        )
    }

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => connect({ connector: injected() })}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600/20 to-cyan-600/20 hover:from-purple-600/30 hover:to-cyan-600/30 border border-white/10 transition-all font-medium text-sm backdrop-blur-md text-white/70 hover:text-white"
        >
            Connect Wallet
        </motion.button>
    )
}
