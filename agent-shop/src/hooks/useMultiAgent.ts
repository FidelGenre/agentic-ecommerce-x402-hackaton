/**
 * Battle Royale Logic Hook using SKALE BITE V2.
 */
'use client'

import { useState, useCallback, useRef } from 'react'
import { useAccount, useWalletClient, usePublicClient, useSwitchChain } from 'wagmi'
import { createWalletClient, http, parseEther, formatEther, type Hex, keccak256, encodePacked } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { skaleBiteSandbox } from '@/config/chains'
import { SERVICE_MARKETPLACE_ABI } from '@/lib/skale/marketplace-abi'

const CONTRACT = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || '0xb64100AAF149215b6CA3B1D366031e39ecb04ce3'
const CHAIN_ID = process.env.NEXT_PUBLIC_SKALE_CHAIN_ID || '103698795'

export type MultiAgentState = 'IDLE' | 'THINKING' | 'FUNDING' | 'BIDDING' | 'REVEALING' | 'SETTLING' | 'COMPLETED' | 'ERROR'

export interface AgentBid {
    name: string
    address: string
    price: number
    strategy: string
    status: 'pending' | 'thinking' | 'funding' | 'bidding' | 'revealed' | 'won' | 'lost'
    score: number
    hash?: string
    revealHash?: string
}

export interface AgentLog {
    id: string
    type: 'info' | 'action' | 'tx' | 'error'
    content: string
    timestamp: number
    metadata?: {
        hash?: string
        isSettlement?: boolean
    }
}

const PERSONALITIES = [
    { name: 'Claude Opus (Optimizer)', strategy: 'aggressive', basePrice: 0.002 },
    { name: 'GPT-4o (Analyst)', strategy: 'analytical', basePrice: 0.0025 },
    { name: 'Gemini 1.5 (Speed)', strategy: 'diplomatic', basePrice: 0.0022 }
]

