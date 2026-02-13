'use client'

import { motion, AnimatePresence } from 'framer-motion'
// import { Card } from '@/components/ui/card' // Removed unused import
import { AgentLog } from '@/hooks/useAgent'
import { cn } from '@/lib/utils'
import { AgentPersona } from './agent-selector'
import { Item } from './item-selector'
import { Zap, Trophy, TrendingDown, Clock, Lock, Shield } from 'lucide-react'

// Define a type for an agent's runtime state in the battle
export interface BattleAgent {
    persona: AgentPersona
    status: 'idle' | 'bidding' | 'holding' | 'dropped' | 'winner'
    currentBid: number
    logs: AgentLog[]
}

interface NegotiationViewProps {
    agents: BattleAgent[]
    targetItem: Item
    round: number
}

export function NegotiationView({ agents, targetItem, round }: NegotiationViewProps) {
    // Find current best bid
    const bestBid = Math.max(...agents.map(a => a.currentBid))
    const leader = agents.find(a => a.currentBid === bestBid)

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Battle Header */}
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                        <targetItem.icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-1">{targetItem.name}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-white/50">
                        <div className="flex items-center gap-1 text-cyan-300">
                            <Shield className="w-3 h-3" />
                            {targetItem.provider}
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                            <span>★</span> {targetItem.trustScore}
                        </div>
                        <span className="text-white/20">|</span>
                        <span className="text-cyan-400">Base: {targetItem.basePrice} SKL</span>
                        <span className="text-white/20">|</span>
                        <div className="flex items-center gap-1 text-red-400/80 font-mono" title="Safety Guardrail: Max Spend Cap">
                            <TrendingDown className="w-3 h-3 rotate-180" />
                            <span>Cap: {Math.floor(targetItem.basePrice * 1.5)}</span>
                        </div>
                        <span className="text-white/20">|</span>
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Round {round} / 5</span>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Current Best Offer</div>
                    <div className="text-2xl font-bold text-green-400 flex items-center justify-end gap-2">
                        {bestBid > 0 ? `${bestBid} SKL` : '---'}
                        <TrendingDown className="w-5 h-5" />
                    </div>
                    {leader && <div className="text-xs text-white/40">Leader: {leader.persona.name}</div>}
                </div>
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => (
                    <motion.div
                        key={agent.persona.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                            "relative flex flex-col h-[300px] rounded-xl border overflow-hidden transition-colors",
                            agent.status === 'winner' ? "bg-green-500/10 border-green-500/50" :
                                agent.status === 'dropped' ? "bg-red-500/5 border-red-500/20 opacity-60" :
                                    "bg-black/40 border-white/10"
                        )}
                    >
                        {/* Agent Header */}
                        <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <div className="flex items-center gap-2">
                                <agent.persona.icon className="w-4 h-4 text-white/70" />
                                <span className="font-bold text-sm text-white/90">{agent.persona.name}</span>
                            </div>
                            <div className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-mono",
                                agent.status === 'bidding' ? "bg-cyan-500/20 text-cyan-400 animate-pulse" :
                                    agent.status === 'winner' ? "bg-green-500/20 text-green-400" :
                                        "bg-white/10 text-white/40"
                            )}>
                                {agent.status.toUpperCase()}
                            </div>
                        </div>

                        {/* Logs Area (Terminal Style) */}
                        <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-2 custom-scrollbar bg-black/20">
                            {agent.logs.map((log) => (
                                <div key={log.id} className={cn(
                                    "opacity-80 break-words",
                                    log.type === 'thought' ? "text-purple-300 italic" :
                                        log.type === 'action' ? "text-cyan-300" :
                                            log.type === 'error' ? "text-red-400" :
                                                "text-white/60"
                                )}>
                                    <span className="opacity-30 mr-2">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, second: '2-digit', minute: '2-digit' })}</span>
                                    {log.content}
                                </div>
                            ))}
                        </div>

                        {/* Current Bid Footer */}
                        <div className="p-3 border-t border-white/5 bg-white/5 flex justify-between items-center">
                            <span className="text-xs text-white/40">Latest Bid</span>
                            <span className="font-bold font-mono text-white/90">
                                {agent.status === 'winner' || agent.status === 'dropped' ? (
                                    agent.currentBid > 0 ? `${agent.currentBid} SKL` : '---'
                                ) : (
                                    <div className="flex items-center gap-2 text-cyan-400 text-xs uppercase tracking-wider">
                                        <Lock className="w-3 h-3" />
                                        Encrypted
                                    </div>
                                )}
                            </span>
                        </div>

                        {/* Winner Badge */}
                        {agent.status === 'winner' && (
                            <div className="absolute top-2 right-2">
                                <Trophy className="w-6 h-6 text-yellow-500 fill-current drop-shadow-lg" />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
