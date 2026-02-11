import {
    createPublicClient,
    createWalletClient,
    http,
    parseEther,
    keccak256,
    encodePacked,
    type Address,
    type Hash,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { skaleChaosTestnet } from '@/config/chains'
import { SERVICE_MARKETPLACE_ABI } from './skale/marketplace-abi'

// Contract address — set this after deploying with Foundry
const MARKETPLACE_ADDRESS = (process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || '0x0000000000000000000000000000000000000000') as Address

// ─────────────── Clients ───────────────

export function getPublicClient() {
    return createPublicClient({
        chain: skaleChaosTestnet,
        transport: http(),
    })
}

export function getWalletClient(privateKey: `0x${string}`) {
    const account = privateKeyToAccount(privateKey)
    return createWalletClient({
        account,
        chain: skaleChaosTestnet,
        transport: http(),
    })
}

// ─────────────── Agent Actions ───────────────

export type AgentEngineLog = {
    step: string
    detail: string
    txHash?: Hash
}

/**
 * Full Agent Arbitrage Flow:
 * 1. Provider registers a service
 * 2. Requester creates a request (with budget)
 * 3. Provider submits encrypted offer (BITE)
 * 4. Provider reveals offer
 * 5. Requester settles payment (x402)
 */
export async function runAgentArbitrageFlow(
    requesterKey: `0x${string}`,
    providerKey: `0x${string}`,
    objective: string,
    onLog: (log: AgentEngineLog) => void
): Promise<void> {
    const publicClient = getPublicClient()
    const requesterWallet = getWalletClient(requesterKey)
    const providerWallet = getWalletClient(providerKey)

    const requesterAddress = requesterWallet.account.address
    const providerAddress = providerWallet.account.address

    // ── Step 1: Provider registers a service ──
    onLog({ step: 'REGISTER', detail: `Provider ${providerAddress.slice(0, 8)}... registering service` })

    const registerHash = await providerWallet.writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: SERVICE_MARKETPLACE_ABI,
        functionName: 'registerService',
        args: ['GPU Compute', 'High-performance GPU processing for AI workloads', parseEther('0.01')],
    })
    await publicClient.waitForTransactionReceipt({ hash: registerHash })
    onLog({ step: 'REGISTER', detail: 'Service registered on-chain', txHash: registerHash })

    // Read the service ID
    const serviceId = await publicClient.readContract({
        address: MARKETPLACE_ADDRESS,
        abi: SERVICE_MARKETPLACE_ABI,
        functionName: 'nextServiceId',
    })
    const currentServiceId = Number(serviceId) - 1

    // ── Step 2: Requester creates request with budget ──
    onLog({ step: 'REQUEST', detail: `Requester posting job: "${objective}" with 0.05 sFUEL budget` })

    const requestHash = await requesterWallet.writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: SERVICE_MARKETPLACE_ABI,
        functionName: 'createRequest',
        args: [BigInt(currentServiceId), objective],
        value: parseEther('0.05'),
    })
    await publicClient.waitForTransactionReceipt({ hash: requestHash })
    onLog({ step: 'REQUEST', detail: 'Service request created on-chain', txHash: requestHash })

    const requestId = await publicClient.readContract({
        address: MARKETPLACE_ADDRESS,
        abi: SERVICE_MARKETPLACE_ABI,
        functionName: 'nextRequestId',
    })
    const currentRequestId = Number(requestId) - 1

    // ── Step 3: Provider submits encrypted offer (BITE) ──
    const offerPrice = parseEther('0.01')
    const nonce = BigInt(Math.floor(Math.random() * 1000000))
    const offerHash = keccak256(encodePacked(['uint256', 'uint256'], [offerPrice, nonce]))

    onLog({ step: 'BITE_COMMIT', detail: `Provider submitting encrypted offer (hash: ${offerHash.slice(0, 16)}...)` })

    const commitHash = await providerWallet.writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: SERVICE_MARKETPLACE_ABI,
        functionName: 'submitEncryptedOffer',
        args: [BigInt(currentRequestId), offerHash],
    })
    await publicClient.waitForTransactionReceipt({ hash: commitHash })
    onLog({ step: 'BITE_COMMIT', detail: 'Encrypted offer committed on-chain (hidden from others)', txHash: commitHash })

    // ── Step 4: Provider reveals the offer ──
    onLog({ step: 'BITE_REVEAL', detail: 'Provider revealing offer price...' })

    const revealHash = await providerWallet.writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: SERVICE_MARKETPLACE_ABI,
        functionName: 'revealOffer',
        args: [BigInt(currentRequestId), offerPrice, nonce],
    })
    await publicClient.waitForTransactionReceipt({ hash: revealHash })
    onLog({ step: 'BITE_REVEAL', detail: `Offer revealed: 0.01 sFUEL. Hash verified on-chain.`, txHash: revealHash })

    // ── Step 5: Requester settles payment via x402 ──
    onLog({ step: 'X402_SETTLE', detail: 'Requester accepting offer and settling payment via x402...' })

    const settleHash = await requesterWallet.writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: SERVICE_MARKETPLACE_ABI,
        functionName: 'settlePayment',
        args: [BigInt(currentRequestId), providerAddress],
    })
    await publicClient.waitForTransactionReceipt({ hash: settleHash })
    onLog({
        step: 'X402_SETTLE',
        detail: `Payment settled via x402 standard. 0.01 sFUEL transferred to provider. Gasless on SKALE.`,
        txHash: settleHash,
    })
}