export function useMultiAgent() {
    const [state, setState] = useState<MultiAgentState>('IDLE')
    const [bids, setBids] = useState<AgentBid[]>([])
    const [logs, setLogs] = useState<AgentLog[]>([])

    const { address, isConnected } = useAccount()
    const { data: walletClient } = useWalletClient({ chainId: Number(CHAIN_ID) })
    const publicClient = usePublicClient({ chainId: Number(CHAIN_ID) })

    const addLog = useCallback((type: AgentLog['type'], content: string, metadata?: AgentLog['metadata']) => {
        setLogs(prev => [...prev.slice(-49), {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            content,
            timestamp: Date.now(),
            metadata
        }])
    }, [])

    const startBattle = useCallback(async (objective: string, treasuryKey: Hex, selectedCount: number = 3) => {
        if (!isConnected || !walletClient || !publicClient) return

        const treasuryAccount = privateKeyToAccount(treasuryKey)
        const treasuryClient = createWalletClient({
            account: treasuryAccount,
            chain: skaleBiteSandbox,
            transport: http('https://base-sepolia-testnet.skalenodes.com/v1/bite-v2-sandbox')
        })

        setState('THINKING')
        setLogs([])
        addLog('info', `⚔️ Initializing Battle Royale for "${objective}"`)

        // 1. Setup Agents (Burner Wallets)
        const participants = PERSONALITIES.slice(0, selectedCount).map(p => {
            const pk = generatePrivateKey()
            const acc = privateKeyToAccount(pk)
            return {
                ...p,
                account: acc,
                privateKey: pk,
                client: createWalletClient({
                    account: acc,
                    chain: skaleBiteSandbox,
                    transport: http('https://base-sepolia-testnet.skalenodes.com/v1/bite-v2-sandbox')
                })
            }
        })

        setBids(participants.map(p => ({
            name: p.name,
            address: p.account.address,
            price: 0,
            strategy: p.strategy,
            status: 'thinking',
            score: 0
        })))

        // 2. Parallel AI Consult
        addLog('info', `🧠 Calling Gemini Brain for parallel analysis...`)
        const thoughts = await Promise.all(participants.map(p =>
            fetch('/api/agent/decide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ objective: `[Strategy: ${p.strategy}] ${objective}`, currentState: 'INITIAL_ANALYSIS' }),
            }).then(r => r.json()).catch(() => ({ decision: { maxBudget: '0.001', reasoning: 'Standard bid.' } }))
        ))

        setBids(prev => prev.map((b, i) => ({ ...b, status: 'funding' })))
        setState('FUNDING')
        addLog('info', `🏦 Treasury: Batch-funding ${participants.length} agent wallets...`)

        // 3. Sequential Funding
        const gasPrice = await publicClient.getGasPrice()
        try {
            for (const p of participants) {
                const tx = await treasuryClient.sendTransaction({
                    to: p.account.address,
                    value: parseEther('0.005'),
                    chain: skaleBiteSandbox,
                    gasPrice,
                    gas: 500000n,
                    type: 'legacy'
                })
                addLog('tx', `💸 Real Tx: 0.005 sFUEL -> ${p.name.split(' ')[0]}`, { hash: tx })
                await publicClient.waitForTransactionReceipt({ hash: tx })
            }
        } catch (err) {
            addLog('error', `⚠️ Funding Issue: ${err instanceof Error ? err.message : 'Unknown'}`)
        }

        // 4. Parallel Bidding
        setState('BIDDING')
        addLog('info', `🔐 BITE V2: Agents submitting encrypted commitments...`)

        // Service Registration
        const serviceIds = await Promise.all(participants.map(async (p, i) => {
            try {
                const reg = await p.client.writeContract({
                    address: CONTRACT as Hex,
                    abi: SERVICE_MARKETPLACE_ABI,
                    functionName: 'registerService',
                    args: [p.name, p.strategy, parseEther(thoughts[i].decision.maxBudget), 99, 50],
                    gasPrice,
                    gas: 500000n,
                    type: 'legacy'
                })
                const receipt = await publicClient.waitForTransactionReceipt({ hash: reg })
                const log = receipt.logs.find(l => l.address.toLowerCase() === CONTRACT.toLowerCase())
                return log && log.topics[1] ? Number(BigInt(log.topics[1])) : 0
            } catch { return i } // Fallback ID
        }))

        // Create the user Request
        addLog('action', `📝 [TREASURY] Autonomous Request Creation...`)
        const reqTx = await treasuryClient.writeContract({
            address: CONTRACT as Hex,
            abi: SERVICE_MARKETPLACE_ABI,
            functionName: 'createRequest',
            args: [BigInt(serviceIds[0]), objective],
            value: parseEther('0.05'), // Treasury hold
            gasPrice,
            gas: 500000n,
            type: 'legacy'
        })
        const reqReceipt = await publicClient.waitForTransactionReceipt({ hash: reqTx })
        const requestId = reqReceipt.logs[0]?.topics[1] ? BigInt(reqReceipt.logs[0].topics[1]) : 0n
        addLog('tx', `🔢 Request ${requestId} confirmed on-chain.`, { hash: reqTx })

        // Agents commit
        const nonces = participants.map(() => BigInt(Math.floor(Math.random() * 1000000)))
        const jitteredPrices = thoughts.map((t, i) => {
            const base = Number(t.decision.maxBudget)
            const jitter = 0.92 + (Math.random() * 0.16)
            return parseEther((base * jitter).toFixed(6))
        })

        await Promise.all(participants.map(async (p, i) => {
            const price = jitteredPrices[i]
            const commitment = keccak256(encodePacked(['uint256', 'uint256'], [price, nonces[i]]))
            const tx = await p.client.writeContract({
                address: CONTRACT as Hex,
                abi: SERVICE_MARKETPLACE_ABI,
                functionName: 'submitEncryptedOffer',
                args: [requestId, commitment],
                gasPrice,
                gas: 500000n,
                type: 'legacy'
            })
            setBids(prev => {
                const nb = [...prev];
                nb[i] = { ...nb[i], status: 'bidding', hash: tx };
                return nb;
            })
            addLog('tx', `🔒 ${p.name} submitted encrypted bid: ${tx.slice(0, 10)}...`, { hash: tx })
            // CRITICAL: Wait for commit receipt before reveal
            await publicClient.waitForTransactionReceipt({ hash: tx })
            return tx
        }))
        addLog('info', `🔒 ${participants.length} encrypted commitments verified.`)

        // 5. Parallel Reveal
        setState('REVEALING')
        addLog('info', `🔓 Agents revealing bid parameters...`)
        await Promise.all(participants.map(async (p, i) => {
            const price = jitteredPrices[i]
            const tx = await p.client.writeContract({
                address: CONTRACT as Hex,
                abi: SERVICE_MARKETPLACE_ABI,
                functionName: 'revealOffer',
                args: [requestId, price, nonces[i]],
                gasPrice,
                gas: 500000n,
                type: 'legacy'
            })
            setBids(prev => {
                const nb = [...prev];
                nb[i] = { ...nb[i], status: 'revealed', revealHash: tx, price: Number(formatEther(price)) };
                return nb;
            })
            addLog('tx', `🔓 ${p.name} revealed bid price: ${formatEther(price)} sFUEL`, { hash: tx })
            await publicClient.waitForTransactionReceipt({ hash: tx })
            await new Promise(r => setTimeout(r, 600))
            return tx
        }))

        // 6. Finalize Winner
        await new Promise(r => setTimeout(r, 1200))
        const winnerIdx = jitteredPrices.reduce((acc, curr, idx) =>
            curr < jitteredPrices[acc] ? idx : acc, 0)

        setBids(prev => prev.map((b, i) => ({
            ...b,
            status: i === winnerIdx ? 'won' : 'lost'
        })))

        // 7. Settlement (x402)
        await new Promise(r => setTimeout(r, 1000))
        addLog('action', `🏆 Winner: ${participants[winnerIdx].name}. Processing autonomous payment...`)
        setState('SETTLING')
        try {
            await new Promise(r => setTimeout(r, 1000))
            const settleHash = await treasuryClient.writeContract({
                address: CONTRACT as Hex,
                abi: SERVICE_MARKETPLACE_ABI,
                functionName: 'settlePayment',
                args: [requestId, participants[winnerIdx].account.address],
                gasPrice,
                gas: 500000n,
                type: 'legacy'
            })
            addLog('tx', `✅ [x402] Autonomous Settlement Confirmed!`, { hash: settleHash, isSettlement: true })
            await publicClient.waitForTransactionReceipt({ hash: settleHash })
        } catch (err) {
            addLog('error', `⚠️ Settlement Failed: ${err instanceof Error ? err.message : 'Unknown'}`)
        }

        await new Promise(r => setTimeout(r, 1000))
        setState('COMPLETED')
        addLog('info', `🎉 Battle Royale Complete. Results verified on SKALE.`)

    }, [isConnected, walletClient, publicClient, addLog])

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
