/**
 * Agent Shop - Dashboard Interface 🏥
 * 
 * Hosting the main application logic and UI on /dashboard.
 */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    Bot,
    Terminal,
    ShieldCheck,
    Zap,
    Sparkles,
    Users,
    History,
    X as XIcon,
    Lock as LockIcon,
    Menu,
    User,
    Loader2,
    Globe,
    Box,
    CheckCircle2,
    FileJson,
    RefreshCw,
    ExternalLink
} from 'lucide-react'
import { useAccount, useWalletClient, useSwitchChain } from 'wagmi'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { createWalletClient, http, formatEther, parseEther, createPublicClient, type Hex } from 'viem'
import { skaleBiteSandbox } from '@/config/chains'

// Custom Hooks for Logic
import { useAgent, AgentLog } from '@/hooks/useAgent'
import { useMultiAgent } from '@/hooks/useMultiAgent'
import { useVoiceInput } from '@/hooks/useVoiceInput'

// Components
import { WalletConnect } from '@/components/wallet-connect'
import { EventSidebar } from '@/components/event-sidebar'
import { LeftSidebar } from '@/components/left-sidebar'
import { AgentTerminal } from '@/components/agent-terminal'
import { ProgressTimeline } from '@/components/progress-timeline'
import { MOCK_ITEMS, Item } from '@/components/item-selector'
import { AGENT_PERSONAS, AgentPersona } from '@/components/agent-selector'
import { NegotiationView } from '@/components/negotiation-view'

// --- Types ---
export interface Receipt {
    id: string
    timestamp: string
    intentMandate: {
        type: 'purchase_order' | 'data_request'
        target: string
        maxBudget: string
    }
    cartMandate?: {
        provider: string
        item: string
        finalPrice: string
        currency: string
        agentId: string
    }
    authorizationToken: string
    agentIdentityID: string
    payment?: {
        network: 'SKALE Nebula'
        chainId: number
        settlementHash: string
        status: 'settled'
    }
    logs: AgentLog[]
}

const PROVIDER_ADDRESS = '0x83934d36c760BFA75f96C31dA0863c0792FB1A45' as `0x${string}`

