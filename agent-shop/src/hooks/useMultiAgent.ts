/**
 * useMultiAgent - Battle Royale Logic Hook ⚔️
 * 
 * Manages the "Battle Royale" mode where multiple AI Agents compete to fulfill a user request.
 * 
 * 🎮 Game Theory:
 * 1. User sets a max budget and demand.
 * 2. Three autonomous agents (Claude, GPT-4, Gemini) are spawned.
 * 3. They analyze the request and submit sealed bids.
 * 4. The winner is selected based on the lowest price (Dutch Auction style logic) or best fit.
 * 
 * @module useMultiAgent
 */
'use client'

import { useState, useCallback } from 'react'

export type MultiAgentState = 'IDLE' | 'FUNDING' | 'ADMISSION' | 'BIDDING' | 'EXECUTING' | 'COMPLETED'

export interface AgentBid {
    name: string
    price: number
    strategy: string
    status: 'pending' | 'bidding' | 'submitted' | 'won' | 'lost'
    score: number // Internal AI confidence score
}

// Mock Agents with distinct "Personalities" for the simulation
const MOCK_AGENTS = [
    { name: 'Claude Opus (Optimizer)', strategy: 'Aggressive undercutting', basePrice: 0.002 },
    { name: 'GPT-4o (Analyst)', strategy: 'Value-based pricing', basePrice: 0.0025 },
    { name: 'Gemini 1.5 (Speed)', strategy: 'Latency prioritization', basePrice: 0.0022 }
]

export function useMultiAgent() {
    const [state, setState] = useState<MultiAgentState>('IDLE')
    const [bids, setBids] = useState<AgentBid[]>([])
    const [logs, setLogs] = useState<string[]>([])

    /**
     * startBattle - Initializes the competition
     * Spawns agents, funds them from treasury, and puts them in "Admission" state.
     * @param objective User's request
     * @param onFund Optional callback to execute real blockchain transactions
     */
    const startBattle = useCallback(async (objective: string, onFund?: (agents: { name: string, address: string }[]) => Promise<string[]>) => {
        setLogs([]) // Clear previous
        setState('FUNDING')

        // Initialize Agents immediately so they appear on UI
        const initialBids = MOCK_AGENTS.map((a, i) => ({
            name: a.name,
            price: 0,
            strategy: a.strategy,
            status: 'pending' as const,
            score: 0
        }))
        setBids(initialBids)

        // Phase 0: Authorization
        setLogs(prev => [...prev, `🔐 Security: Verifying Treasury Mandate...`])
        await new Promise(r => setTimeout(r, 800))

        // Phase 1: Funding Agents (Real or Simulated)
        setLogs(prev => [...prev, `🏦 Treasury: Dispensing Budget Allocation...`])

        // Generate Agent Wallets (Mock addresses for now, but consistent)
        const agentWallets = MOCK_AGENTS.map(a => ({
            name: a.name,
            address: `0x${Math.floor(Math.random() * 16 ** 40).toString(16).padStart(40, '0')}` // Random ETH address
        }))

        if (onFund) {
            try {
                setLogs(prev => [...prev, `⚡ SKALE: Initiating Batch Transfer to ${agentWallets.length} agents...`])
                const txHashes = await onFund(agentWallets)
                txHashes.forEach((hash, i) => {
                    const agent = agentWallets[i]
                    setLogs(prev => [...prev, `💸 Real Tx: 0.001 sFUEL -> ${agent.name}`, `   Hash: ${hash}`])
                })
            } catch (err: any) {
                setLogs(prev => [...prev, `⚠️ Funding Error: ${err.message}. Falling back to simulation.`])
                // Fallback Simulation
                MOCK_AGENTS.forEach((a, i) => {
                    const fundingAmount = (Math.random() * 0.005 + 0.002).toFixed(4)
                    setTimeout(() => {
                        setLogs(prev => [...prev, `💸 Transfer: ${fundingAmount} sFUEL sent to ${a.name}`])
                    }, 500 + (i * 600))
                })
                await new Promise(r => setTimeout(r, 2500))
            }
        } else {
            // Fallback Simulation
            MOCK_AGENTS.forEach((a, i) => {
                const fundingAmount = (Math.random() * 0.005 + 0.002).toFixed(4)
                setTimeout(() => {
                    setLogs(prev => [...prev, `💸 Transfer: ${fundingAmount} sFUEL sent to ${a.name}`])
                }, 500 + (i * 600))
            })
            await new Promise(r => setTimeout(r, 2500))
        }

        // Wait for "transfers" to complete if simulating (real ones awaited above)
        if (!onFund) await new Promise(r => setTimeout(r, 3500))

        setState('ADMISSION')
        setLogs(prev => [...prev, `📢 Protocol: Battle Royale initiated for "${objective}"`])

        // Artificial delay for UI drama
        await new Promise(r => setTimeout(r, 1500))
        setState('BIDDING')
        simulateBidding(initialBids)
    }, [])

    /**
     * simulateBidding - Core Simulation Loop
     * Agents "think" and adjust their bids dynamically.
     */
    const simulateBidding = async (currentBids: AgentBid[]) => {
        // Round 1: Initial Analysis
        setLogs(prev => [...prev, `🤖 Agents analyzing market conditions...`])
        await new Promise(r => setTimeout(r, 2000))

        const round1Bids = currentBids.map(b => ({
            ...b,
            status: 'bidding' as const,
            price: (Math.random() * 0.0005) + 0.0001 // Random initial bid
        }))
        setBids(round1Bids)

        // Round 2: Final Offer
        await new Promise(r => setTimeout(r, 2000))
        const finalBids = round1Bids.map(b => ({
            ...b,
            status: 'submitted' as const,
            price: Math.max(0.0001, b.price * (0.9 + Math.random() * 0.2)), // Variation
            score: Math.random() * 100
        }))
        setBids(finalBids)

        finalizeWinner(finalBids)
    }

    /**
     * finalizeWinner - Determines the outcome
     * Selects the lowest price agent as the winner.
     */
    const finalizeWinner = (finalBids: AgentBid[]) => {
        // Find lowest price
        const sorted = [...finalBids].sort((a, b) => a.price - b.price)
        const winner = sorted[0]

        const resultBids = finalBids.map(b => ({
            ...b,
            status: (b.name === winner.name ? 'won' : 'lost') as AgentBid['status'] // Type cast for strictness
        }))

        setBids(resultBids)
        setState('COMPLETED')
        setLogs(prev => [...prev, `🏆 Winner: ${winner.name} with bid ${winner.price.toFixed(5)} sFUEL`])
    }

    const resetBattle = useCallback(() => {
        setState('IDLE')
        setBids([])
        setLogs([])
    }, [])

    return {
        state,
        bids,
        logs,
        startBattle,
        resetBattle
    }
}
