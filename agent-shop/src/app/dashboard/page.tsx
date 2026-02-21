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
    const { switchChainAsync } = useSwitchChain()
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
    const isBattleActive = battleState !== 'IDLE' && battleState !== 'COMPLETED' && battleState !== 'ERROR'

    const agents = battleBids.map((bid, idx) => ({
        id: `agent_${idx}`,
        persona: {
            id: `persona_${idx}`,
            name: bid.name,
            role: 'Autonomous Agent',
            description: bid.strategy,
            icon: Bot,
            style: 'aggressive' as const
        },
        status: (bid.status === 'won' ? 'winner' : bid.status === 'lost' ? 'dropped' :
            bid.status === 'revealed' ? 'bidding' : bid.status) as any,
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

    const [newItemBase, setNewItemBase] = useState({ name: '', price: '0.5', rarity: 'rare', provider: '' })
    const [newAgentBase, setNewAgentBase] = useState({ name: '', strategy: 'aggressive' })

    const isReadyToNegotiate = mode === '1v1' ? !!selectedItem : !!(selectedItem && selectedAgentIds.length >= 2)
    const isNegotiating = agentState !== 'IDLE' && agentState !== 'COMPLETED' && agentState !== 'ERROR'

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

    const handleDownloadReceipt = (receiptData: Receipt) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(receiptData, null, 2))
        const downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute("href", dataStr)
        downloadAnchorNode.setAttribute("download", `receipt_${receiptData.id}.json`)
        document.body.appendChild(downloadAnchorNode)
        downloadAnchorNode.click()
        downloadAnchorNode.remove()
    }

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
            logs: mode === '1v1' ? logs : battleLogs
        }
        setReceipt(newReceipt)
        setCompletedDeals(prev => [newReceipt, ...prev])
        setShowReceipt(true)
    }, [selectedItem, objective, winner, logs, battleLogs, mode, agents])

    useEffect(() => {
        const currentLogs = mode === '1v1' ? logs : battleLogs
        if (agentState === 'COMPLETED' || battleState === 'COMPLETED') {
            if (!receipt) {
                const settleLog = currentLogs.find((l: any) => l.metadata?.isSettlement)
                if (settleLog?.metadata?.hash) {
                    const timer = setTimeout(() => handleGenerateReceipt(settleLog.metadata.hash), 300)
                    return () => clearTimeout(timer)
                } else {
                    const timer = setTimeout(() => handleGenerateReceipt(undefined), 300)
                    return () => clearTimeout(timer)
                }
            }
        }
    }, [agentState, battleState, mode, logs, battleLogs, receipt, handleGenerateReceipt])

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

    // Unified settlement trigger
    useEffect(() => {
        // Only trigger manual settlement for 1v1 if it's NOT handled internally by hook
        // Currently useAgent IS autonomous, so this is mostly a fallback.
        if (mode === '1v1' && winner && !receipt && !isAuthorizing && !isDecrypting) {
            // 1v1 auto-settle is disabled here to let useAgent handle it.
            // If we want page-level settlement, we'd uncomment this.
        }
    }, [winner, mode, receipt, isAuthorizing, isDecrypting, handleSettle])

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

    const executeDeposit = async () => {
        if (!walletClient || !treasuryAccount) {
            setErrorMessage("Wallet not ready.")
            return
        }
        setIsDepositing(true)
        try {
            if (accountChainId !== skaleBiteSandbox.id) {
                await switchChainAsync({ chainId: skaleBiteSandbox.id })
            }
            const [address] = await walletClient.getAddresses()
            const hash = await walletClient.sendTransaction({
                account: address,
                to: treasuryAccount.address,
                value: parseEther(depositAmount),
                chain: skaleBiteSandbox,
            })
            await publicClient.waitForTransactionReceipt({ hash })
            const newBal = await publicClient.getBalance({ address: treasuryAccount.address })
            setTreasuryBalance(formatEther(newBal))
            setIsFundingModalOpen(false)
        } catch (err: any) {
            setErrorMessage(err.message || "Deposit failed.")
        } finally {
            setIsDepositing(false)
        }
    }

    const handleAddItemFinal = () => {
        if (!newItemBase.name) return
        const newItem: Item = {
            id: `item_${crypto.randomUUID().split('-')[0]}`,
            name: newItemBase.name,
            description: 'Custom deployed target service.',
            basePrice: parseFloat(newItemBase.price),
            rarity: newItemBase.rarity as any,
            icon: Box,
            provider: newItemBase.provider || 'User Defined',
            trustScore: 5.0
        }
        setItems(p => [newItem, ...p])
        setSelectedItem(newItem)
        setShowAddItemModal(false)
        setNewItemBase({ name: '', price: '0.5', rarity: 'rare', provider: '' })
    }

    const handleAddAgentFinal = () => {
        if (!newAgentBase.name) return
        const newAgent: AgentPersona = {
            id: `agent_${crypto.randomUUID().split('-')[0]}`,
            name: newAgentBase.name,
            role: `${newAgentBase.strategy === 'aggressive' ? 'Aggressive' : newAgentBase.strategy === 'analytical' ? 'Analytical' : 'Diplomatic'} Strategy`,
            description: `A ${newAgentBase.strategy} negotiator.`,
            icon: Bot,
            style: newAgentBase.strategy as any
        }
        setAgentsList(p => [newAgent, ...p])
        setSelected1v1AgentId(newAgent.id)
        setShowAddAgentModal(false)
        setNewAgentBase({ name: '', strategy: 'aggressive' })
    }

    const handleDeleteItem = (id: string) => {
        setItems(p => p.filter(i => i.id !== id))
        if (selectedItem?.id === id) setSelectedItem(null)
    }

    const handleDeleteAgent = (id: string) => {
        setAgentsList(p => p.filter(a => a.id !== id))
    }

    const handleDeploy = async () => {
        const treasuryKey = localStorage.getItem('agentTreasuryKey') as Hex | null
        if (!treasuryKey) return alert("Treasury not initialized!")

        // Reset receipt state for fresh run
        setReceipt(null)
        setShowReceipt(false)

        if (mode === '1v1') {
            if (agentState === 'COMPLETED' || agentState === 'ERROR') resetAgent()
            const persona = agentsList.find(p => p.id === selected1v1AgentId) || AGENT_PERSONAS.find(p => p.id === selected1v1AgentId)
            const personaDesc = persona ? `${persona.name} (${persona.role}) - ${persona.description}` : undefined
            processRequest(objective.trim() || 'Negotiate best deal', treasuryKey, personaDesc)
        } else {
            if (!selectedItem || selectedAgentIds.length < 2) return
            if (Number(treasuryBalance) < 0.01) return alert("Insufficient Treasury Funds (Min 0.01 sFUEL needed for Battle)!")

            // Reset multi hooks
            if (battleState === 'COMPLETED' || battleState === 'ERROR') resetBattle()

            // Start real multi-agent battle on-chain autonomously
            startBattle(selectedItem.name, treasuryKey, selectedAgentIds.length)
        }
    }

    return (
        <main className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#0d1117] flex flex-col items-center relative text-white">
            <div className="mesh-bg absolute inset-0 z-0 pointer-events-none opacity-50" />
            <div className="grid-overlay absolute inset-0 z-0 pointer-events-none opacity-20" />

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col relative z-10">
                <header className="h-14 border-b border-white/8 bg-[#151921]/80 backdrop-blur-xl px-4 flex items-center justify-between z-50">
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
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
                                <Users className="w-4 h-4 text-white/40" />
                                <span className="text-[10px] font-bold text-white/60 uppercase">Agents</span>
                                <span className="text-xs font-black text-white ml-2">{agentsList.length}</span>
                            </div>
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
                            onDeleteItem={handleDeleteItem}
                            onDeleteAgent={handleDeleteAgent}
                            isDeploying={isNegotiating || isAuthorizing || isUnlockingData}
                            isReady={isReadyToNegotiate} isTreasuryReady={!!treasuryAccount} onFund={() => setIsFundingModalOpen(true)}
                        />
                    </div>

                    <div className="flex-1 flex flex-col relative overflow-hidden bg-[#111827] border-x border-white/8">
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
                                    <NegotiationView
                                        agents={agents}
                                        targetItem={selectedItem || items[0]}
                                        round={1}
                                        onSettle={handleSettle}
                                        isSettled={!!winner}
                                        logs={battleLogs}
                                    />
                                </div>
                            )}
                        </div>

                        <AnimatePresence>
                            {(isDecrypting || isAuthorizing || isUnlockingData || agentState === 'SETTLING' || battleState === 'SETTLING') && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl">
                                    <div className="text-center space-y-8 flex flex-col items-center">
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.1, 1],
                                                boxShadow: [
                                                    "0 0 20px rgba(34, 211, 238, 0.2)",
                                                    "0 0 40px rgba(34, 211, 238, 0.4)",
                                                    "0 0 20px rgba(34, 211, 238, 0.2)"
                                                ]
                                            }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="w-32 h-16 md:w-40 md:h-20 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent animate-shimmer" />
                                            <Zap className="w-8 h-8 md:w-10 md:h-10 text-cyan-400 animate-pulse" />
                                        </motion.div>

                                        <div className="space-y-4">
                                            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] text-white">X402 SETTLEMENT</h3>
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                                                PROTOCOL STANDARD X402 VERIFIED
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="hidden xl:block w-96 h-full flex-none border-l border-white/5">
                        <EventSidebar
                            logs={mode === '1v1' ? logs : battleLogs}
                            deals={completedDeals}
                            onClose={() => setShowReceipt(false)}
                            onDealClick={(deal) => { setReceipt(deal); setShowReceipt(true); }}
                        />
                    </div>
                </div>

                <footer className="h-8 border-t border-white/8 bg-[#0d1117]/60 px-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/40">
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
                                {errorMessage && <div className="text-red-400 text-[10px] font-bold uppercase">{errorMessage}</div>}
                                <div>
                                    <label className="text-[10px] text-white/40 uppercase block mb-1">Amount sFUEL</label>
                                    <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xl font-mono" />
                                </div>
                                <button onClick={executeDeposit} className="w-full py-5 bg-indigo-600 rounded-2xl font-black uppercase tracking-widest" disabled={isDepositing}>{isDepositing ? "Processing..." : "Deposit"}</button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {showReceipt && receipt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-[#151921] rounded-3xl border border-white/10 w-full max-w-2xl overflow-hidden relative shadow-2xl"
                            style={{
                                boxShadow: '0 0 120px rgba(34, 211, 238, 0.15), inset 0 0 40px rgba(52, 211, 153, 0.05)'
                            }}
                        >
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-green-500/10 opacity-50" />
                                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-400/40 to-transparent" />
                                <div className="absolute inset-0 border border-cyan-500/20 rounded-3xl animate-pulse" />
                            </div>
                            <div className="p-8 border-b border-white/5 flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight text-white">Proof of Settlement</h3>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Transaction Finalized on SKALE</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowReceipt(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><XIcon className="w-5 h-5 text-white/30" /></button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                            <ShieldCheck className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-white/20 uppercase font-black tracking-widest">Protocol</p>
                                            <p className="text-lg font-black text-white italic tracking-tight">x402 Mandate</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[8px] font-black text-indigo-400 uppercase tracking-widest">
                                        Gasless Verified
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 bg-green-500/[0.03] rounded-2xl border border-green-500/10 shadow-[inset_0_0_20px_rgba(34,197,94,0.05)]">
                                        <label className="text-[9px] text-green-400/60 uppercase font-black tracking-widest block mb-2">Final Settlement</label>
                                        <div className="flex flex-col">
                                            <span className="text-2xl md:text-3xl font-black text-green-400 font-mono break-all leading-tight">
                                                {receipt.cartMandate?.finalPrice}
                                            </span>
                                            <span className="text-sm font-black text-green-400/60 uppercase">sFUEL</span>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                                        <label className="text-[9px] text-white/40 uppercase font-black tracking-widest block mb-2">Acquired Target</label>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                                <Box className="w-4 h-4 text-indigo-400" />
                                            </div>
                                            <p className="text-lg font-bold text-white truncate">{receipt.intentMandate.target}</p>
                                        </div>
                                    </div>
                                    <div className="col-span-1 md:col-span-2 p-6 bg-black/40 border border-white/5 rounded-2xl">
                                        <label className="text-[9px] text-white/20 uppercase font-black tracking-widest block mb-3">Settlement Hash</label>
                                        <div className="flex items-center gap-3">
                                            <Globe className="w-4 h-4 text-indigo-500/60" />
                                            <a href={`https://base-sepolia-testnet-explorer.skalenodes.com:10032/tx/${receipt.payment?.settlementHash}`} target="_blank" className="text-[11px] font-mono text-indigo-400/80 hover:text-indigo-400 break-all transition-colors flex-1">
                                                {receipt.payment?.settlementHash}
                                            </a>
                                            <ExternalLink className="w-3 h-3 text-white/20" />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 pt-2">
                                    <button
                                        onClick={() => window.open(`https://base-sepolia-testnet-explorer.skalenodes.com:10032/tx/${receipt.payment?.settlementHash}`, '_blank')}
                                        className="py-4 bg-indigo-600 hover:bg-indigo-500 text-white border-t border-indigo-400/20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-95"
                                    >
                                        <Globe className="w-3 h-3 text-white" />
                                        Verify
                                    </button>
                                    <button
                                        onClick={() => receipt && handleDownloadReceipt(receipt)}
                                        className="py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                                    >
                                        <FileJson className="w-3 h-3 text-white/50" />
                                        JSON
                                    </button>
                                    <button
                                        onClick={() => setShowReceipt(false)}
                                        className="py-4 bg-white/5 hover:bg-green-500/10 text-white hover:text-green-400 border border-white/10 hover:border-green-500/30 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        New
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {showAddItemModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[250] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#1a1b26] border border-white/10 p-8 rounded-3xl w-full max-w-md space-y-6 shadow-2xl relative">
                            <button onClick={() => setShowAddItemModal(false)} className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-xl transition-colors"><XIcon className="w-5 h-5 text-white/30" /></button>
                            <h3 className="text-2xl font-black uppercase tracking-tighter">Create Target Item</h3>
                            <div className="space-y-4">
                                <input value={newItemBase.name} onChange={e => setNewItemBase(p => ({ ...p, name: e.target.value }))} placeholder="Item Name / Opportunity" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold" />
                                <input value={newItemBase.provider!} onChange={e => setNewItemBase(p => ({ ...p, provider: e.target.value }))} placeholder="Platform / Source (e.g. Uniswap)" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold" />
                                <input type="number" value={newItemBase.price} onChange={e => setNewItemBase(p => ({ ...p, price: e.target.value }))} placeholder="Base Price" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold" />
                                <button onClick={handleAddItemFinal} className="w-full py-5 bg-indigo-600 rounded-2xl font-black uppercase">Deploy Target</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {showAddAgentModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[250] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#1a1b26] border border-white/10 p-8 rounded-3xl w-full max-w-md space-y-6 shadow-2xl relative">
                            <button onClick={() => setShowAddAgentModal(false)} className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-xl transition-colors"><XIcon className="w-5 h-5 text-white/30" /></button>
                            <h3 className="text-2xl font-black uppercase tracking-tighter">Create Agent</h3>
                            <div className="space-y-4">
                                <input value={newAgentBase.name} onChange={e => setNewAgentBase(p => ({ ...p, name: e.target.value }))} placeholder="Agent Name" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold" />
                                <div>
                                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold block mb-2">Select Execution Strategy</label>
                                    <select value={newAgentBase.strategy} onChange={e => setNewAgentBase(p => ({ ...p, strategy: e.target.value }))} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold appearance-none">
                                        <option value="aggressive" className="bg-[#1a1b26] text-white">Aggressive</option>
                                        <option value="analytical" className="bg-[#1a1b26] text-white">Analytical</option>
                                        <option value="diplomatic" className="bg-[#1a1b26] text-white">Diplomatic</option>
                                    </select>
                                </div>
                                <button onClick={handleAddAgentFinal} className="w-full py-5 bg-purple-600 rounded-2xl font-black uppercase">Initialize Agent</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}
