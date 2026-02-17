'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Shield, TrendingUp, RefreshCw, Zap, Layers, Trash2 } from 'lucide-react'
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
        id: 'arb-eth-usdc',
        name: 'ETH/USDC Arbitrage',
        description: 'Price spread detected between Base and SKALE Nebula.',
        basePrice: 0.5,
        icon: RefreshCw,
        rarity: 'legendary',
        provider: 'Uniswap / Ruby',
        trustScore: 4.95
    },
    {
        id: 'yield-usdc-vault',
        name: 'USDC Yield Vault',
        description: 'Auto-compounding stablecoin strategy on Aave V3.',
        basePrice: 0.75,
        icon: TrendingUp,
        rarity: 'epic',
        provider: 'Yearn Finance',
        trustScore: 4.8
    },
    {
        id: 'liquid-staking',
        name: 'Liquid Staking (stETH)',
        description: 'Stake ETH and receive stETH while maintaining liquidity.',
        basePrice: 0.2,
        icon: Layers,
        rarity: 'rare',
        provider: 'Lido Finance',
        trustScore: 4.9
    },
    {
        id: 'flash-loan-opp',
        name: 'Flash Loan Opportunity',
        description: 'High-risk, high-reward triangular arbitrage route.',
        basePrice: 1.5,
        icon: Zap,
        rarity: 'legendary',
        provider: 'Aave Flash',
        trustScore: 4.6
    }
]

interface ItemSelectorProps {
    items: Item[]
    selectedItem: Item | null
    onSelect: (item: Item) => void
    onDelete?: (id: string) => void
}

export function ItemSelector({ items, selectedItem, onSelect, onDelete }: ItemSelectorProps) {
    return (
        <div className="w-full space-y-4">
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">Select Market Opportunity</h3>
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
                                "relative w-full p-3 pr-10 rounded-2xl text-left border transition-all duration-300 group overflow-hidden",
                                isSelected
                                    ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_8px_20px_rgba(79,70,229,0.1)]"
                                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                            )}
                        >
                            {/* Selection Glow */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />
                            )}

                            {/* Delete Button */}
                            {onDelete && (
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDelete(item.id)
                                    }}
                                    className="absolute right-2 bottom-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-500/20 rounded-lg text-white/20 hover:text-red-400"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </div>
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
