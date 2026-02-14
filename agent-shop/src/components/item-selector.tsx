'use client'

import { motion } from 'framer-motion'
import { Shield, Sword, Cpu, Zap, Box } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Item {
    id: string
    name: string
    description: string
    basePrice: number
    icon: any
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    provider: string
    trustScore: number
}

export const MOCK_ITEMS: Item[] = [
    {
        id: 'h100-cluster',
        name: 'H100 GPU Cluster (24h)',
        description: 'High-performance compute for AI training/inference.',
        basePrice: 0.8,
        icon: Cpu,
        rarity: 'legendary',
        provider: 'Nebula Cloud',
        trustScore: 4.9
    },
    {
        id: 'zk-proof-gen',
        name: 'ZK-Proof Generation',
        description: 'On-demand zero-knowledge proof validity generation.',
        basePrice: 0.4,
        icon: Shield,
        rarity: 'epic',
        provider: 'StarkNet Sol',
        trustScore: 4.7
    },
    {
        id: 'decentralized-storage',
        name: '10TB Arweave Storage',
        description: 'Permanent, censorship-resistant data storage.',
        basePrice: 0.1,
        icon: Box,
        rarity: 'rare',
        provider: 'Arweave DAO',
        trustScore: 4.8
    },
    {
        id: 'validator-node',
        name: 'SKALE Validator Node',
        description: 'Dedicated validator instance for 30 days.',
        basePrice: 0.9,
        icon: Zap,
        rarity: 'legendary',
        provider: 'NodeShift',
        trustScore: 4.95
    }
]

interface ItemSelectorProps {
    items: Item[]
    selectedItem: Item | null
    onSelect: (item: Item) => void
}

export function ItemSelector({ items, selectedItem, onSelect }: ItemSelectorProps) {
    return (
        <div className="w-full space-y-4">
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">Select Target Item</h3>
            <div className="space-y-2">
                {items.map((item) => {
                    const isSelected = selectedItem?.id === item.id
                    return (
                        <motion.button
                            key={item.id}
                            onClick={() => onSelect(item)}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                "relative w-full p-3 rounded-2xl text-left border transition-all duration-300 group overflow-hidden",
                                isSelected
                                    ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_8px_20px_rgba(79,70,229,0.1)]"
                                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                            )}
                        >
                            {/* Selection Glow */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />
                            )}

                            <div className="flex items-center gap-4 relative z-10">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110",
                                    item.rarity === 'legendary' ? "bg-orange-500/10 border-orange-500/20 text-orange-400" :
                                        item.rarity === 'epic' ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                                            item.rarity === 'rare' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                                                "bg-white/5 border-white/10 text-white/30"
                                )}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="text-xs font-black text-white uppercase tracking-tight truncate">{item.name}</span>
                                        <span className="text-[10px] font-black text-green-400 font-mono tracking-tighter">{item.basePrice} sF</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{item.provider}</span>
                                        <div className="h-1 w-1 rounded-full bg-white/10" />
                                        <div className="flex items-center gap-0.5 text-yellow-500/50 text-[9px] font-black uppercase">
                                            ★ {item.trustScore}
                                        </div>
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
