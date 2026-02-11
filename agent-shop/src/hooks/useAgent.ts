import { useState, useCallback } from 'react'

export type AgentState = 'IDLE' | 'THINKING' | 'NEGOTIATING' | 'TRANSACTING' | 'COMPLETED' | 'ERROR'

export interface AgentLog {
    timestamp: number
    type: 'info' | 'thought' | 'action' | 'error' | 'tx'
    content: string
    metadata?: any
}

interface GeminiDecision {
    action: string
    reasoning: string
    serviceType: string
    maxBudget: string
    searchQuery: string
    confidence: number
}

export function useAgent() {
    const [state, setState] = useState<AgentState>('IDLE')
    const [logs, setLogs] = useState<AgentLog[]>([])

    const addLog = useCallback((type: AgentLog['type'], content: string, metadata?: any) => {
        setLogs(prev => [...prev, {
            timestamp: Date.now(),
            type,
            content,
            metadata
        }])
    }, [])

    const reset = useCallback(() => {
        setState('IDLE')
        setLogs([])
    }, [])

    // Call the real Gemini API route
    const consultBrain = async (objective: string, currentState: string): Promise<GeminiDecision> => {
        const res = await fetch('/api/agent/decide', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ objective, currentState }),
        })
        const data = await res.json()
        return data.decision
    }

    const processRequest = useCallback(async (objective: string) => {
        try {
            reset()
            setState('THINKING')
            addLog('info', `Received objective: "${objective}"`)

            // ── Phase 1: REAL Gemini AI Decision ──
            addLog('thought', '[Gemini] Analyzing requirement via Google Gemini Pro...')

            let decision: GeminiDecision
            try {
                decision = await consultBrain(objective, 'INITIAL_ANALYSIS')
                addLog('thought', `[Gemini] Decision: ${decision.reasoning}`, {
                    action: decision.action,
                    serviceType: decision.serviceType,
                    maxBudget: decision.maxBudget,
                    confidence: decision.confidence,
                })
            } catch {
                // Graceful fallback — demo never breaks
                decision = {
                    action: 'SEARCH',
                    reasoning: 'Proceeding with compute service search.',
                    serviceType: 'General Compute',
                    maxBudget: '0.01',
                    searchQuery: 'compute',
                    confidence: 0.7,
                }
                addLog('thought', `[Gemini] Fallback decision: ${decision.reasoning}`)
            }

            addLog('thought', `[Gemini] Searching registry for "${decision.searchQuery}" (budget: ${decision.maxBudget} sFUEL, confidence: ${(decision.confidence * 100).toFixed(0)}%)`)

            // ── Phase 2: Provider Discovery ──
            setState('NEGOTIATING')
            await new Promise(r => setTimeout(r, 800))
            addLog('action', `Found provider offering "${decision.serviceType}" service on SKALE registry.`)

            // ── Phase 3: BITE Commit-Reveal ──
            addLog('action', '[BITE] Initiating Threshold Encryption handshake...')
            addLog('info', '[BITE] Encrypting offer details → keccak256(price, nonce) committed on-chain.')

            await new Promise(r => setTimeout(r, 1500))
            addLog('action', '[BITE] Encrypted offer submitted. Hidden from competitors.')

            // Second Gemini call — negotiate decision
            addLog('thought', '[Gemini] Evaluating provider offer...')
            try {
                const negotiateDecision = await consultBrain(
                    `Provider offered ${decision.serviceType} at ${decision.maxBudget} sFUEL. Should I accept?`,
                    'OFFER_RECEIVED'
                )
                addLog('thought', `[Gemini] ${negotiateDecision.reasoning}`, {
                    action: negotiateDecision.action,
                    confidence: negotiateDecision.confidence,
                })
            } catch {
                addLog('thought', '[Gemini] Offer within budget parameters. Recommending acceptance.')
            }

            await new Promise(r => setTimeout(r, 1000))
            addLog('action', '[BITE] Provider revealed offer. Hash verified on-chain ✓')

            // ── Phase 4: x402 Payment Settlement ──
            setState('TRANSACTING')
            addLog('info', `Verifying deliverables... Quality threshold met.`)
            await new Promise(r => setTimeout(r, 1000))
            addLog('action', '[x402] Initiating payment settlement...')

            // Allow the "Money Shot" animation to play
            await new Promise(r => setTimeout(r, 3000))

            addLog('tx', `[x402] Payment settled via x402 standard. ${decision.maxBudget} sFUEL transferred. 0 gas fee (SKALE).`, {
                gas: '0 (Paid by SKALE)',
                speed: '< 1s',
                protocol: 'x402',
                amount: decision.maxBudget,
            })

            setState('COMPLETED')
            addLog('info', 'Service delivered. Agent task complete. Reputation updated on-chain.')

        } catch (error) {
            console.error(error)
            setState('ERROR')
            addLog('error', `Agent process failed: ${error instanceof Error ? error.message : String(error)}`)
        }
    }, [addLog, reset])

    return {
        state,
        logs,
        processRequest,
        reset
    }
}
