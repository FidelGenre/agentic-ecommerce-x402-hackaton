'use client'

import { useState, useEffect } from 'react'
import { WalletConnect } from '@/components/wallet-connect'
import { AgentTerminal } from '@/components/agent-terminal'
import { useAgent } from '@/hooks/useAgent'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, Zap, Target, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Home() {
  const [objective, setObjective] = useState('')
  const { state, logs, processRequest } = useAgent()
  const { isListening, transcript, startListening } = useVoiceInput()

  useEffect(() => {
    if (transcript) {
      setObjective(transcript)
    }
  }, [transcript])

  const handleDeploy = () => {
    if (!objective.trim()) return
    processRequest(objective)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="z-10 w-full max-w-5xl flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <Target className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Agent Service Arbitrage</h1>
            <p className="text-xs text-white/40">SKALE x402 • BITE Encryption • Google AI</p>
          </div>
        </div>
        <WalletConnect />
      </div>

      {/* Main Content */}
      <div className="z-10 w-full max-w-2xl space-y-8">

        {/* Input Area (Only visible when idle or initial thinking) */}
        <AnimatePresence>
          {state === 'IDLE' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 blur"></div>
                <div className="relative bg-black rounded-2xl border border-white/10 p-1">
                  <textarea
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="Describe the service you need (e.g., 'Optimize 500 images for web using compression')..."
                    className="w-full bg-transparent border-none text-white p-4 focus:ring-0 resize-none h-32 placeholder:text-white/20"
                  />
                  <div className="flex justify-between items-center px-4 pb-2">
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-white/30">AI Agent Ready</span>
                      <button
                        onClick={startListening}
                        className={cn("p-2 rounded-full transition-all flex items-center gap-2 text-xs font-medium border",
                          isListening
                            ? "bg-red-500/20 border-red-500/50 text-red-400 animate-pulse"
                            : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                        )}
                      >
                        <Mic className={cn("w-3 h-3", isListening && "text-red-400")} />
                        {isListening ? 'Listening...' : 'Voice Input'}
                      </button>
                    </div>
                    <button
                      onClick={handleDeploy}
                      disabled={!objective.trim()}
                      className="bg-white text-black px-6 py-2 rounded-full font-medium text-sm hover:bg-white/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-glow"
                    >
                      <Sparkles className="w-4 h-4" />
                      Deploy Agent
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Terminal Visualization */}
        <AnimatePresence>
          {state !== 'IDLE' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <AgentTerminal logs={logs} status={state} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Money Shot Animation */}
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
                  animate={{ scale: [1, 1.5, 3], opacity: [1, 0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-green-500/30 rounded-full blur-xl"
                />
                <div className="bg-green-500/20 backdrop-blur-md p-6 rounded-2xl border border-green-500/50 flex flex-col items-center gap-2">
                  <Zap className="w-12 h-12 text-green-400" />
                  <div className="text-xl font-bold text-white">x402 PAYMENT</div>
                  <div className="text-sm text-green-300">Gasless Transaction • Instant Finality</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  )
}
