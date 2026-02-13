'use client'

import { motion } from 'framer-motion'
import { Bot, User, Skull, Briefcase } from 'lucide-react'
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
    selectedAgents: string[]
    onToggle: (agentId: string) => void
    onSelectAll?: () => void
    mode?: 'single' | 'multi'
}

export function AgentSelector({ selectedAgents, onToggle, onSelectAll, mode = 'multi' }: AgentSelectorProps) {
    const isAllSelected = selectedAgents.length === AGENT_PERSONAS.length

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
            <div className="grid grid-cols-1 gap-3">
                {AGENT_PERSONAS.map((agent) => {
                    const isSelected = selectedAgents.includes(agent.id)
                    return (
                        <motion.button
                            key={agent.id}
                            onClick={() => onToggle(agent.id)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={cn(
                                "relative p-3 rounded-xl text-left border transition-all duration-300 flex items-center gap-4",
                                isSelected
                                    ? "bg-white/10 border-white/30"
                                    : "bg-white/5 border-white/5 opacity-70 hover:opacity-100"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-lg",
                                agent.style === 'aggressive' ? "bg-red-500/20 text-red-400" :
                                    agent.style === 'analytical' ? "bg-cyan-500/20 text-cyan-400" :
                                        "bg-green-500/20 text-green-400"
                            )}>
                                <agent.icon className="w-5 h-5" />
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-white text-sm">{agent.name}</span>
                                    {isSelected && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full text-white">Active</span>}
                                </div>
                                <p className="text-xs text-white/40">{agent.description}</p>
                            </div>

                            {isSelected && (
                                <motion.div
                                    layoutId={`outline-${agent.id}`}
                                    className="absolute inset-0 border border-cyan-500/30 rounded-xl"
                                    initial={false}
                                />
                            )}
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}
