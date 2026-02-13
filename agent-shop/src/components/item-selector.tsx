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
        basePrice: 1200,
        icon: Cpu,
        rarity: 'legendary',
        provider: 'Nebula Cloud',
        trustScore: 4.9
    },
    {
        id: 'zk-proof-gen',
        name: 'ZK-Proof Generation',
        description: 'On-demand zero-knowledge proof validity generation.',
        basePrice: 450,
        icon: Shield,
        rarity: 'epic',
        provider: 'StarkNet Sol',
        trustScore: 4.7
    },
    {
        id: 'decentralized-storage',
        name: '10TB Arweave Storage',
        description: 'Permanent, censorship-resistant data storage.',
        basePrice: 150,
        icon: Box,
        rarity: 'rare',
        provider: 'Arweave DAO',
        trustScore: 4.8
    },
    {
        id: 'validator-node',
        name: 'SKALE Validator Node',
        description: 'Dedicated validator instance for 30 days.',
        basePrice: 2000,
        icon: Zap,
        rarity: 'legendary',
        provider: 'NodeShift',
        trustScore: 4.95
    }
]

interface ItemSelectorProps {
    selectedItem: Item | null
    onSelect: (item: Item) => void
}

export function ItemSelector({ selectedItem, onSelect }: ItemSelectorProps) {
    return (
        <div className="w-full space-y-4">
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">Select Target Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MOCK_ITEMS.map((item) => {
                    const isSelected = selectedItem?.id === item.id
                    return (
                        <motion.button
                            key={item.id}
                            onClick={() => onSelect(item)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                "relative p-4 rounded-xl text-left border transition-all duration-300",
                                isSelected
                                    ? "bg-white/10 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "p-3 rounded-lg",
                                    item.rarity === 'legendary' ? "bg-orange-500/20 text-orange-400" :
                                        item.rarity === 'epic' ? "bg-purple-500/20 text-purple-400" :
                                            item.rarity === 'rare' ? "bg-blue-500/20 text-blue-400" :
                                                "bg-gray-500/20 text-gray-400"
                                )}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-white">{item.name}</span>
                                        <span className="text-xs font-mono text-cyan-400">{item.basePrice} SKL</span>
                                    </div>
                                    <p className="text-xs text-white/50 leading-relaxed mb-2">{item.description}</p>

                                    <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider">
                                        <div className="flex items-center gap-1 text-cyan-300/80">
                                            <Shield className="w-3 h-3" />
                                            {item.provider}
                                        </div>
                                        <div className="flex items-center gap-1 text-yellow-400/80">
                                            <span>★</span> {item.trustScore}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {isSelected && (
                                <motion.div
                                    layoutId="outline"
                                    className="absolute inset-0 border-2 border-cyan-500/50 rounded-xl"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}
