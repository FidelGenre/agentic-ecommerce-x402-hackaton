'use client'

import { AgentLog } from '@/hooks/useAgent'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { Terminal, Cpu, ShieldCheck, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentTerminalProps {
    logs: AgentLog[]
    status: string
}

export function AgentTerminal({ logs, status }: AgentTerminalProps) {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    const getIcon = (type: AgentLog['type']) => {
        switch (type) {
            case 'thought': return <Cpu className="w-4 h-4 text-purple-400" />
            case 'action': return <Zap className="w-4 h-4 text-yellow-400" />
            case 'tx': return <ShieldCheck className="w-4 h-4 text-green-400" />
            case 'error': return <span className="text-red-500">⚠</span>
            default: return <span className="text-blue-400">ℹ</span>
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto backdrop-blur-md bg-black/60 border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-purple-500/10 font-mono text-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-2 text-xs text-white/50">
                    <Terminal className="w-4 h-4" />
                    <span>AGENT_CORE_V1.0</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                            status === 'IDLE' ? 'bg-gray-400' : 'bg-green-400')}></span>
                        <span className={cn("relative inline-flex rounded-full h-2 w-2",
                            status === 'IDLE' ? 'bg-gray-500' : 'bg-green-500')}></span>
                    </span>
                    <span className="text-xs uppercase tracking-wider text-white/70">{status}</span>
                </div>
            </div>

            {/* Logs Area */}
            <div className="h-[300px] overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <AnimatePresence initial={false}>
                    {logs.map((log, i) => (
                        <motion.div
                            key={log.timestamp + i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex gap-3"
                        >
                            <div className="mt-0.5 opacity-70">{getIcon(log.type)}</div>
                            <div className="flex-1">
                                <div className={cn("leading-relaxed",
                                    log.type === 'thought' ? 'text-purple-200' :
                                        log.type === 'tx' ? 'text-green-300' :
                                            log.type === 'error' ? 'text-red-400' : 'text-gray-300'
                                )}>
                                    {log.content}
                                </div>
                                {log.metadata && (
                                    <pre className="mt-1 text-xs text-white/30 truncate">
                                        {JSON.stringify(log.metadata)}
                                    </pre>
                                )}
                            </div>
                            <div className="text-[10px] text-white/20 pt-1">
                                {new Date(log.timestamp).toLocaleTimeString()}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={bottomRef} />
            </div>
        </div>
    )
}
