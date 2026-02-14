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
        name: 'SHARK.buy',
        role: 'Aggressive Negotiator',
        description: 'Lowballs relentlessly and threatens to walk away.',
        icon: Skull,
        style: 'aggressive'
    },
    {
        id: 'snipe-bot',
        name: 'SNIPE.bot',
        role: 'Precision Bidder',
        description: 'Analyzes market value and bids exactly +1 wei over competitors.',
        icon: Bot,
        style: 'analytical'
    },
    {
        id: 'whale-cap',
        name: 'WHALE.cap',
        role: 'High Volume Trader',
        description: 'Uses bulk capital to intimidate, but respects quality.',
        icon: Briefcase,
        style: 'diplomatic'
    }
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
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">
                    {mode === 'single' ? 'Select Your Agent' : 'Select Buyer Agents (Min 2)'}
                </h3>
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
                                "relative w-full p-3 rounded-2xl text-left border transition-all duration-300 group overflow-hidden",
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
                                    className="absolute right-2 top-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-500/20 rounded-lg text-white/20 hover:text-red-400"
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
