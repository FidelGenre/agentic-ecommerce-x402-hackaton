'use client'

import { AgentLog } from '@/hooks/useAgent'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface AgentTerminalProps {
    logs: AgentLog[]
    status: string
}

const STEP_COLORS: Record<string, string> = {
    thought: 'text-purple-300',
    action: 'text-cyan-300',
    tx: 'text-green-300',
    error: 'text-red-400',
    info: 'text-white/60',
}

const STEP_ICONS: Record<string, string> = {
    thought: '🧠',
    action: '⚡',
    tx: '✅',
    error: '❌',
    info: '📋',
}

const STEP_BG: Record<string, string> = {
    thought: 'border-l-purple-500/40',
    action: 'border-l-cyan-500/40',
    tx: 'border-l-green-500/40',
    error: 'border-l-red-500/40',
    info: 'border-l-white/10',
}

export function AgentTerminal({ logs, status }: AgentTerminalProps) {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    const stateLabel = (s: string) => {
        switch (s) {
            case 'THINKING': return { text: 'AI REASONING', color: 'bg-purple-500', pulse: true }
            case 'NEGOTIATING': return { text: 'BITE ENCRYPTION', color: 'bg-cyan-500', pulse: true }
            case 'TRANSACTING': return { text: 'x402 SETTLEMENT', color: 'bg-green-500', pulse: true }
            case 'COMPLETED': return { text: 'COMPLETE', color: 'bg-green-500', pulse: false }
            case 'ERROR': return { text: 'ERROR', color: 'bg-red-500', pulse: false }
            default: return { text: 'READY', color: 'bg-gray-500', pulse: false }
        }
    }

    const state = stateLabel(status)

    return (
        <div className="w-full glass-strong rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                    {/* Traffic Lights */}
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="text-xs text-white/40 font-mono tracking-wider">
                        AGENT_CORE — BITE V2 Sandbox
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        {state.pulse && (
                            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", state.color)} />
                        )}
                        <span className={cn("relative inline-flex rounded-full h-2 w-2", state.color)} />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-white/60 font-mono font-semibold">
                        {state.text}
                    </span>
                </div>
            </div>

            {/* Network Info Bar */}
            <div className="px-5 py-2 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                <span className="tech-badge badge-purple">SKALE</span>
                <span className="tech-badge badge-cyan">BITE V2</span>
                <span className="tech-badge badge-green">x402</span>
                <span className="tech-badge badge-amber">Gemini</span>
                <span className="text-[10px] text-white/20 ml-auto font-mono">Chain: 103698795</span>
            </div>

            {/* Logs */}
            <div className="h-[350px] overflow-y-auto p-4 space-y-2 terminal-scroll font-mono text-sm">
                <AnimatePresence initial={false}>
                    {logs.map((log, i) => (
                        <motion.div
                            key={log.timestamp + '-' + i}
                            initial={{ opacity: 0, x: -10, height: 0 }}
                            animate={{ opacity: 1, x: 0, height: 'auto' }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className={cn(
                                "flex gap-3 pl-3 border-l-2 py-1",
                                STEP_BG[log.type] || 'border-l-white/10'
                            )}
                        >
                            <span className="text-xs mt-0.5 select-none">
                                {STEP_ICONS[log.type] || '•'}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className={cn(
                                    "leading-relaxed text-[13px]",
                                    STEP_COLORS[log.type] || 'text-white/60'
                                )}>
                                    {log.content}
                                </div>
                                {log.metadata && (
                                    <div className="mt-1 text-[10px] text-white/20 font-mono truncate">
                                        {typeof log.metadata === 'string'
                                            ? log.metadata
                                            : JSON.stringify(log.metadata)}
                                    </div>
                                )}
                            </div>
                            <div className="text-[10px] text-white/15 pt-0.5 whitespace-nowrap shrink-0">
                                {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {status !== 'IDLE' && status !== 'COMPLETED' && status !== 'ERROR' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 pl-3 py-2"
                    >
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-[11px] text-white/30">Processing...</span>
                    </motion.div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Footer Status */}
            {status === 'COMPLETED' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-5 py-3 border-t border-green-500/20 bg-green-500/5 flex items-center justify-between"
                >
                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                        <span>✅</span> Agent flow completed successfully
                    </div>
                    <div className="text-[10px] text-green-400/50 font-mono">
                        0 gas • instant finality • MEV protected
                    </div>
                </motion.div>
            )}
        </div>
    )
}
