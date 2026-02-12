/**
 * Agent Shop - Main Interface
 * 
 * A glassmorphism-styled dashboard for interacting with the autonomous agent.
 * Features:
 * - Voice Input (Web Speech API)
 * - Real-time Agent Thought Terminal
 * - Celebration Animations (Confetti)
 * - Responsive Layout
 */
'use client'

import { useState, useEffect } from 'react'
import { WalletConnect } from '@/components/wallet-connect'
import { AgentTerminal } from '@/components/agent-terminal'
import { useAgent } from '@/hooks/useAgent'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Mic, Shield, Cpu, Zap, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWindowSize } from 'react-use'
import dynamic from 'next/dynamic'

const Confetti = dynamic(() => import('react-confetti'), { ssr: false })

export default function Home() {
  const { width, height } = useWindowSize()
  const [objective, setObjective] = useState('')
  const { state, logs, processRequest, reset } = useAgent()
  const { isListening, transcript, startListening } = useVoiceInput()

  useEffect(() => {
    if (transcript) setObjective(transcript)
  }, [transcript])

  const handleDeploy = () => {
    if (!objective.trim()) return
    processRequest(objective)
  }

  return (
    <main className="min-h-screen flex flex-col items-center relative">
      {/* Background Effects */}
      {state === 'COMPLETED' && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      <div className="mesh-bg" />
      <div className="grid-overlay" />

      {/* Header */}
      <header className="z-10 w-full max-w-5xl flex justify-between items-center px-6 py-5">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="p-2.5 rounded-xl glass glow-border"
          >
            <Cpu className="w-6 h-6 text-purple-400" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="shimmer-text">Agent Service Arbitrage</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="tech-badge badge-purple">SKALE</span>
              <span className="tech-badge badge-cyan">BITE V2</span>
              <span className="tech-badge badge-green">x402</span>
              <span className="tech-badge badge-amber">Gemini AI</span>
            </div>
          </div>
        </div>
        <WalletConnect />
      </header>

      {/* Main Content */}
      <div className="z-10 w-full max-w-3xl px-6 flex-1 flex flex-col items-center justify-center gap-8 py-8">

        {/* Hero Section - Only when IDLE */}
        <AnimatePresence mode="wait">
          {state === 'IDLE' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full space-y-6"
            >
              {/* Title */}
              <div className="text-center space-y-3">
                <motion.h2
                  className="text-4xl md:text-5xl font-bold tracking-tight text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Autonomous Agent
                  <br />
                  <span className="shimmer-text">Service Commerce</span>
                </motion.h2>
                <motion.p
                  className="text-white/40 text-sm max-w-md mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  AI-powered service discovery, MEV-protected bidding via BITE encryption,
                  and gasless settlement through x402 on SKALE.
                </motion.p>
              </div>

              {/* Feature Pills */}
              <motion.div
                className="flex justify-center gap-3 flex-wrap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {[
                  { icon: Cpu, label: 'Gemini AI Brain', color: 'badge-amber' },
                  { icon: Shield, label: 'BITE Encryption', color: 'badge-cyan' },
                  { icon: Zap, label: 'x402 Payments', color: 'badge-green' },
                  { icon: Globe, label: 'Zero Gas Fees', color: 'badge-purple' },
                ].map((pill) => (
                  <div key={pill.label} className={cn("tech-badge text-xs py-1.5 px-3", pill.color)}>
                    <pill.icon className="w-3 h-3" />
                    {pill.label}
                  </div>
                ))}
              </motion.div>

              {/* Input Area */}
              <motion.div
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600 rounded-2xl opacity-10 group-hover:opacity-25 transition duration-500 blur animate-gradient" />
                <div className="relative glass-strong rounded-2xl p-1">
                  <textarea
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="Describe the service you need (e.g., 'Optimize 500 images for web compression')..."
                    className="w-full bg-transparent border-none text-white p-5 focus:ring-0 focus:outline-none resize-none h-28 placeholder:text-white/20 text-[15px]"
                  />
                  <div className="flex justify-between items-center px-4 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-white/20 font-mono uppercase tracking-wider">AI Agent Ready</span>
                      <button
                        onClick={startListening}
                        className={cn(
                          "p-2 rounded-full transition-all flex items-center gap-1.5 text-[11px] font-medium border",
                          isListening
                            ? "bg-red-500/20 border-red-500/50 text-red-400 animate-pulse"
                            : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                        )}
                      >
                        <Mic className={cn("w-3 h-3", isListening && "text-red-400")} />
                        {isListening ? 'Listening...' : 'Voice'}
                      </button>
                    </div>
                    <button
                      onClick={handleDeploy}
                      disabled={!objective.trim()}
                      className="bg-gradient-to-r from-purple-600/80 to-cyan-600/80 text-white px-7 py-2.5 rounded-full font-semibold text-sm hover:from-purple-600 hover:to-cyan-600 hover:shadow-lg hover:shadow-purple-500/15 transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Sparkles className="w-4 h-4" />
                      Deploy Agent
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Terminal + Flow Visualization */}
          {state !== 'IDLE' && (
            <motion.div
              key="terminal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full space-y-4"
            >
              {/* Step Progress Bar */}
              <div className="flex items-center justify-between px-2">
                {['THINKING', 'NEGOTIATING', 'TRANSACTING', 'COMPLETED'].map((step, i) => {
                  const stepOrder = ['THINKING', 'NEGOTIATING', 'TRANSACTING', 'COMPLETED']
                  const currentIdx = stepOrder.indexOf(state)
                  const isActive = i <= currentIdx
                  const isCurrent = step === state

                  return (
                    <div key={step} className="flex items-center gap-2 flex-1">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 shrink-0",
                        isCurrent ? "bg-purple-500 text-white shadow-lg shadow-purple-500/50 scale-110" :
                          isActive ? "bg-green-500/80 text-white" : "bg-white/5 text-white/20"
                      )}>
                        {isActive && !isCurrent ? '✓' : i + 1}
                      </div>
                      {i < 3 && (
                        <div className={cn(
                          "h-0.5 flex-1 rounded-full transition-all duration-700",
                          i < currentIdx ? "bg-green-500/60" : "bg-white/5"
                        )} />
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-between px-2 text-[10px] text-white/30 font-mono uppercase tracking-wider">
                <span>Gemini AI</span>
                <span>BITE V2</span>
                <span>x402</span>
                <span>Done</span>
              </div>

              <AgentTerminal logs={logs} status={state} />

              {/* Reset Button */}
              {(state === 'COMPLETED' || state === 'ERROR') && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                >
                  <button
                    onClick={reset}
                    className="px-6 py-2.5 rounded-full glass text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  >
                    ← New Request
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* x402 Settlement Animation */}
        <AnimatePresence>
          {state === 'TRANSACTING' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
            >
              <div className="relative">
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
                <div className="glass-strong rounded-2xl p-8 flex flex-col items-center gap-3 glow-border">
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

      {/* Footer */}
      <footer className="z-10 w-full max-w-5xl px-6 py-6 flex justify-between items-center text-[10px] text-white/15 font-mono">
        <span>Built for SF Agentic Commerce x402 Hackathon</span>
        <span>SKALE • BITE V2 • x402 • Gemini • Kobaru</span>
      </footer>
    </main>
  )
}
