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
import { WalletConnect } from '@/components/wallet-connect'
import { AgentTerminal } from '@/components/agent-terminal'
import { ProgressTimeline } from '@/components/progress-timeline'
import { EventSidebar } from '@/components/event-sidebar'
import { ItemSelector, MOCK_ITEMS, Item } from '@/components/item-selector'
import { AgentSelector, AGENT_PERSONAS } from '@/components/agent-selector'
import { NegotiationView } from '@/components/negotiation-view'
import { useAgent } from '@/hooks/useAgent'
import { useMultiAgent } from '@/hooks/useMultiAgent'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Mic, Shield, Cpu, Zap, Globe, ArrowLeft, Users, User, FileJson, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'


interface Receipt {
  id: string
  timestamp: string
  intentMandate: {
    type: 'purchase_order'
    target: string
    maxBudget?: number
  }
  cartMandate: {
    provider: string
    item: string
    finalPrice: number
    currency: 'sFUEL' | 'USDC'
    agentId: string
  }
  payment: {
    network: 'SKALE Nebula'
    chainId: number
    transactionHash: string
    status: 'settled'
  }
}


export default function Home() {
  const [showLanding, setShowLanding] = useState(true)
  const [mode, setMode] = useState<'1v1' | 'multi'>('1v1')

  // 1v1 State
  const [selected1v1AgentId, setSelected1v1AgentId] = useState<string>(AGENT_PERSONAS[0].id)
  const [objective, setObjective] = useState('')
  const { state: agentState, logs, processRequest, reset: resetAgent } = useAgent()

  // Multi-Agent State
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([])
  const { agents, isBattleActive, round, winner, startBattle, resetBattle } = useMultiAgent()

  const { isListening, transcript, startListening } = useVoiceInput()

  // Receipt State
  const [showReceipt, setShowReceipt] = useState(false)
  const [receipt, setReceipt] = useState<Receipt | null>(null)

  const handleGenerateReceipt = () => {
    if (!selectedItem || !winner) return

    const newReceipt: Receipt = {
      id: `rcpt_${crypto.randomUUID().split('-')[0]}`,
      timestamp: new Date().toISOString(),
      intentMandate: {
        type: 'purchase_order',
        target: selectedItem.name,
        maxBudget: selectedItem.basePrice
      },
      cartMandate: {
        provider: (selectedItem as any).provider || 'Nebula Cloud',
        item: selectedItem.name,
        finalPrice: winner.currentBid,
        currency: 'sFUEL',
        agentId: winner.persona.name
      },
      payment: {
        network: 'SKALE Nebula',
        chainId: 103698795,
        transactionHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        status: 'settled'
      }
    }
    setReceipt(newReceipt)
    setShowReceipt(true)
  }

  useEffect(() => {
    // Check if user has already launched the app
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

  const handleDeploy = () => {
    if (mode === '1v1') {
      if (!objective.trim()) return
      const persona = AGENT_PERSONAS.find(p => p.id === selected1v1AgentId)
      const personaDesc = persona ? `${persona.name} (${persona.role}) - ${persona.description}` : undefined
      processRequest(objective, personaDesc)
    } else {
      // Start Battle
      if (!selectedItem || selectedAgentIds.length < 2) return
      const selectedPersonas = AGENT_PERSONAS.filter(p => selectedAgentIds.includes(p.id))
      startBattle(selectedPersonas, selectedItem)
    }
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

  return (
    <main className="fixed inset-0 h-screen w-screen overflow-hidden bg-black flex flex-col items-center relative text-white">
      <div className="mesh-bg absolute inset-0 z-0 pointer-events-none" />
      <div className="grid-overlay absolute inset-0 z-0 pointer-events-none" />

      <AnimatePresence mode="wait">
        {showLanding ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center overflow-y-auto custom-scrollbar"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="px-4 py-1.5 rounded-full glass border border-white/10 text-[10px] font-mono tracking-widest text-cyan-300 mb-6 uppercase"
            >
              Agentic Commerce V1.0
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-2"
            >
              StealthBid <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 animate-gradient">Agents</span>
            </motion.h1>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl md:text-3xl font-light tracking-tight text-white/50 mb-8"
            >
              Autonomous Services & Encrypted Commerce
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-white/40 max-w-2xl mb-12 font-light"
            >
              The next generation of B2B service negotiation. Powered by autonomous AI agents,
              BITE V2 privacy, and instant gasless settlement on SKALE.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-4"
            >
              <button
                onClick={handleLaunch}
                className="px-8 py-3.5 rounded-full bg-white text-black font-bold text-sm tracking-wide hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
              >
                Launch App 🚀
              </button>
              <a
                href="https://github.com/Start-FidelGenre/agentic-ecommerce-x402-hackaton"
                target="_blank"
                rel="noreferrer"
                className="px-8 py-3.5 rounded-full glass border border-white/10 text-white font-bold text-sm tracking-wide hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                Source Code 💻
              </a>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col relative z-10 overflow-hidden"
          >
            {/* Header - Fixed Height */}
            <header className="flex-none h-16 w-full max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center border-b border-white/5 bg-white/5 backdrop-blur-md z-20">
              <div className="flex items-center gap-2 md:gap-4">
                {/* Back to Intro Button */}
                <button
                  onClick={() => setShowLanding(true)}
                  className="p-1.5 md:p-2.5 rounded-xl glass hover:bg-white/10 transition-colors shrink-0"
                  title="Back to Intro"
                >
                  <ArrowLeft className="w-4 h-4 md:w-6 md:h-6 text-white/50" />
                </button>

                <div className="flex items-center gap-2 md:gap-4">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className="p-1.5 md:p-2.5 rounded-xl glass glow-border shrink-0"
                  >
                    <Cpu className="w-4 h-4 md:w-6 md:h-6 text-purple-400" />
                  </motion.div>
                  <div className="flex flex-col">
                    <h1 className="text-sm md:text-xl font-bold tracking-tight leading-none md:leading-normal">
                      <span className="shimmer-text">StealthBid Agents</span>
                    </h1>
                    {/* Badges - Hidden on mobile to save space */}
                    <div className="hidden md:flex items-center gap-2 mt-0.5">
                      <span className="tech-badge badge-purple">SKALE</span>
                      <span className="tech-badge badge-cyan">BITE V2</span>
                      <span className="tech-badge badge-green">x402</span>
                      <span className="tech-badge badge-amber">Gemini AI</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => setMode('1v1')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2",
                    mode === '1v1' ? "bg-white text-black shadow-lg" : "text-white/50 hover:text-white"
                  )}
                >
                  <User className="w-3 h-3" />
                  1v1
                </button>
                <button
                  onClick={() => setMode('multi')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2",
                    mode === 'multi' ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg" : "text-white/50 hover:text-white"
                  )}
                >
                  <Users className="w-3 h-3" />
                  Grid
                </button>
              </div>

              <WalletConnect />
            </header>

            {/* Main Content Area - Expands to fill space between Header and Footer */}
            <div className="flex-1 w-full max-w-7xl mx-auto flex overflow-hidden min-h-0 relative">

              {/* Center Scrolling Panel */}
              <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative px-4 py-6 md:px-6">
                <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col items-center pb-8">

                  {/* 1v1 MODE CONTENT */}
                  {mode === '1v1' && (
                    <>
                      {/* Timeline - Only show when active */}
                      <AnimatePresence>
                        {agentState !== 'IDLE' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="w-full mb-8"
                          >
                            <ProgressTimeline state={agentState} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* IDLE State: Hero & Input */}
                      <AnimatePresence mode="wait">
                        {agentState === 'IDLE' && (
                          <motion.div
                            key="hero"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="w-full space-y-6 flex-1 flex flex-col justify-center items-center py-10"
                          >
                            {/* Title */}
                            <div className="text-center space-y-3">
                              <motion.h2
                                className="text-3xl md:text-5xl font-bold tracking-tight text-white"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                              >
                                Autonomous Agent
                                <br />
                                <span className="shimmer-text">Service Commerce</span>
                              </motion.h2>
                              <motion.p
                                className="text-white/40 text-xs md:text-sm max-w-md mx-auto px-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                              >
                                Describe a task. An AI agent will analyze needs, find providers,
                                negotiate price, and settle payment on-chain.
                              </motion.p>
                            </div>

                            {/* 1v1 Item Selector */}
                            <motion.div
                              className="w-full max-w-xl mx-auto space-y-4"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                            >
                              <ItemSelector
                                selectedItem={selectedItem}
                                onSelect={(item) => {
                                  setSelectedItem(item)
                                  setObjective(`I need to acquire ${item.name}. My max budget is ${item.basePrice} SKL.`)
                                }}
                              />
                            </motion.div>

                            {/* 1v1 Agent Selector */}
                            <motion.div
                              className="w-full max-w-xl mx-auto"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.45 }}
                            >
                              <AgentSelector
                                selectedAgents={[selected1v1AgentId]}
                                onToggle={toggleAgentSelection}
                                mode="single"
                              />
                            </motion.div>

                            {/* Input Container */}
                            {/* Input Container or Ready State */}
                            {(mode === '1v1' && selectedItem) ? (
                              <div className="w-full max-w-xl relative z-20 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 flex flex-col items-center gap-4 text-center">
                                <div>
                                  <h3 className="text-xl font-bold text-white">Ready to Acquire {selectedItem.name}</h3>
                                  <p className="text-white/50 text-sm">Target Price: {selectedItem.basePrice} SKL</p>
                                </div>

                                <button
                                  onClick={handleDeploy}
                                  className="w-full max-w-sm py-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl font-bold text-lg shadow-lg hover:shadow-cyan-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                                >
                                  <Zap className="w-5 h-5 fill-current" />
                                  Start 1v1 Negotiation
                                </button>

                                <button
                                  onClick={() => setSelectedItem(null)}
                                  className="text-xs text-white/30 hover:text-white transition-colors"
                                >
                                  Cancel / Custom Request
                                </button>
                              </div>
                            ) : (
                              <div className="w-full max-w-xl relative group z-20">
                                {/* Glow Effect */}
                                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600/50 to-cyan-600/50 blur opacity-20 group-hover:opacity-40 transition duration-500" />

                                <div className="relative glass rounded-2xl p-2 md:p-3 flex items-center gap-3 border border-white/10 group-hover:border-white/20 transition-colors">
                                  <div className="p-2 md:p-3 rounded-xl bg-purple-500/10 text-purple-400">
                                    <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                                  </div>

                                  <input
                                    type="text"
                                    value={objective}
                                    onChange={(e) => setObjective(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleDeploy()}
                                    placeholder="e.g., 'Find a rendering service for under 0.5 sFUEL'"
                                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/20 text-sm md:text-base font-medium"
                                  />

                                  <div className="flex items-center gap-2">
                                    {/* Voice Input */}
                                    <button
                                      onClick={startListening}
                                      className={cn(
                                        "p-2 md:p-2.5 rounded-xl transition-all duration-300 relative",
                                        isListening
                                          ? "bg-red-500/20 text-red-400 animate-pulse ring-1 ring-red-500/50"
                                          : "hover:bg-white/10 text-white/40 hover:text-white"
                                      )}
                                      title="Voice Input"
                                    >
                                      <Mic className="w-4 h-4 md:w-5 md:h-5" />
                                      {isListening && (
                                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                        </span>
                                      )}
                                    </button>

                                    {/* Action Button */}
                                    <button
                                      onClick={handleDeploy}
                                      disabled={!objective.trim()}
                                      className="hidden md:flex bg-white text-black px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none items-center gap-2"
                                    >
                                      Deploy Agent
                                      <Zap className="w-4 h-4 fill-current" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Agent Terminal & Active UI */}
                      <AnimatePresence mode="wait">
                        {agentState !== 'IDLE' && (
                          <motion.div
                            key="terminal"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full flex-1 flex flex-col gap-4 min-h-[400px]"
                          >
                            <AgentTerminal
                              logs={logs}
                              status={agentState}
                            />

                            {/* Reset Button */}
                            {agentState !== 'TRANSACTING' && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-center"
                              >
                                <button
                                  onClick={resetAgent}
                                  className="px-6 py-2.5 rounded-full glass text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                                >
                                  {agentState === 'COMPLETED' || agentState === 'ERROR' ? '← New Request' : '✕ Cancel Agent'}
                                </button>
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}

                  {/* MULTI-AGENT MODE CONTENT */}
                  {mode === 'multi' && (
                    <div className="w-full space-y-8">
                      {!isBattleActive ? (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-8 max-w-3xl mx-auto"
                        >
                          <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold">Negotiation Grid</h2>
                            <p className="text-white/50">Pit multiple AI agents against each other to find the absolute best market price.</p>
                          </div>

                          <div className="p-6 glass rounded-2xl border border-white/10 space-y-8">
                            <ItemSelector selectedItem={selectedItem} onSelect={setSelectedItem} />
                            <div className="w-full h-px bg-white/5" />
                            <AgentSelector
                              selectedAgents={selectedAgentIds}
                              onToggle={toggleAgentSelection}
                              onSelectAll={() => {
                                if (selectedAgentIds.length === AGENT_PERSONAS.length) {
                                  setSelectedAgentIds([])
                                } else {
                                  setSelectedAgentIds(AGENT_PERSONAS.map(p => p.id))
                                }
                              }}
                            />

                            <button
                              onClick={handleDeploy}
                              disabled={!selectedItem || selectedAgentIds.length < 2}
                              className="w-full py-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl font-bold text-lg shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
                            >
                              Start Negotiation Grid
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="w-full"
                        >
                          {selectedItem && (
                            <NegotiationView
                              agents={agents}
                              targetItem={selectedItem}
                              round={round}
                            />
                          )}

                          {winner && (
                            <motion.div
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              className="mt-8 flex justify-center"
                            >
                              <div className="flex gap-4">
                                <button
                                  onClick={handleGenerateReceipt}
                                  className="px-6 py-3 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-all flex items-center gap-2"
                                >
                                  <FileJson className="w-4 h-4" />
                                  View Receipt
                                </button>
                                <button
                                  onClick={resetBattle}
                                  className="px-8 py-3 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform"
                                >
                                  Start New Battle
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* x402 Settlement Animation */}
                  <AnimatePresence>
                    {agentState === 'TRANSACTING' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 pointer-events-none flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
                      >
                        <div className="relative pointer-events-auto">
                          <motion.div
                            animate={{ scale: [1, 2, 3], opacity: [0.3, 0.15, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-green-500/10 rounded-full blur-2xl"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.5, 2], opacity: [0.2, 0.1, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            className="absolute inset-0 bg-cyan-500/10 rounded-full blur-xl"
                          />
                          <div className="glass-strong rounded-2xl p-8 flex flex-col items-center gap-3 glow-border bg-black/80">
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            >
                              <Zap className="w-12 h-12 text-green-400" />
                            </motion.div>
                            <div className="text-2xl font-bold shimmer-text">x402 PAYMENT</div>
                            <div className="text-sm text-green-300/80">MEV-Protected • Gasless • Instant</div>
                            <div className="flex gap-2 mt-1">
                              <span className="tech-badge badge-green">SKALE</span>
                              <span className="tech-badge badge-cyan">Kobaru</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>

              {/* Right Sidebar - Pinned Pinned to viewport */}
              <AnimatePresence>
                {(agentState !== 'IDLE' && mode === '1v1') && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 320, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="hidden lg:block h-full border-l border-white/5 bg-black/20 flex-none overflow-hidden relative z-20"
                  >
                    <EventSidebar logs={logs} />
                  </motion.div>
                )}
              </AnimatePresence>

            </div>


            {/* Receipt Modal */}
            <AnimatePresence>
              {showReceipt && receipt && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-[#1a1b26] rounded-2xl border border-white/10 w-full max-w-2xl overflow-hidden shadow-2xl relative"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 text-green-400 rounded-lg">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Proof of Settlement</h3>
                          <p className="text-xs text-white/50 font-mono">ID: {receipt.id}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowReceipt(false)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Intent Mandate</label>
                          <p className="text-white font-medium">{receipt.intentMandate.target}</p>
                          <p className="text-sm text-white/50">Max Budget: {receipt.intentMandate.maxBudget} SKL</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Cart Mandate</label>
                          <div className="flex justify-between">
                            <span className="text-white">{receipt.cartMandate.item}</span>
                            <span className="text-cyan-400 font-mono">{receipt.cartMandate.finalPrice} SKL</span>
                          </div>
                          <div className="text-xs text-white/50 mt-1 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {receipt.cartMandate.provider}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-black/30 border border-white/5 font-mono text-xs overflow-x-auto">
                        <div className="flex justify-between text-white/40 mb-2">
                          <span>PAYMENT PROOF</span>
                          <span>{receipt.payment.network}</span>
                        </div>
                        <div className="text-green-400 break-all">
                          {receipt.payment.transactionHash}
                        </div>
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `receipt-${receipt.id}.json`
                            a.click()
                          }}
                          className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:scale-105 active:scale-95 transition-all"
                        >
                          <FileJson className="w-4 h-4" />
                          Download JSON Receipt
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer - Fixed Height Pinned to Bottom */}
            <footer className="flex-none h-12 w-full max-w-7xl mx-auto px-6 border-t border-white/5 bg-white/5 backdrop-blur-md z-20 flex justify-between items-center text-[10px] text-white/30 font-mono">
              <span>Built for SF Agentic Commerce x402 Hackathon</span>
              <span>SKALE • BITE V2 • x402 • Gemini • Kobaru</span>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