export default function Dashboard() {
    const router = useRouter()
    const { address: userAddress, chainId: accountChainId } = useAccount()
    const { data: walletClient } = useWalletClient()
    const [mode, setMode] = useState<'1v1' | 'multi'>('1v1')

    // 1v1 State
    const [selected1v1AgentId, setSelected1v1AgentId] = useState<string>(AGENT_PERSONAS[0].id)
    const [objective, setObjective] = useState('')
    const { state: agentState, logs, processRequest, reset: resetAgent } = useAgent()

    // Multi-Agent State
    const [items, setItems] = useState<Item[]>(MOCK_ITEMS)
    const [agentsList, setAgentsList] = useState<AgentPersona[]>(AGENT_PERSONAS)
    const [selectedItem, setSelectedItem] = useState<Item | null>(null)
    const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([])

    const { state: battleState, bids: battleBids, logs: battleLogs, startBattle, resetBattle } = useMultiAgent()
    const isBattleActive = battleState === 'BIDDING' || battleState === 'ADMISSION' || battleState === 'EXECUTING' || battleState === 'FUNDING'

    const agents = battleBids.map((bid, idx) => ({
        id: `agent_${idx}`,
        persona: {
            id: `persona_${idx}`,
            name: bid.name,
            role: 'Autonomous Agent',
            icon: Bot,
            style: 'aggressive' as const
        },
        status: (bid.status === 'won' ? 'winner' : bid.status === 'lost' ? 'dropped' : bid.status) as any,
        currentBid: bid.price,
        logs: [] as any[]
    }))

    const winner = agents.find(a => a.status === 'winner') || null
    const { transcript } = useVoiceInput()

    const [showReceipt, setShowReceipt] = useState(false)
    const [receipt, setReceipt] = useState<Receipt | null>(null)
    const [completedDeals, setCompletedDeals] = useState<Receipt[]>([])

    const [isAuthorizing, setIsAuthorizing] = useState(false)
    const [isUnlockingData, setIsUnlockingData] = useState(false)
    const [isDecrypting, setIsDecrypting] = useState(false)

    const [treasuryAccount, setTreasuryAccount] = useState<any>(null)
    const [treasuryBalance, setTreasuryBalance] = useState<string>('0')
    const [isDepositing, setIsDepositing] = useState(false)
    const [isFundingModalOpen, setIsFundingModalOpen] = useState(false)
    const [depositAmount, setDepositAmount] = useState('1.0')
    const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const [showMobileLeft, setShowMobileLeft] = useState(false)
    const [showMobileRight, setShowMobileRight] = useState(false)
    const [showAddItemModal, setShowAddItemModal] = useState(false)
    const [showAddAgentModal, setShowAddAgentModal] = useState(false)

    const [newItemBase, setNewItemBase] = useState({ name: '', price: '0.5', rarity: 'rare' })
    const [newAgentBase, setNewAgentBase] = useState({ name: '', strategy: 'aggressive' })

    const isReadyToNegotiate = mode === '1v1' ? !!selectedItem : !!(selectedItem && selectedAgentIds.length >= 2)
    const isNegotiating = agentState !== 'IDLE'

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedKey = localStorage.getItem('agentTreasuryKey')
            let account
            if (storedKey) {
                account = privateKeyToAccount(storedKey as `0x${string}`)
            } else {
                const newKey = generatePrivateKey()
                localStorage.setItem('agentTreasuryKey', newKey)
                account = privateKeyToAccount(newKey)
            }
            setTreasuryAccount(account)
        }
    }, [])

    const [publicClient] = useState(() => createPublicClient({
        chain: skaleBiteSandbox,
        transport: http(skaleBiteSandbox.rpcUrls.default.http[0])
    }))

    useEffect(() => {
        if (!treasuryAccount) return
        const fetchBal = () => {
            publicClient.getBalance({ address: treasuryAccount.address }).then(b => setTreasuryBalance(formatEther(b)))
        }
        fetchBal()
        const interval = setInterval(fetchBal, 5000)
        return () => clearInterval(interval)
    }, [treasuryAccount, isDepositing, publicClient])

    const handleGenerateReceipt = useCallback((realHash?: string, isOneOnOne?: boolean) => {
        let itemTitle = selectedItem?.name || objective || 'Service Purchase'
        let finalPrice = winner?.currentBid.toString() || '0.01'
        let agentName = winner?.persona.name || 'Commander Agent'
        let personaId = winner?.persona.id || 'commander'

        if (isOneOnOne) {
            const priceLog = logs.find((l: any) => l.type === 'tx' && l.content.includes('Offer Revealed'))
            if (priceLog) {
                const match = priceLog.content.match(/(\d+\.?\d*)\s*sFUEL/)
                if (match) finalPrice = match[1]
            }
        }

        const newReceipt: Receipt = {
            id: `rcpt_${crypto.randomUUID().split('-')[0]}`,
            timestamp: new Date().toISOString(),
            intentMandate: { type: 'purchase_order', target: itemTitle, maxBudget: selectedItem?.basePrice.toString() || finalPrice },
            cartMandate: { provider: 'Nebula Cloud Node', item: itemTitle, finalPrice, currency: 'sFUEL', agentId: agentName },
            authorizationToken: `Auth-Policy-42-${crypto.randomUUID().split('-')[0]}`,
            agentIdentityID: `ACP-VIRTUAL-${personaId.toUpperCase()}-${crypto.randomUUID().split('-')[0]}`,
            payment: {
                network: 'SKALE Nebula', chainId: 103698795,
                settlementHash: realHash || `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
                status: 'settled'
            },
            logs: mode === '1v1' ? logs : agents.flatMap(a => a.logs).sort((a, b) => a.timestamp - b.timestamp)
        }
        setReceipt(newReceipt)
        setCompletedDeals(prev => [newReceipt, ...prev])
        setShowReceipt(true)
    }, [selectedItem, objective, winner, logs, mode, agents])

    useEffect(() => {
        if (mode === '1v1' && agentState === 'COMPLETED' && !receipt) {
            const settleLog = logs.find((l: any) => l.metadata?.isSettlement)
            if (settleLog?.metadata?.hash) {
                const timer = setTimeout(() => handleGenerateReceipt(settleLog.metadata.hash, true), 2000)
                return () => clearTimeout(timer)
            } else {
                const timer = setTimeout(() => handleGenerateReceipt(undefined, true), 2000)
                return () => clearTimeout(timer)
            }
        }
    }, [agentState, mode, logs, receipt, handleGenerateReceipt])

    const handleSettle = useCallback(async () => {
        if (isDecrypting || receipt || !winner || !treasuryAccount) return
        setIsDecrypting(true)
        try {
            const treasuryClient = createWalletClient({
                account: treasuryAccount, chain: skaleBiteSandbox,
                transport: http(skaleBiteSandbox.rpcUrls.default.http[0])
            })
            const bidValue = parseEther(winner.currentBid.toFixed(18))
            const currentNonce = await publicClient.getTransactionCount({ address: treasuryAccount.address })
            const hash = await treasuryClient.sendTransaction({
                account: treasuryAccount, to: PROVIDER_ADDRESS, value: bidValue,
                chain: skaleBiteSandbox, gas: 500000n, nonce: currentNonce
            })
            await publicClient.waitForTransactionReceipt({ hash })
            setIsDecrypting(false)
            handleGenerateReceipt(hash)
        } catch (e: any) {
            setIsDecrypting(false)
            alert("Settlement failed: " + e.message)
            handleGenerateReceipt()
        }
    }, [isDecrypting, receipt, winner, treasuryAccount, publicClient, handleGenerateReceipt])

    useEffect(() => {
        if (mode === 'multi' && winner && !isAuthorizing && !receipt && !isUnlockingData && !isDecrypting) {
            const timer = setTimeout(() => handleSettle(), 3000)
            return () => clearTimeout(timer)
        }
    }, [winner, mode, receipt, isAuthorizing, isUnlockingData, isDecrypting, handleSettle])

    const handleFundAgents = async (agents: { name: string, address: string }[]) => {
        if (!treasuryAccount) return []
        try {
            const treasuryClient = createWalletClient({
                account: treasuryAccount, chain: skaleBiteSandbox,
                transport: http(skaleBiteSandbox.rpcUrls.default.http[0])
            })
            let currentNonce = await publicClient.getTransactionCount({ address: treasuryAccount.address })
            const hashes = []
            for (const agent of agents) {
                const hash = await treasuryClient.sendTransaction({
                    account: treasuryAccount, to: agent.address as `0x${string}`, value: parseEther('0.001'),
                    chain: skaleBiteSandbox, gas: 1000000n, nonce: currentNonce++
                })
                hashes.push(hash)
                await new Promise(r => setTimeout(r, 500))
            }
            return hashes
        } catch (error) { throw error }
    }

    const handleDeploy = async () => {
        if (mode === '1v1') {
            const persona = agentsList.find(p => p.id === selected1v1AgentId) || AGENT_PERSONAS.find(p => p.id === selected1v1AgentId)
            const personaDesc = persona ? `${persona.name} (${persona.role}) - ${persona.description}` : undefined
            processRequest(objective.trim() || 'Negotiate best deal', personaDesc)
        } else {
            if (!selectedItem || selectedAgentIds.length < 2) return
            if (Number(treasuryBalance) < Number(selectedItem.basePrice) * 1.05) return alert("Insufficient Treasury Funds!")
            setIsAuthorizing(true)
            setTimeout(() => {
                setIsAuthorizing(false)
                setIsUnlockingData(true)
                setTimeout(() => {
                    setIsUnlockingData(false)
                    startBattle(selectedItem?.name || "Service", handleFundAgents)
                }, 1500)
            }, 1000)
        }
    }

    return (
        <main className="fixed inset-0 h-screen w-screen overflow-hidden bg-black flex flex-col items-center relative text-white">
            <div className="mesh-bg absolute inset-0 z-0 pointer-events-none opacity-50" />
            <div className="grid-overlay absolute inset-0 z-0 pointer-events-none opacity-20" />

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col relative z-10">
                <header className="h-14 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl px-4 flex items-center justify-between z-50">
                    <div className="flex items-center gap-2 md:gap-6">
                        <button onClick={() => setShowMobileLeft(true)} className="lg:hidden p-2 hover:bg-white/5 rounded-xl border border-white/10 text-white/40"><Menu className="w-5 h-5" /></button>
                        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => router.push('/')}>
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 group-hover:bg-indigo-500/30 transition-colors">
                                <Globe className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h1 className="font-black text-xs tracking-tighter text-white uppercase italic">STEALTHBID</h1>
                        </div>
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            <Users className="w-3 h-3 text-white/40" />
                            <span className="text-[10px] font-bold text-white/60 uppercase">Protocols</span>
                            <span className="text-[10px] font-black">{agentsList.length}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            <Zap className="w-3 h-3 text-cyan-400" />
                            <span className="text-[10px] font-bold text-white/60 uppercase">Active</span>
                            <span className="text-[10px] font-black">{isBattleActive || agentState !== 'IDLE' ? '1' : '0'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <WalletConnect />
                        <button onClick={() => setShowMobileRight(true)} className="xl:hidden p-2 hover:bg-white/5 rounded-xl border border-white/10 text-white/40"><History className="w-5 h-5" /></button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden relative">
                    <div className="hidden lg:flex w-96 flex-none h-full border-r border-white/5">
                        <LeftSidebar
                            mode={mode} setMode={setMode} items={items} agents={agentsList}
                            treasuryBalance={treasuryBalance} selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem} selected1v1AgentId={selected1v1AgentId}
                            setSelected1v1AgentId={setSelected1v1AgentId} selectedAgentIds={selectedAgentIds}
                            setSelectedAgentIds={setSelectedAgentIds} toggleAgentSelection={id => mode === '1v1' ? setSelected1v1AgentId(id) : setSelectedAgentIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])}
                            objective={objective} setObjective={setObjective} onDeploy={handleDeploy}
                            onAddItem={() => setShowAddItemModal(true)} onAddAgent={() => setShowAddAgentModal(true)}
                            onDeleteItem={id => setItems(p => p.filter(i => i.id !== id))}
                            onDeleteAgent={id => setAgentsList(p => p.filter(a => a.id !== id))}
                            isDeploying={isNegotiating || isAuthorizing || isUnlockingData}
                            isReady={isReadyToNegotiate} isTreasuryReady={!!treasuryAccount} onFund={() => setIsFundingModalOpen(true)}
                        />
                    </div>

                    <div className="flex-1 flex flex-col relative overflow-hidden bg-[#050505] border-x border-white/5">
                        <AnimatePresence>
                            {isNegotiating && mode === '1v1' && (
                                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full pt-4 pb-8 px-4 z-20">
                                    <ProgressTimeline state={agentState} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex-1 flex flex-col min-h-0">
                            {mode === '1v1' ? (
                                <AgentTerminal logs={logs} status={agentState} targetItem={selectedItem} />
                            ) : (
                                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                                    <NegotiationView agents={agents} targetItem={selectedItem || items[0]} round={1} onSettle={handleSettle} isSettled={!!winner} logs={battleLogs.map((l, i) => ({ id: `${i}`, content: l, type: 'info' } as any))} />
                                </div>
                            )}
                        </div>

                        <AnimatePresence>
                            {(isAuthorizing || isUnlockingData || isDecrypting) && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
                                    <div className="text-center space-y-4">
                                        <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto" />
                                        <h3 className="text-xl font-black uppercase tracking-widest">{isDecrypting ? "Settling" : isAuthorizing ? "Authorizing" : "Unlocking"}</h3>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="hidden xl:block w-96 h-full flex-none border-l border-white/5">
                        <EventSidebar logs={mode === '1v1' ? logs : battleLogs.map((l, i) => ({ timestamp: Date.now() + i, type: 'info', content: l } as any))} deals={completedDeals} onClose={() => setShowReceipt(false)} />
                    </div>
                </div>

                <footer className="h-8 border-t border-white/5 bg-black/60 px-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/40">
                    <span>SKALE • BITE_V2 • x402 • GEMINI</span>
                    <span>&copy; 2026 STEALTHBID</span>
                </footer>
            </motion.div>

            {/* Modals */}
            <AnimatePresence>
                {isFundingModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-[#1a1a1a] border border-white/10 p-8 rounded-3xl w-full max-w-md relative">
                            <button onClick={() => setIsFundingModalOpen(false)} className="absolute top-4 right-4 text-white/30 hover:text-white"><XIcon /></button>
                            <h3 className="text-2xl font-black mb-6 uppercase">Treasury</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-white/40 uppercase block mb-1">Amount sFUEL</label>
                                    <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xl font-mono" />
                                </div>
                                <button onClick={() => { setIsDepositing(true); executeDeposit(); }} className="w-full py-5 bg-indigo-600 rounded-2xl font-black uppercase tracking-widest">{isDepositing ? "Processing..." : "Deposit"}</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}
