/**
 * Agent Shop - Presentation Page 🏪
 * 
 * Hosting the landing page UI and redirecting to /dashboard.
 */
'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Zap,
  Sparkles,
  Lock as LockIcon,
  Globe,
  Github,
  Box
} from 'lucide-react'

export default function Home() {
  const router = useRouter()

  const handleLaunch = () => {
    // Navigate to the real app
    router.push('/dashboard')
  }

  return (
    <main className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#0d1117] flex flex-col items-center justify-center p-6 text-white">
      <div className="mesh-bg absolute inset-0 z-0 pointer-events-none opacity-50" />
      <div className="grid-overlay absolute inset-0 z-0 pointer-events-none opacity-20" />

      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />

      <div className="relative z-10 max-w-6xl w-full flex flex-col items-center text-center">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-6">
            <Globe className="w-3 h-3" />
            BITE Protocol V2
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-none italic uppercase"
        >
          STEALTHBID
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl leading-relaxed"
        >
          Autonomous Commerce Platform. Encrypted Negotiators. <br className="hidden md:block" />
          Finality on SKALE Nebula. Performance by Gemini.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row items-center gap-4 mb-20"
        >
          <button
            onClick={handleLaunch}
            className="px-12 py-5 bg-white text-black font-black rounded-2xl text-lg shadow-[0_0_50px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 w-full md:w-auto"
          >
            <Zap className="w-5 h-5 fill-black" />
            LAUNCH APP
          </button>
          <a
            href="https://github.com/FidelGenre/agentic-ecommerce-x402-hackaton"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl text-lg hover:bg-white/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 w-full md:w-auto"
          >
            <Github className="w-5 h-5" />
            SOURCE CODE
          </a>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-8 w-full"
        >
          <div className="text-[10px] text-white/20 uppercase font-black tracking-[0.3em]">Built for the future of commerce</div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-40 hover:opacity-100 transition-opacity duration-700">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-2">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">SKALE Nebula</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-2">
                <Sparkles className="w-6 h-6 text-indigo-400" />
              </div>
              <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">Gemini AI</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-2">
                <LockIcon className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">BITE Protocol</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-2">
                <Box className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">X402 Standard</span>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
