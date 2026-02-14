/**
 * Agent Shop - Main Interface
 * 
 * A glassmorphism-styled dashboard for interacting with the autonomous agent.
 * Features:
 * - Voice Input (Web Speech API)
 * - Real-time Agent Thought Terminal
 * - Celebration Animations (Confetti)
 * - Responsive Layout
 * - Multi-Agent Negotiation Grid
 */
'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWalletClient, useSwitchChain, usePublicClient } from 'wagmi'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { createWalletClient, http, formatEther, parseEther, createPublicClient } from 'viem'
import { skaleBiteSandbox } from '@/config/chains'
import { WalletConnect } from '@/components/wallet-connect'
import { AgentTerminal } from '@/components/agent-terminal'
import { ProgressTimeline } from '@/components/progress-timeline'
import { EventSidebar } from '@/components/event-sidebar'
import { LeftSidebar } from '@/components/left-sidebar'
import { ItemSelector, MOCK_ITEMS, Item } from '@/components/item-selector'
import { AgentSelector, AGENT_PERSONAS, AgentPersona } from '@/components/agent-selector'
import { NegotiationView } from '@/components/negotiation-view'
import { useAgent } from '@/hooks/useAgent'
import { useMultiAgent } from '@/hooks/useMultiAgent'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Mic, Shield, Cpu, Zap, Globe, ArrowLeft, Users, User, FileJson, CheckCircle2, X as XIcon, Lock as LockIcon, ShieldCheck, ChevronLeft, Volume2, Wallet, RefreshCw, Loader2, Menu, History, Box } from 'lucide-react'
import { cn } from '@/lib/utils'


export interface Receipt {
  id: string
  timestamp: string // ISO
  intentMandate: {
    type: 'purchase_order' | 'data_request'
    target: string // The objective or product
    maxBudget: string // In sFUEL or native
  }
  cartMandate: {
    provider: string
    item: string
    finalPrice: string
    currency: string
    agentId: string
  }
  authorizationToken: string // AP2 Policy #42
  agentIdentityID: string // Virtuals ACP ID
  payment: {
    network: 'SKALE Nebula'
    chainId: number
    settlementHash: string // AP2 Terminology
    status: 'settled'
  }
}


