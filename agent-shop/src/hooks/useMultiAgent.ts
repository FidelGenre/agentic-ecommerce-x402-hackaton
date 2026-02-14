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

export type MultiAgentState = 'IDLE' | 'ADMISSION' | 'BIDDING' | 'EXECUTING' | 'COMPLETED'

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
     * Spawns agents and puts them in "Admission" state.
     */
    const startBattle = useCallback(async (objective: string) => {
        setState('ADMISSION')
        setLogs(prev => [...prev, `📢 Protocol: Battle Royale initiated for "${objective}"`])

        // Initialize agents
        const initialBids = MOCK_AGENTS.map(a => ({
            name: a.name,
            price: 0,
            strategy: a.strategy,
            status: 'pending' as const,
            score: 0
        }))
        setBids(initialBids)

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
