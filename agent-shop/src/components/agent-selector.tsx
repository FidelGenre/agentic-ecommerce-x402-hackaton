'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Bot, User, Skull, Briefcase, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AgentPersona {
    id: string
    name: string
    role: string
    description: string
    icon: any
    style: 'aggressive' | 'analytical' | 'diplomatic' | 'chaos'
}

export const AGENT_PERSONAS: AgentPersona[] = [

    {
        id: 'shark-buy',
        name: 'SHARK.BUY (Aggressive Arbitrage)',
        role: 'Aggressive Strategy',
        description: 'Executes "Arbitrage Pro" service. Hunts for price discrepancies on SKALE/Base.',
        icon: Skull,
        style: 'aggressive'
    },
    {
        id: 'snipe-bot',
        name: 'SNIPE.BOT (Precision Intel)',
        role: 'Analytical Strategy',
        description: 'Executes "Market Intel" service. Scans mempool for precision entry points.',
        icon: Bot,
        style: 'analytical'
    },
    {
        id: 'whale-cap',
        name: 'WHALE.CAP (High-Volume Yield)',
        role: 'High-Volume Strategy',
        description: 'Executes "Yield Scan" service. Allocates capital to highest APY pools.',
        icon: Briefcase,
        style: 'diplomatic'
    },

]

interface AgentSelectorProps {
    agents: AgentPersona[]
    selectedAgents: string[]
    onToggle: (agentId: string) => void
    onSelectAll?: () => void
    onDelete?: (id: string) => void
    mode?: 'single' | 'multi'
}

export function AgentSelector({ agents, selectedAgents, onToggle, onSelectAll, onDelete, mode = 'multi' }: AgentSelectorProps) {
    const isAllSelected = selectedAgents.length === agents.length

    return (
        <div className="w-full space-y-4">

            <div className="flex justify-between items-center mt-0">
                <h4 className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
                    {mode === 'single' ? 'SELECT YOUR AGENT' : 'SELECT BUYER AGENTS (MIN 2)'}
                </h4>
                {mode === 'multi' && onSelectAll && (
                    <button
                        onClick={onSelectAll}
                        className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        {isAllSelected ? 'Deselect All' : 'Select All'}
                    </button>
                )}
            </div>
            <div className="space-y-2">
                {agents.map((agent) => {
                    const isSelected = selectedAgents.includes(agent.id)
                    return (
                        <motion.button
                            key={agent.id}
                            onClick={() => onToggle(agent.id)}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                "relative w-full p-3 pr-10 rounded-2xl text-left border transition-all duration-300 group overflow-hidden",
                                isSelected
                                    ? "bg-purple-500/10 border-purple-500/30 shadow-[0_8px_20px_rgba(168,85,247,0.1)]"
                                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                            )}
                        >
                            {/* Selection Glow */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent pointer-events-none" />
                            )}

                            {/* Delete Button */}
                            {onDelete && (
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDelete(agent.id)
                                    }}
                                    className="absolute right-2 bottom-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-500/20 rounded-lg text-white/20 hover:text-red-400"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </div>
                            )}

                            <div className="flex items-center gap-4 relative z-10">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110",
                                    agent.style === 'aggressive' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                                        agent.style === 'analytical' ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" :
                                            "bg-purple-500/10 border-purple-500/20 text-purple-400"
                                )}>
                                    <agent.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="text-xs font-black text-white uppercase tracking-tight truncate">{agent.name}</span>
                                        {isSelected && (
                                            <div className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-[8px] font-black uppercase tracking-widest border border-purple-500/20">
                                                Active
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest truncate">{agent.role}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}
