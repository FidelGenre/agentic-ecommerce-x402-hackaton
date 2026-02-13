
import { motion } from 'framer-motion'
import { AgentState } from '@/hooks/useAgent'
import { CheckCircle2, Circle, Clock, Calculator, Handshake, CreditCard, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressTimelineProps {
    state: AgentState
}

const STEPS = [
    { id: 'THINKING', label: 'Analysis', icon: Calculator },
    { id: 'NEGOTIATING', label: 'Negotiation', icon: Handshake }, // Covers MATCHED & REVEALING
    { id: 'TRANSACTING', label: 'Settlement', icon: CreditCard },
    { id: 'COMPLETED', label: 'Done', icon: CheckCircle },
]

export function ProgressTimeline({ state }: ProgressTimelineProps) {
    if (state === 'IDLE' || state === 'ERROR') return null

    // Map internal states to step indices
    const getCurrentStepIndex = () => {
        switch (state) {
            case 'THINKING': return 0
            case 'NEGOTIATING': return 1
            case 'TRANSACTING': return 2
            case 'COMPLETED': return 3
            default: return 0 // Fallback
        }
    }

    const currentIndex = getCurrentStepIndex()

    return (
        <div className="w-full max-w-4xl mx-auto mb-8 px-4">
            <div className="relative flex justify-between items-center">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -z-10" />
                <motion.div
                    className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 -z-10"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />

                {STEPS.map((step, index) => {
                    const isActive = index === currentIndex
                    const isCompleted = index < currentIndex
                    const Icon = step.icon

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 relative">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                    backgroundColor: isActive || isCompleted ? '#000' : '#000',
                                    borderColor: isActive ? '#a855f7' : isCompleted ? '#22d3ee' : 'rgba(255,255,255,0.1)'
                                }}
                                className={cn(
                                    "w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 bg-black transition-colors duration-300",
                                    isActive && "shadow-[0_0_15px_rgba(168,85,247,0.5)]",
                                    isCompleted && "shadow-[0_0_10px_rgba(34,211,238,0.3)] border-cyan-400"
                                )}
                            >
                                {isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                                ) : (
                                    <Icon className={cn(
                                        "w-5 h-5",
                                        isActive ? "text-purple-400" : "text-white/20"
                                    )} />
                                )}
                            </motion.div>

                            <div className={cn(
                                "absolute -bottom-6 text-[10px] md:text-xs font-medium tracking-wide whitespace-nowrap transition-colors duration-300",
                                isActive ? "text-white" : isCompleted ? "text-cyan-400" : "text-white/30"
                            )}>
                                {step.label}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
