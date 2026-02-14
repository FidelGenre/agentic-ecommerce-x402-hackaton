
import { AgentLog } from '@/hooks/useAgent'
import { Receipt } from '@/app/page'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, History, ExternalLink, ShieldCheck, Activity, X, Zap, Shield, CheckCircle2, MessageSquare, Box, ShoppingCart, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EventSidebarProps {
    logs: AgentLog[]
    deals: Receipt[]
    onClose?: () => void
}

export function EventSidebar({ logs, deals, onClose }: EventSidebarProps) {
    const reversedLogs = [...logs].reverse().slice(0, 50)

    return (
        <aside className="h-full flex flex-col border-l border-white/5 bg-[#0a0a0c] w-full overflow-hidden relative">
            {/* Mobile Close Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="xl:hidden absolute top-4 right-4 p-2.5 bg-black/60 rounded-xl border border-white/20 text-white shadow-2xl z-[60] active:scale-95 transition-all"
                >
                    <X className="w-5 h-5" />
                </button>
            )}

            {/* Contract Events Section */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/5 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Box className="w-3.5 h-3.5 text-green-400" />
                        <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-white">Contract Events</h3>
                    </div>
                    <p className="text-[9px] text-white/20 font-bold">Auto-executed on deal - no approval needed</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    <AnimatePresence initial={false}>
                        {reversedLogs.length > 0 ? (
                            reversedLogs.map((log) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="relative pl-4 border-l border-white/5 pb-4 last:pb-0"
                                >
                                    <div className={cn(
                                        "absolute -left-[3px] top-1 w-1.5 h-1.5 rounded-full border border-black",
                                        log.type === 'error' ? 'bg-red-500' :
                                            log.type === 'tx' ? 'bg-purple-500' :
                                                log.type === 'action' ? 'bg-cyan-500' : 'bg-white/20'
                                    )} />

                                    <div className="text-[9px] text-white/20 font-mono mb-1 flex justify-between items-center">
                                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                                        {log.type.toUpperCase()}
                                    </div>

                                    <div className={cn(
                                        "text-[11px] leading-relaxed font-bold",
                                        log.type === 'error' ? 'text-red-400' :
                                            log.type === 'tx' ? 'text-purple-300' :
                                                log.type === 'action' ? 'text-cyan-200' : 'text-white/60'
                                    )}>
                                        {log.content}
                                    </div>

                                    {log.metadata?.hash && (
                                        <a
                                            href={`https://base-sepolia-testnet-explorer.skalenodes.com/tx/${log.metadata.hash}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-2 flex items-center gap-1.5 text-[9px] text-white/30 hover:text-white transition-colors w-fit border border-white/10 px-2 py-0.5 rounded"
                                        >
                                            <span>HASH: {log.metadata.hash.slice(0, 6)}...{log.metadata.hash.slice(-4)}</span>
                                            <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
                                <Box className="w-12 h-12 mb-4" />
                                <p className="text-[11px] font-bold">No events yet</p>
                                <p className="text-[9px] max-w-[150px] text-center">Smart contracts auto-execute when agents reach a deal</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Deal History Section */}
            <div className="h-72 border-t border-white/5 bg-white/[0.02] flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                    <div className="flex items-center gap-2">
                        <History className="w-3.5 h-3.5 text-indigo-400" />
                        <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-white">Deal History</h3>
                    </div>
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded">{deals.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    <AnimatePresence initial={false}>
                        {deals.length > 0 ? (
                            deals.map((deal) => (
                                <motion.div
                                    key={deal.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
                                                <ShoppingCart className="w-3 h-3 text-indigo-400" />
                                            </div>
                                            <div className="text-[11px] font-black text-white/90 truncate max-w-[120px]">
                                                {deal.cartMandate.item}
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-black text-green-400">
                                            {deal.cartMandate.finalPrice} <span className="text-[8px] opacity-60">sFUEL</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-[9px] font-bold">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-white/20 uppercase tracking-tighter">Negotiator</span>
                                            <span className="text-white/60 flex items-center gap-1">
                                                <Trophy className="w-2.5 h-2.5 text-yellow-500/50" />
                                                {deal.cartMandate.agentId}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-0.5 text-right">
                                            <span className="text-white/20 uppercase tracking-tighter">Status</span>
                                            <span className="text-green-500/80 uppercase">Settled</span>
                                        </div>
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-[8px] text-white/10 font-mono">
                                            {new Date(deal.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[8px] text-white/30 uppercase tracking-widest font-black">Verified On-Chain</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-20 py-10">
                                <History className="w-8 h-8 mb-3" />
                                <p className="text-[10px] font-bold whitespace-nowrap">No completed deals yet</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </aside>
    )
}
