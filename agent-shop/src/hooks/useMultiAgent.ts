```typescript
'use client'

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
                    timestamp: Date.now() + 200,
                    type: 'info',
                    content: `Safety Check Passed.Wallet authorized.`
                })
            }

            return {
                persona: p,
                status: 'idle',
                currentBid: 0,
                logs: initialLogs
            }
        })

        setAgents(initialAgents)
        setIsBattleActive(true)
        setRound(1)
        setWinner(null)

        // Simulate Battle Logic
        let currentRound = 1
        const maxRounds = 5

        // Clear any existing interval
        if (battleInterval.current) clearInterval(battleInterval.current)

        battleInterval.current = setInterval(() => {
            setAgents(prevAgents => {
                // Randomly select an agent to act
                const activeAgentIndex = Math.floor(Math.random() * prevAgents.length)

                return prevAgents.map((agent, index) => {
                    if (index !== activeAgentIndex) return agent

                    // Logic for the active agent
                    const newLog: AgentLog = {
                        id: crypto.randomUUID(),
                        timestamp: Date.now(),
                        type: 'thought',
                        content: `Analyzing market... Round ${ currentRound } `
                    }

                    // Simple bidding logic simulation
                    let bid = agent.currentBid
                    let status: BattleAgent['status'] = agent.status

                    if (currentRound <= maxRounds) {
                        const randomAction = Math.random()

                        // Trust & Safety: Lower drop chance for demo reliability
                        if (currentRound >= 4 && Math.random() > 0.95 && agent.status !== 'dropped') {
                            newLog.type = 'error'
                            newLog.content = `🛑 Safety Guardrail: Budget limit nearing.Halting current path.`
                            status = 'dropped'
                            // ... stay dropped ...
                        } else if (randomAction > 0.1) { // 90% chance to act
                            // Place a bid
                            const base = item.basePrice
                            // Random bid around base price, decreasing slightly each round (reverse auction)
                            const variance = (Math.random() * 0.1) - 0.05 // +/- 5%
                            const roundMultiplier = 1 - (currentRound * 0.04) // Price drops faster for dramatic effect

                            // Ensure bid is never 0 and is around base price
                            const newBid = Math.floor(base * roundMultiplier * (1 + variance) * 100) / 100
                            bid = newBid > 0 ? newBid : base

                            // Conversational Messages based on Persona
                            const messages = {
                                'shark-buy': [
                                    `I'll shatter the competition with a bid of ${bid} sFUEL! Witness the power of aggressive negotiation. 💥`,
    `Too slow! I'm moving the needle to ${bid} sFUEL before anyone else can blink. 🦈`,
    `This ${item.name} belongs in my portfolio. Crushing the market at ${bid} sFUEL. 🔥`
                                ],
'sniper-bot': [
    `Precision is my game. Calculating the optimal threshold at ${bid} sFUEL. 🎯`,
    `I've identified the perfect entry point. Bidding ${bid} sFUEL with surgical accuracy. 💎`,
    `Unveiling the true underlying value of ${item.name}. My offer is ${bid} sFUEL. 🦾`
],
    'whale-cap': [
        `The grid belongs to the bold. Capitalizing on this opportunity with ${bid} sFUEL. 🐋`,
        `Liquidity optimized. I'm taking the lead with a strategic ${bid} sFUEL play. 🚀`,
        `Market dominance established. My definitive offer stands at ${bid} sFUEL. 📈`
    ]
                            }

const personaMessages = messages[agent.persona.id as keyof typeof messages] || [
    `Strategic bid placed at ${bid} sFUEL. Monitoring grid response...`
]

newLog.type = 'action'
newLog.content = personaMessages[Math.floor(Math.random() * personaMessages.length)]
status = 'bidding'
                        } else {
    newLog.content = "Observing competitor patterns..."
    status = 'holding'
}
                    } else {
    // End of battle
    status = 'idle'
}

return {
    ...agent,
    currentBid: bid,
    status: status,
    logs: [...agent.logs, newLog]
}
                })
            })

if (currentRound >= maxRounds) {
    if (battleInterval.current) clearInterval(battleInterval.current)
    setIsBattleActive(false)

    // REVEAL PHASE
    setAgents(prev => prev.map(a => ({
        ...a,
        logs: [...a.logs, {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            type: 'action',
            content: `🔓 Decrypting BITE Offer...`
        }]
    })))

    setTimeout(() => {
        finalizeWinner()
    }, 1500)
}

// Increment round occasionally/visually
if (Math.random() > 0.8) {
    currentRound++
    setRound(r => r + 1)
}

        }, 2000) // Action every 2 seconds

    }, [])

const finalizeWinner = useCallback(() => {
    setAgents(prev => {
        const highestBid = Math.max(...prev.map(a => a.currentBid))

        // Side effect: Find winner to set state (might trigger re-render, but safe in this Effect-like callback)
        const winnerAgent = prev.find(a => a.currentBid === highestBid && a.currentBid > 0)
        if (winnerAgent) setWinner(winnerAgent)

        return prev.map(a => {
            // Fix: Only mark the specific selected winnerAgent as 'winner', not just anyone with the matching bid
            const isWinner = winnerAgent ? a.persona.id === winnerAgent.persona.id : false
            const newStatus: BattleAgent['status'] = isWinner ? 'winner' : 'dropped'

            // Add final log
            return {
                ...a,
                status: newStatus,
                logs: [...a.logs, {
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    type: 'info',
                    content: `🔓 Offer Revealed: ${a.currentBid > 0 ? a.currentBid.toFixed(2) : highestBid.toFixed(2)} sFUEL`
                }]
            }
        })
    })
}, [])

const resetBattle = useCallback(() => {
    if (battleInterval.current) clearInterval(battleInterval.current)
    setAgents([])
    setIsBattleActive(false)
    setRound(0)
    setWinner(null)
}, [])

return {
    agents,
    isBattleActive,
    round,
    winner,
    startBattle,
    resetBattle
}
}
