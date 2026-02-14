'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AgentLog } from '@/hooks/useAgent'
import { cn } from '@/lib/utils'
import { AgentPersona } from './agent-selector'
import { Item } from './item-selector'
import { Zap, Trophy, TrendingDown, Clock, Lock as LockIcon, Shield, Box, Globe, Activity, Users } from 'lucide-react'

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
    onSettle?: () => void
}

export function NegotiationView({ agents, targetItem, round, onSettle }: NegotiationViewProps) {
    // Find current best bid
    const bestBid = Math.max(...agents.map(a => a.currentBid))
    const leader = agents.find(a => a.currentBid === bestBid)
    const winner = agents.find(a => a.status === 'winner')

    return (
        <div className="w-full flex flex-col h-full">
            {/* Item Header (Agents OS Style) */}
            <div className="mb-8 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-start justify-between group hover:bg-white/[0.04] transition-all">
                <div className="flex items-start gap-8">
                    <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover:scale-105 transition-transform shadow-[0_0_30px_rgba(34,211,238,0.1)]">
                        <targetItem.icon className="w-10 h-10 text-cyan-400" />
                    </div>
                    <div className="pt-1">
                        <div className="flex items-center gap-4 mb-2">
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">{targetItem.name}</h2>
                            <span className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest border border-cyan-500/20">
                                {targetItem.rarity || 'RARE'}
                            </span>
                        </div>
                        <div className="flex items-center gap-6 text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">
                            <span className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> SKALE NEBULA</span>
                            <span className="flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> AGENT MESH</span>
                            <span className="flex items-center gap-2 text-yellow-500/50">★ {targetItem.trustScore} TRUST SCORE</span>
                        </div>
                    </div>
                </div>

                <div className="text-right pt-1">
                    <div className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-2 px-3 py-1 bg-white/5 rounded-full inline-block">
                        Battle Stage: Round {round}/5
                    </div>
                    <div className="text-3xl font-black text-green-400 font-mono tracking-tighter">
                        {bestBid > 0 ? bestBid.toFixed(2) : targetItem.basePrice.toFixed(2)} <span className="text-sm">sFUEL</span>
                    </div>
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">
                        {leader ? `Leading: ${leader.persona.name}` : `Min. Bid: ${targetItem.basePrice}`}
                    </div>
                </div>
            </div>

            {/* Main Battle Area */}
            <div className="flex-1 flex gap-6 min-h-0 min-w-0">
                {/* Unified Battle Feed (Chat Style) */}
                <div className="flex-1 flex flex-col min-w-0 bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <div className="flex items-center gap-3">
                            <Activity className="w-4 h-4 text-indigo-400" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Real-time Negotiation Feed</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Live Engine</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {agents
                                .flatMap(agent => agent.logs.map(log => ({ ...log, agent })))
                                .sort((a, b) => a.timestamp - b.timestamp)
                                .map((log) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={cn(
                                            "flex flex-col gap-2 max-w-[85%]",
                                            log.agent.persona.id === agents[0].persona.id ? "self-start" : "self-end items-end"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 px-1">
                                            <div className="w-5 h-5 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                                <log.agent.persona.icon className="w-3 h-3 text-white/60" />
                                            </div>
                                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{log.agent.persona.name}</span>
                                        </div>

                                        <div className={cn(
                                            "p-4 rounded-2xl border text-xs relative",
                                            log.type === 'thought' ? "bg-indigo-500/5 border-indigo-500/10 text-indigo-300 italic opacity-60" :
                                                log.type === 'action' ? (
                                                    log.agent.persona.id === agents[0].persona.id
                                                        ? "bg-indigo-500/10 border-indigo-500/20 text-white rounded-tl-none shadow-[0_4px_15px_rgba(79,70,229,0.1)]"
                                                        : "bg-cyan-500/10 border-cyan-500/20 text-white rounded-tr-none shadow-[0_4px_15px_rgba(34,211,238,0.1)]"
                                                ) :
                                                    log.type === 'error' ? "bg-red-500/5 border-red-500/10 text-red-400" :
                                                        "bg-white/5 border-white/5 text-white/40"
                                        )}>
                                            {log.content}

                                            {log.type === 'action' && log.content.includes('FUEL') && (
                                                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                                                    <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Intent Bid</span>
                                                    <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[9px] font-black font-mono tracking-tighter border border-green-500/20">
                                                        {log.content.match(/\d+\.\d+/) ? log.content.match(/\d+\.\d+/)?.[0] : log.agent.currentBid.toFixed(2)} sFUEL
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                        </AnimatePresence>
                        {/* Auto-scroll anchor */}
                        <div key="anchor" ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
                    </div>
                </div>

                {/* Vertical Agent Grid (Right Side) */}
                <div className="w-64 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 px-2">Negotiators</h3>
                    {agents.map((agent) => (
                        <motion.div
                            key={agent.persona.id}
                            layout
                            className={cn(
                                "p-4 rounded-2xl border transition-all relative overflow-hidden shrink-0",
                                agent.status === 'winner' ? "bg-green-500/10 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]" :
                                    agent.status === 'dropped' ? "bg-red-500/[0.02] border-red-500/10 grayscale opacity-40" :
                                        "bg-white/[0.02] border-white/5"
                            )}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                        <agent.persona.icon className="w-3 h-3 text-white/60" />
                                    </div>
                                    <span className="font-black text-[10px] text-white uppercase tracking-tighter">{agent.persona.name}</span>
                                </div>
                                <div className={cn(
                                    "px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest",
                                    agent.status === 'bidding' ? "bg-cyan-500 text-black" :
                                        agent.status === 'winner' ? "bg-green-500 text-black" :
                                            "bg-white/10 text-white/40"
                                )}>
                                    {agent.status}
                                </div>
                            </div>

                            <div className="flex justify-between items-end">
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Current Offer</span>
                                <span className={cn(
                                    "font-black text-sm font-mono tracking-tighter",
                                    agent.currentBid > 0 ? "text-white" : "text-white/20"
                                )}>
                                    {agent.currentBid > 0 ? agent.currentBid.toFixed(2) : '---'}
                                </span>
                            </div>

                            {agent.status === 'winner' && (
                                <Trophy className="absolute -right-1 -bottom-1 w-12 h-12 text-yellow-500/10 -rotate-12" />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Victory / Settlement Action */}
            <AnimatePresence>
                {winner && onSettle && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 flex flex-col items-center gap-4"
                    >
                        <div className="p-1 px-4 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
                            Negotiation Outcome Achieved
                        </div>
                        <button
                            onClick={onSettle}
                            className="bg-green-500 hover:bg-green-400 text-black px-12 py-4 rounded-2xl font-black text-lg transition-all shadow-[0_0_50px_rgba(34,197,94,0.3)] hover:scale-105 active:scale-95 flex items-center gap-3"
                        >
                            <Trophy className="w-5 h-5" />
                            CONFIRM DEAL & SETTLE
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
