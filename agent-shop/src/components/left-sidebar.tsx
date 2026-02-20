'use client'

import { motion } from 'framer-motion'
import { WalletConnect } from '@/components/wallet-connect'
import { ItemSelector, Item } from '@/components/item-selector'
import { AgentSelector, AgentPersona } from '@/components/agent-selector'
import { Wallet, Settings, Zap, Users, User, CheckCircle2, Play, Pause, Activity, Sparkles, X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeftSidebarProps {
    mode: '1v1' | 'multi'
    setMode: (mode: '1v1' | 'multi') => void
    items: Item[]
    agents: AgentPersona[]
    selectedItem: Item | null
    setSelectedItem: (item: Item | null) => void
    selected1v1AgentId: string
    setSelected1v1AgentId: (id: string) => void
    selectedAgentIds: string[]
    setSelectedAgentIds: (ids: React.SetStateAction<string[]>) => void
    toggleAgentSelection: (id: string) => void
    objective: string
    setObjective: (o: string) => void
    onDeploy: () => void
    onAddItem: () => void
    onAddAgent: () => void
    isDeploying: boolean
    isReady: boolean
    isTreasuryReady: boolean
    treasuryBalance: string
    onFund: () => void
    onClose?: () => void
    onDeleteItem: (id: string) => void
    onDeleteAgent: (id: string) => void
}

export function LeftSidebar({
    mode,
    setMode,
    selectedItem,
    setSelectedItem,
    selected1v1AgentId,
    setSelected1v1AgentId,
    selectedAgentIds,
    setSelectedAgentIds,
    toggleAgentSelection,
    objective,
    setObjective,
    onDeploy,
    onAddItem,
    onAddAgent,
    items,
    agents,
    isDeploying,
    isReady,
    isTreasuryReady,
    treasuryBalance,
    onFund,
    onClose,
    onDeleteItem,
    onDeleteAgent
}: LeftSidebarProps) {
    const [speed, setSpeed] = (typeof window !== 'undefined') ? [5, (v: any) => { }] as const : [5, (v: any) => { }] as const; // Mocked state for UI

    return (
        <aside className="w-full h-full border-r border-white/8 bg-[#151921] overflow-y-auto custom-scrollbar z-30 flex flex-col relative">
            {/* Mobile Close Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="lg:hidden absolute top-4 right-4 p-2.5 bg-black/60 rounded-xl border border-white/20 text-white shadow-2xl z-[60] active:scale-95 transition-all"
                >
                    <X className="w-5 h-5" />
                </button>
            )}

            <div className="p-4 flex-1 space-y-6">

                {/* Mode Switcher */}
                <div className="bg-white/5 p-1 rounded-2xl flex border border-white/10 mb-2 shadow-inner">
                    <button
                        onClick={() => setMode('1v1')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                            mode === '1v1'
                                ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] scale-[1.02]"
                                : "text-white/30 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Sparkles className={cn("w-3.5 h-3.5", mode === '1v1' ? "fill-white" : "text-white/20")} />
                        1v1 Negotiate
                    </button>
                    <button
                        onClick={() => setMode('multi')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                            mode === 'multi'
                                ? "bg-cyan-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.3)] scale-[1.02]"
                                : "text-white/30 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Users className={cn("w-3.5 h-3.5", mode === 'multi' ? "fill-white" : "text-white/20")} />
                        Battle Royale
                    </button>
                </div>


                {/* Treasury Section - Only in Battle Royale */}
                {mode === 'multi' && (
                    <>
                        <div className="flex items-center justify-between px-2 mb-2">
                            <div className="flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-white/40" />
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                    Treasury
                                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-green-400 font-mono text-[9px] lowercase">
                                        ({treasuryBalance} sfuel)
                                    </span>
                                </span>
                            </div>
                            <button
                                onClick={onFund}
                                className="px-3 py-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg transition-all flex items-center gap-1.5 group"
                            >
                                <Zap className="w-3 h-3 text-green-400 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-black text-green-400 uppercase">Deposit</span>
                            </button>
                        </div>
                        <div className="w-full h-px bg-white/5 mx-2" />
                    </>
                )}

                {/* Selection Section */}
                <div className="space-y-8">
                    {/* Item Selector */}
                    <div className="px-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-3 bg-indigo-500 rounded-full" />
                                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Service Target</h3>
                            </div>
                            <button
                                onClick={onAddItem}
                                className="p-1 hover:bg-white/5 rounded-md border border-white/10 text-white/40 hover:text-white transition-colors"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                        <ItemSelector items={items} selectedItem={selectedItem} onSelect={setSelectedItem} onDelete={onDeleteItem} />
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    {/* Agent Selector */}
                    <div className="px-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-3 bg-purple-500 rounded-full" />
                                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Agent Personas</h3>
                            </div>
                            <button
                                onClick={onAddAgent}
                                className="p-1 hover:bg-white/5 rounded-md border border-white/10 text-white/40 hover:text-white transition-colors"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                        <AgentSelector
                            agents={agents}
                            mode={mode === '1v1' ? 'single' : 'multi'}
                            selectedAgents={mode === '1v1' ? [selected1v1AgentId] : selectedAgentIds}
                            onToggle={toggleAgentSelection}
                            onDelete={onDeleteAgent}
                        />
                    </div>
                </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                {mode === '1v1' ? (
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] pl-1">Intent Mandate</label>
                            <textarea
                                value={objective}
                                onChange={(e) => setObjective(e.target.value)}
                                placeholder="e.g. Negotiate a better deal for this server..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none h-20 leading-relaxed font-bold"
                            />
                        </div>
                        <button
                            disabled={!isReady || isDeploying}
                            onClick={onDeploy}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:scale-100 disabled:hover:bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                        >
                            <Zap className="w-4 h-4 fill-white" />
                            Deploy Agent
                        </button>
                    </div>
                ) : (
                    <button
                        disabled={!isReady || isDeploying}
                        onClick={onDeploy}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-30 text-white font-black rounded-2xl shadow-lg shadow-purple-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                    >
                        <Users className="w-4 h-4" />
                        Start Battle Royale
                    </button>
                )}
                {!isReady && (
                    <p className="text-[10px] text-white/20 text-center mt-3 uppercase tracking-tighter font-bold">
                        Complete configuration above to proceed
                    </p>
                )}
            </div>
        </aside >
    )
}
