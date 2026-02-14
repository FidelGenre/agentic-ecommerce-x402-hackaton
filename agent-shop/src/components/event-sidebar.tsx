
import { AgentLog } from '@/hooks/useAgent'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Activity, Zap, Shield, ExternalLink, CheckCircle2, History, MessageSquare, Box } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EventSidebarProps {
    logs: AgentLog[]
}

export function EventSidebar({ logs }: EventSidebarProps) {
    const reversedLogs = [...logs].reverse().slice(0, 50)

    return (
        <aside className="h-full flex flex-col border-l border-white/5 bg-[#0a0a0c] w-80 shrink-0 overflow-hidden">
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
            <div className="h-64 border-t border-white/5 bg-white/[0.02] flex flex-col">
                <div className="p-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <History className="w-3.5 h-3.5 text-indigo-400" />
                        <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-white">Deal History</h3>
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                    <History className="w-8 h-8 mb-3" />
                    <p className="text-[10px] font-bold whitespace-nowrap">No completed deals yet</p>
                </div>
            </div>
        </aside>
    )
}