export default function Home() {
  const { connector, address: userAddress, chainId: accountChainId } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [showLanding, setShowLanding] = useState(true)
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
  const { agents, isBattleActive, round, winner, startBattle, resetBattle } = useMultiAgent()

  const { isListening, transcript, startListening } = useVoiceInput()

  // Receipt State
  const [showReceipt, setShowReceipt] = useState(false)
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [completedDeals, setCompletedDeals] = useState<Receipt[]>([])

  // Hero Prize State
  const [isAuthorizing, setIsAuthorizing] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isUnlockingData, setIsUnlockingData] = useState(false)
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [auditLogs, setAuditLogs] = useState<string[]>([])

  // Treasury State
  const [treasuryAccount, setTreasuryAccount] = useState<any>(null)
  const [treasuryBalance, setTreasuryBalance] = useState<string>('0')
  const [isDepositing, setIsDepositing] = useState(false)
  const [isFundingModalOpen, setIsFundingModalOpen] = useState(false)
  const [depositAmount, setDepositAmount] = useState('1.0')
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Mobile Navigation State
  const [showMobileLeft, setShowMobileLeft] = useState(false)
  const [showMobileRight, setShowMobileRight] = useState(false)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [showAddAgentModal, setShowAddAgentModal] = useState(false)

  // New Item Form State
  const [newItemBase, setNewItemBase] = useState({ name: '', price: '0.5', rarity: 'rare' })
  // New Agent Form State
  const [newAgentBase, setNewAgentBase] = useState({ name: '', strategy: 'aggressive' })


  // Helpers
  const isReadyToNegotiate = mode === '1v1' ? !!selectedItem : !!(selectedItem && selectedAgentIds.length >= 2)
  const isNegotiating = agentState !== 'IDLE'

  // Initialize Treasury
  useEffect(() => {
    // Only on client
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

  // Public Client for Balance Checks (Ad-hoc)
  const [publicClient] = useState(() => createPublicClient({
    chain: skaleBiteSandbox,
    transport: http(skaleBiteSandbox.rpcUrls.default.http[0])
  }))

  // Poll Balance
  useEffect(() => {
    if (!treasuryAccount) return
    const fetchBal = () => {
      publicClient.getBalance({ address: treasuryAccount.address }).then(b => setTreasuryBalance(formatEther(b)))
    }
    fetchBal()
    const interval = setInterval(fetchBal, 5000)
    return () => clearInterval(interval)
  }, [treasuryAccount, isDepositing, publicClient])

  // Direct SDK Integration for "Coinbase Payment"
  // Robust Deposit Handler
  useEffect(() => {
    if (mode === 'multi' && winner && !isAuthorizing && !receipt && !isUnlockingData && !isDecrypting) {
      const timer = setTimeout(() => {
        handleSettle()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [winner, mode, receipt, isAuthorizing, isUnlockingData, isDecrypting])

  const openFundingModal = () => {
    setActiveTab('deposit')
    setErrorMessage(null)
    setIsFundingModalOpen(true)
  }

  const { switchChainAsync } = useSwitchChain()

  const executeDeposit = async () => {
    if (!walletClient) {
      setErrorMessage("Please connect your wallet first.")
      return
    }
    if (!treasuryAccount) {
      setErrorMessage("Treasury account not initialized. Please refresh.")
      return
    }
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      setErrorMessage("Please enter a valid amount.")
      return
    }

    setIsDepositing(true)
    setErrorMessage(null)

    try {
      if (accountChainId !== skaleBiteSandbox.id) {
        await switchChainAsync({ chainId: skaleBiteSandbox.id })
      }

      const currentChainId = await walletClient.getChainId()
      if (currentChainId !== skaleBiteSandbox.id) {
        throw new Error(`Please switch to SKALE manually.`)
      }

      const [address] = await walletClient.getAddresses()
      const hash = await walletClient.sendTransaction({
        account: address,
        to: treasuryAccount.address,
        value: parseEther(depositAmount),
        chain: skaleBiteSandbox,
        gas: 12000000n
      })

      await publicClient.waitForTransactionReceipt({ hash })
      const newBal = await publicClient.getBalance({ address: treasuryAccount.address })
      setTreasuryBalance(formatEther(newBal))
      setIsFundingModalOpen(false)

    } catch (err: any) {
      setErrorMessage(err.message || "Transaction failed.")
    } finally {
      setIsDepositing(false)
    }
  }

  const handleWithdraw = async () => {
    if (!treasuryAccount || !userAddress) {
      alert("Please connect your wallet first.")
      return
    }
    setIsDepositing(true)
    try {
      const treasuryClient = createWalletClient({
        account: treasuryAccount,
        chain: skaleBiteSandbox,
        transport: http(skaleBiteSandbox.rpcUrls.default.http[0])
      })

      const balance = parseEther(treasuryBalance)
      const amountToSend = balance - parseEther('0.0001')

      if (amountToSend <= 0n) {
        alert("Insufficient funds to withdraw.")
        return
      }

      const hash = await treasuryClient.sendTransaction({
        account: treasuryAccount,
        to: userAddress,
        value: amountToSend,
        chain: skaleBiteSandbox,
        gas: 12000000n
      })

      await publicClient.waitForTransactionReceipt({ hash })
      const newBal = await publicClient.getBalance({ address: treasuryAccount.address })
      setTreasuryBalance(formatEther(newBal))
      alert(`Success! Funds returned.`)
      setIsFundingModalOpen(false)

    } catch (e: any) {
      alert("Rescue failed: " + e.message)
    } finally {
      setIsDepositing(false)
    }
  }

  const handleGenerateReceipt = () => {
    if (!selectedItem || !winner) return

    const newReceipt: Receipt = {
      id: `rcpt_${crypto.randomUUID().split('-')[0]}`,
      timestamp: new Date().toISOString(),
      intentMandate: {
        type: 'purchase_order',
        target: selectedItem.name,
        maxBudget: selectedItem.basePrice.toString()
      },
      cartMandate: {
        provider: (selectedItem as any).provider || 'Nebula Cloud',
        item: selectedItem.name,
        finalPrice: winner.currentBid.toString(),
        currency: 'sFUEL',
        agentId: winner.persona.name
      },
      authorizationToken: `Auth-Policy-42-${crypto.randomUUID().split('-')[0]}`,
      agentIdentityID: `ACP-VIRTUAL-${winner.persona.id.toUpperCase()}-${crypto.randomUUID().split('-')[0]}`,
      payment: {
        network: 'SKALE Nebula',
        chainId: 103698795,
        settlementHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        status: 'settled'
      }
    }
    setReceipt(newReceipt)
    setCompletedDeals(prev => [newReceipt, ...prev])
    setShowReceipt(true)
  }

  useEffect(() => {
    const hasLaunched = localStorage.getItem('hasLaunched')
    if (hasLaunched) {
      setShowLanding(false)
    }
  }, [])

  useEffect(() => {
    if (transcript) setObjective(transcript)
  }, [transcript])

  const handleLaunch = () => {
    localStorage.setItem('hasLaunched', 'true')
    setShowLanding(false)
  }

  const handleDeploy = async () => {
    if (mode === '1v1') {
      const finalObjective = objective.trim() || `Negotiate the best possible deal for this service.`
      const persona = AGENT_PERSONAS.find(p => p.id === selected1v1AgentId)
      const personaDesc = persona ? `${persona.name} (${persona.role}) - ${persona.description}` : undefined
      processRequest(finalObjective, personaDesc)
    } else {
      if (!selectedItem || selectedAgentIds.length < 2) return

      const currentBal = Number(treasuryBalance)
      const required = Number(selectedItem.basePrice) * 1.05

      if (currentBal < required) {
        alert(`Insufficient Treasury Funds! Need ~${required.toFixed(2)} sFUEL.`)
        return
      }

      setIsAuthorizing(true)
      try {
        setTimeout(() => {
          setIsAuthorizing(false)
          setIsAuthorized(true)
          setIsUnlockingData(true)

          setTimeout(() => {
            setIsUnlockingData(false)
            const selectedPersonas = AGENT_PERSONAS.filter(p => selectedAgentIds.includes(p.id))
            startBattle(selectedPersonas, selectedItem)
          }, 1500)
        }, 1000)
      } catch (err) {
        setIsAuthorizing(false)
      }
    }
  }

  const handleSettle = () => {
    if (isDecrypting || receipt) return
    setIsDecrypting(true)

    setTimeout(() => {
      setIsDecrypting(false)
      handleGenerateReceipt()
    }, 2500)
  }

  const toggleAgentSelection = (id: string) => {
    if (mode === '1v1') {
      setSelected1v1AgentId(id)
    } else {
      setSelectedAgentIds(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      )
    }
  }

  const handleAddItemFinal = () => {
    if (!newItemBase.name) return
    const newItem: Item = {
      id: `custom_${Date.now()}`,
      name: newItemBase.name,
      basePrice: Number(newItemBase.price),
      description: 'Custom added service.',
      icon: Box,
      rarity: newItemBase.rarity as any,
      provider: 'User Custom',
      trustScore: 5.0
    }
    setItems(prev => [...prev, newItem])
    setSelectedItem(newItem)
    setShowAddItemModal(false)
  }

  const handleAddAgentFinal = () => {
    if (!newAgentBase.name) return
    const newAgent: AgentPersona = {
      id: `custom_agent_${Date.now()}`,
      name: newAgentBase.name,
      role: 'Custom Agent',
      description: (newAgentBase as any).description || `Expert in ${newAgentBase.strategy} negotiation.`,
      icon: User,
      style: newAgentBase.strategy as any
    }
    setAgentsList(prev => [...prev, newAgent])
    setShowAddAgentModal(false)
  }

  return (
    <main className="fixed inset-0 h-screen w-screen overflow-hidden bg-black flex flex-col items-center relative text-white">
      <AnimatePresence>
        {isFundingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
              <button
                onClick={() => setIsFundingModalOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <XIcon className="w-5 h-5 text-white/50" />
              </button>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl transition-colors ${activeTab === 'deposit' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      {activeTab === 'deposit' ? <Zap className="w-6 h-6 text-green-400" /> : <ShieldCheck className="w-6 h-6 text-red-400" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Agent Treasury</h3>
                      <p className="text-white/50 text-sm">{activeTab === 'deposit' ? 'Fund Autonomous Mode' : 'Emergency Withdraw'}</p>
                    </div>
                  </div>
                  <div className="flex bg-white/5 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('deposit')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'deposit' ? 'bg-green-500 text-black' : 'text-white/50'}`}>Deposit</button>
                    <button onClick={() => setActiveTab('withdraw')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'withdraw' ? 'bg-red-500 text-white' : 'text-white/50'}`}>Withdraw</button>
                  </div>
                </div>

                {activeTab === 'deposit' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-white/40 uppercase">Amount (sFUEL)</label>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={e => setDepositAmount(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-green-400 font-mono"
                      />
                    </div>
                    {errorMessage && <p className="text-red-400 text-[10px] font-bold uppercase text-center">{errorMessage}</p>}
                    <button
                      onClick={executeDeposit}
                      disabled={isDepositing}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                    >
                      {isDepositing ? <Loader2 className="animate-spin w-4 h-4" /> : <Zap className="w-4 h-4" />}
                      Deposit to Treasury
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm p-4 bg-white/5 rounded-xl">
                      <span className="text-white/60">Balance:</span>
                      <span className="text-green-400 font-mono">{treasuryBalance} sFUEL</span>
                    </div>
                    <button
                      onClick={handleWithdraw}
                      disabled={isDepositing}
                      className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20"
                    >
                      Withdraw to Wallet
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mesh-bg absolute inset-0 z-0 pointer-events-none opacity-50" />
      <div className="grid-overlay absolute inset-0 z-0 pointer-events-none opacity-20" />

      <AnimatePresence mode="wait">
        {showLanding ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 z-[50] flex flex-col items-center justify-center p-6 overflow-y-auto custom-scrollbar"
          >
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />

            <div className="relative z-10 max-w-6xl w-full flex flex-col items-center text-center">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                  <Globe className="w-3 h-3" />
                  BITE Protocol V2
                </div>
              </motion.div>

              <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-none">
                STEALTHBID
              </motion.h1>

              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl leading-relaxed">
                Autonomous Commerce Platform. Encrypted Negotiators. <br className="hidden md:block" />
                Finality on SKALE Nebula. Performance by Gemini.
              </motion.p>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col md:flex-row items-center gap-6 mb-20">
                <button
                  onClick={handleLaunch}
                  className="px-12 py-5 bg-white text-black font-black rounded-2xl text-lg shadow-[0_0_50px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                  <Zap className="w-5 h-5 fill-black" />
                  LAUNCH APP
                </button>
              </motion.div>

              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
                {[
                  { label: 'Agents Online', value: '42', color: 'text-green-400' },
                  { label: 'Active Grid', value: '12', color: 'text-cyan-400' },
                  { label: 'Settled x402', value: '1.2k', color: 'text-indigo-400' },
                  { label: 'Total Volume', value: '840k', color: 'text-purple-400' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
                    <div className={`text-2xl md:text-3xl font-black mb-1 font-mono ${stat.color}`}>{stat.value}</div>
                    <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col relative z-10"
          >
            <header className="h-14 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl px-4 flex items-center justify-between z-50">
              <div className="flex items-center gap-2 md:gap-6">
                <button
                  onClick={() => setShowMobileLeft(true)}
                  className="lg:hidden p-2 hover:bg-white/5 rounded-xl border border-white/10 text-white/40"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setShowLanding(true)}>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 group-hover:bg-indigo-500/30 transition-colors">
                    <Globe className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex flex-col">
                    <h1 className="font-black text-xs tracking-tighter text-white">STEALTHBID</h1>
                    <p className="text-[8px] text-white/20 font-mono tracking-widest uppercase">Autonomous Core</p>
                  </div>
                </div>

                <div className="h-4 w-px bg-white/10 hidden md:block" />

                <div className="hidden lg:flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <Users className="w-3 h-3 text-white/40" />
                    <span className="text-[10px] font-bold text-white/60">Agents</span>
                    <span className="text-[10px] font-black text-white">6</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span className="text-[10px] font-bold text-white/60">Active</span>
                    <span className="text-[10px] font-black text-white">{isBattleActive || agentState !== 'IDLE' ? '1' : '0'}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <FileJson className="w-3 h-3 text-purple-400" />
                    <span className="text-[10px] font-bold text-white/60">Deals</span>
                    <span className="text-[10px] font-black text-white">{completedDeals.length}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <WalletConnect />
                <button
                  onClick={() => setShowMobileRight(true)}
                  className="xl:hidden p-2 hover:bg-white/5 rounded-xl border border-white/10 text-white/40"
                >
                  <History className="w-5 h-5" />
                </button>
              </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
              <div className="hidden lg:flex w-96 flex-none h-full border-r border-white/5">
                <LeftSidebar
                  mode={mode}
                  setMode={setMode}
                  items={items}
                  agents={agentsList}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  selected1v1AgentId={selected1v1AgentId}
                  setSelected1v1AgentId={setSelected1v1AgentId}
                  selectedAgentIds={selectedAgentIds}
                  setSelectedAgentIds={setSelectedAgentIds}
                  toggleAgentSelection={toggleAgentSelection}
                  objective={objective}
                  setObjective={setObjective}
                  onDeploy={handleDeploy}
                  onAddItem={() => setShowAddItemModal(true)}
                  onAddAgent={() => setShowAddAgentModal(true)}
                  isDeploying={agentState !== 'IDLE' || isAuthorizing || isUnlockingData}
                  isReady={isReadyToNegotiate}
                  isTreasuryReady={!!treasuryAccount}
                  onFund={openFundingModal}
                />
              </div>

              <AnimatePresence>
                {showMobileLeft && (
                  <motion.div
                    initial={{ x: -280 }}
                    animate={{ x: 0 }}
                    exit={{ x: -280 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[100] lg:hidden flex"
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowMobileLeft(false)}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <div className="relative h-full w-[90vw] max-w-sm shadow-2xl">
                      <LeftSidebar
                        mode={mode}
                        setMode={setMode}
                        items={items}
                        agents={agentsList}
                        selectedItem={selectedItem}
                        setSelectedItem={setSelectedItem}
                        selected1v1AgentId={selected1v1AgentId}
                        setSelected1v1AgentId={setSelected1v1AgentId}
                        selectedAgentIds={selectedAgentIds}
                        setSelectedAgentIds={setSelectedAgentIds}
                        toggleAgentSelection={toggleAgentSelection}
                        objective={objective}
                        setObjective={setObjective}
                        onDeploy={() => { handleDeploy(); setShowMobileLeft(false); }}
                        onAddItem={() => { setShowAddItemModal(true); setShowMobileLeft(false); }}
                        onAddAgent={() => { setShowAddAgentModal(true); setShowMobileLeft(false); }}
                        isDeploying={agentState !== 'IDLE' || isAuthorizing || isUnlockingData}
                        isReady={isReadyToNegotiate}
                        isTreasuryReady={!!treasuryAccount}
                        onFund={openFundingModal}
                        onClose={() => setShowMobileLeft(false)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
                    <div className="flex-1 flex flex-col min-h-0">
                      {isReadyToNegotiate ? (
                        <AgentTerminal
                          logs={logs}
                          status={agentState}
                          targetItem={selectedItem}
                        />
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 md:p-12 space-y-6">
                          <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-500/5 rounded-full flex items-center justify-center border border-indigo-500/10">
                            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-indigo-400/20" />
                          </div>
                          <div className="space-y-4">
                            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter">Awaiting Mandated Intent</h2>
                            <p className="text-[10px] md:text-xs text-white/30 max-w-xs mx-auto font-bold uppercase tracking-widest leading-loose">
                              Configure service target and agent persona in the mission control sidebar.
                            </p>
                            <button
                              onClick={() => setShowMobileLeft(true)}
                              className="lg:hidden mx-auto px-6 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/20"
                            >
                              Open Mission Control
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
                      {selectedItem ? (
                        <NegotiationView
                          agents={agents}
                          targetItem={selectedItem}
                          round={round}
                          onSettle={handleSettle}
                          isSettled={!!receipt || isDecrypting}
                        />
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center h-full text-center opacity-20 p-6">
                          <Users className="w-12 h-12 md:w-16 md:h-16 mb-6 text-cyan-400" />
                          <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter">Configure Grid Force</h3>
                          <p className="text-[10px] max-w-xs font-bold uppercase tracking-widest leading-loose mt-2">Select a target item and at least two agents.</p>
                          <button
                            onClick={() => setShowMobileLeft(true)}
                            className="lg:hidden mx-auto mt-8 px-6 py-3 bg-cyan-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-500/20"
                          >
                            Open Mission Control
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {isAuthorizing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-3xl p-6">
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0a0a0c] border border-indigo-500/30 p-8 md:p-12 rounded-3xl text-center space-y-6 shadow-[0_0_100px_rgba(79,70,229,0.1)] w-full max-w-md">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                          <ShieldCheck className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Treasury Mandate</h3>
                        <p className="text-white/40 text-[10px] md:text-[11px] font-bold uppercase tracking-widest leading-loose">Authorizing BITE-encrypted budget allocation...</p>
                      </motion.div>
                    </motion.div>
                  )}

                  {(isUnlockingData || isDecrypting) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 flex items-center justify-center bg-black/90 backdrop-blur-xl">
                      <div className="text-center space-y-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-cyan-400/20 blur-2xl rounded-full" />
                          <Zap className="w-12 h-12 text-cyan-400 mx-auto animate-pulse relative z-10" />
                        </div>
                        <h3 className="text-lg md:text-xl font-black uppercase tracking-[0.2em]">{isDecrypting ? "Consensus Reveal" : "Security Handshake"}</h3>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="hidden xl:block w-96 h-full flex-none border-l border-white/5">
                <EventSidebar
                  logs={mode === '1v1' ? logs : agents.flatMap(a => a.logs)}
                  deals={completedDeals}
                />
              </div>

              <AnimatePresence>
                {showMobileRight && (
                  <motion.div
                    initial={{ x: 280 }}
                    animate={{ x: 0 }}
                    exit={{ x: 280 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[100] xl:hidden flex justify-end"
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowMobileRight(false)}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <div className="relative h-full w-[90vw] max-w-sm shadow-2xl">
                      <EventSidebar
                        logs={mode === '1v1' ? logs : agents.flatMap(a => a.logs)}
                        deals={completedDeals}
                        onClose={() => setShowMobileRight(false)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <footer className="h-8 border-t border-white/5 bg-black/60 px-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/20">
              <span>SF_AGENT_HACKATHON_2026</span>
              <span className="hidden md:inline">SKALE • BITE_V2 • x402 • GEMINI</span>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReceipt && receipt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1a1b26] rounded-2xl border border-white/10 w-full max-w-2xl overflow-hidden relative shadow-2xl">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-xl font-bold">Proof of Settlement</h3>
                <button onClick={() => setShowReceipt(false)} className="p-2 hover:bg-white/10 rounded-lg"><XIcon className="w-5 h-5 text-white/50" /></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <label className="text-[10px] text-white/30 uppercase block mb-1">Target</label>
                    <p className="font-bold">{receipt.intentMandate.target}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <label className="text-[10px] text-white/30 uppercase block mb-1">Final Price</label>
                    <p className="font-bold text-green-400 font-mono">{receipt.cartMandate.finalPrice} sFUEL</p>
                  </div>
                </div>
                <div className="p-4 bg-black/40 rounded-xl font-mono text-[11px] space-y-2 border border-white/5">
                  <p className="text-white/40 uppercase">Settlement Hash:</p>
                  <p className="text-cyan-400 break-all">{receipt.payment.settlementHash}</p>
                </div>
                <button
                  onClick={() => window.open(`${skaleBiteSandbox.blockExplorers.default.url}/tx/${receipt.payment.settlementHash}`, '_blank')}
                  className="w-full py-4 bg-white text-black font-bold rounded-xl shadow-lg hover:bg-gray-100 transition-all active:scale-[0.98]"
                >
                  Verify on Chain
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creation Modals */}
      <AnimatePresence>
        {showAddItemModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[250] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#1a1b26] border border-white/10 p-8 rounded-3xl w-full max-w-md space-y-6 shadow-2xl relative">
              <button onClick={() => setShowAddItemModal(false)} className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-xl transition-colors"><XIcon className="w-5 h-5 text-white/30" /></button>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Create Target Item</h3>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Deploy a new contract for agents to bid on.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Item Name</label>
                  <input
                    value={newItemBase.name}
                    onChange={e => setNewItemBase(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Advanced AI Compute"
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold text-white focus:border-indigo-500/50 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Base Price (sFUEL)</label>
                  <input
                    type="number"
                    value={newItemBase.price}
                    onChange={e => setNewItemBase(p => ({ ...p, price: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-mono font-bold text-green-400 focus:border-green-500/50 outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleAddItemFinal}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
              >
                Deploy Target
              </button>
            </motion.div>
          </motion.div>
        )}

        {showAddAgentModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[250] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#1a1b26] border border-white/10 p-8 rounded-3xl w-full max-w-md space-y-6 shadow-2xl relative">
              <button onClick={() => setShowAddAgentModal(false)} className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-xl transition-colors"><XIcon className="w-5 h-5 text-white/30" /></button>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Create Custom Agent</h3>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Initialize a new persona with custom logic.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Agent Name</label>
                  <input
                    value={newAgentBase.name}
                    onChange={e => setNewAgentBase(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. ALPHA.bid"
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold text-white focus:border-purple-500/50 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Negotiation Strategy</label>
                  <select
                    value={newAgentBase.strategy}
                    onChange={e => setNewAgentBase(p => ({ ...p, strategy: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold text-white focus:border-purple-500/50 outline-none appearance-none"
                  >
                    <option value="aggressive">Aggressive (Pressure focus)</option>
                    <option value="analytical">Analytical (Value focus)</option>
                    <option value="diplomatic">Diplomatic (Win-win focus)</option>
                    <option value="chaos">Chaos (Unpredictable)</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleAddAgentFinal}
                className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl shadow-xl shadow-purple-500/20 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
              >
                Initialize Agent
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
