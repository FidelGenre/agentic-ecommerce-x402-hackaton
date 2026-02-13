
import { AgentLog } from '@/hooks/useAgent'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Activity, Zap, Shield, ExternalLink, CheckCircle2 } from 'lucide-react'

interface EventSidebarProps {
    logs: AgentLog[]
}

export function EventSidebar({ logs }: EventSidebarProps) {
    // Filter to show only important events in sidebar to keep it clean
    // We can show all logs, but stylized
    // Limit to last 50 events to prevent "going down too much"
    const reversedLogs = [...logs].reverse().slice(0, 50)

    return (
        <div className="h-full flex flex-col glass border-l border-white/5 bg-black/20 w-80 shrink-0 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold tracking-widest uppercase text-white/70">Live Activity</h3>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-[9px] text-cyan-400 font-mono">
                    REALTIME
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {reversedLogs.map((log) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative pl-4 border-l border-white/10"
                        >
                            {/* Timeline Dot */}
                            <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-black ${log.type === 'error' ? 'bg-red-500' :
                                log.type === 'tx' ? 'bg-purple-500' :
                                    log.type === 'action' ? 'bg-cyan-500' : 'bg-white/30'
                                }`} />

                            <div className="text-[10px] text-white/30 font-mono mb-1">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </div>

                            <div className={`text-xs ${log.type === 'error' ? 'text-red-400' :
                                log.type === 'tx' ? 'text-purple-300' :
                                    log.type === 'action' ? 'text-cyan-200' : 'text-white/70'
                                }`}>
                                {log.content}
                            </div>

                            {log.metadata?.hash && (
                                <a
                                    href={`https://base-sepolia-testnet-explorer.skalenodes.com/tx/${log.metadata.hash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white transition-colors w-fit bg-white/5 px-2 py-1 rounded-md"
                                >
                                    <span>{log.metadata.hash.slice(0, 6)}...{log.metadata.hash.slice(-4)}</span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {logs.length === 0 && (
                    <div className="text-center py-10 text-white/20 text-xs italic">
                        Waiting for events...
                    </div>
                )}
            </div>
        </div>
    )
}
