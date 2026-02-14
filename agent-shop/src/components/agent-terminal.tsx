import { AgentLog } from '@/hooks/useAgent'
import { Item } from '@/components/item-selector'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Box, Circle, Globe, Shield, Zap, TrendingUp, DollarSign, Activity } from 'lucide-react'

interface AgentTerminalProps {
    logs: AgentLog[]
    status: string
    targetItem?: Item | null
}

export function AgentTerminal({ logs, status, targetItem }: AgentTerminalProps) {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    return (
        <div className="w-full flex-1 flex flex-col min-h-0 bg-[#050505]">
            {/* Terminal Window */}
            <div className="flex-1 flex flex-col bg-[#0a0a0c] border border-white/5 rounded-3xl overflow-hidden shadow-2xl m-4">
                {/* Window Header (Agents OS Style) */}
                <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
                        </div>
                        <div className="h-4 w-px bg-white/10 mx-1" />
                        <div className="flex items-center gap-2">
                            <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] font-mono">AGENT_CORE — BITE V2 SESSION</h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="hidden sm:flex badge-purple px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-purple-500/20 bg-purple-500/10 text-purple-400">SKALE</span>
                        <span className="hidden sm:flex badge-cyan px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">BITE V2</span>
                        <span className="hidden sm:flex badge-green px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-green-500/20 bg-green-500/10 text-green-400">x402</span>
                        <span className="hidden sm:flex badge-amber px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-amber-500/20 bg-amber-500/10 text-amber-400">Gemini</span>
                    </div>
                </div>

                {/* Instance Details */}
                <div className="px-6 py-3 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[8px] text-white/20 uppercase font-black tracking-widest leading-none mb-1">Status</span>
                            <div className="flex items-center gap-2">
                                <div className={cn("w-1.5 h-1.5 rounded-full", status === 'COMPLETED' ? 'bg-green-500' : 'bg-cyan-500 animate-pulse')} />
                                <span className="text-[10px] font-black text-white uppercase tracking-tighter leading-none">{status}</span>
                            </div>
                        </div>
                        {targetItem && (
                            <div className="flex flex-col border-l border-white/5 pl-6">
                                <span className="text-[8px] text-white/20 uppercase font-black tracking-widest leading-none mb-1">Target</span>
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter leading-none">{targetItem.name}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <Activity className="w-3 h-3 text-indigo-400" />
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Live Trace</span>
                    </div>
                </div>

                {/* Logs Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-black/40">
                    <AnimatePresence initial={false}>
                        {logs.length === 0 ? (
                            <div key="empty-terminal" className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center animate-spin-slow">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Initialize mission mandate...</p>
                            </div>
                        ) : (
                            logs.map((log, index) => (
                                <motion.div
                                    key={`${log.id}-${index}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={cn(
                                        "flex gap-4 group",
                                        log.type === 'thought' ? 'text-indigo-200/40' :
                                            log.type === 'action' ? 'text-cyan-200/40' :
                                                log.type === 'tx' ? 'text-green-300' : 'text-white/20'
                                    )}
                                >
                                    <div className="shrink-0 font-mono text-[10px] pt-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                        [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border",
                                                log.type === 'thought' ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' :
                                                    log.type === 'action' ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' :
                                                        log.type === 'tx' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                                                            'bg-white/10 border-white/20 text-white/40'
                                            )}>
                                                {log.type === 'thought' ? 'THINK' : log.type === 'action' ? 'ACTION' : log.type === 'tx' ? 'SETTLE' : 'INFO'}
                                            </span>
                                        </div>
                                        <p className={cn(
                                            "text-xs font-bold leading-relaxed transition-colors",
                                            log.type === 'thought' ? 'group-hover:text-indigo-200' :
                                                log.type === 'action' ? 'group-hover:text-cyan-200' :
                                                    log.type === 'tx' ? 'group-hover:text-green-300' : 'group-hover:text-white/60'
                                        )}>
                                            {log.content}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>

                    {/* Simulation Activity Loading */}
                    {status !== 'IDLE' && status !== 'COMPLETED' && (
                        <div className="flex items-center gap-4 pl-12 opacity-40">
                            <div className="flex gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce delay-75" />
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce delay-150" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Neural weights computing...</span>
                        </div>
                    )}
                    <div ref={bottomRef} className="h-4" />
                </div>

                {/* Command Line Footer */}
                <div className="px-6 py-3 border-t border-white/5 bg-white/[0.02] flex items-center gap-3">
                    <span className="text-green-500 font-mono text-xs">$</span>
                    <span className="text-white/20 font-mono text-[10px] uppercase tracking-widest animate-pulse">awaiting next instruction_</span>
                </div>
            </div>
        </div>
    )
}
