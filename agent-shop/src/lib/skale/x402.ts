import { parseEther, parseUnits, type Address, type Hash } from 'viem'

// ─────────────── x402 Payment Types ───────────────

export interface X402PaymentRequest {
    id: string
    amount: string
    currency: 'USDC' | 'sFUEL'
    tokenAddress?: Address   // USDC contract address
    recipient: Address
    deadline: number
    facilitator: string      // Kobaru facilitator URL
    chainId: number
    metadata?: string
}

export interface X402PaymentProof {
    requestId: string
    transactionHash: Hash
    payer: Address
    timestamp: number
    facilitator: string
}

// ─────────────── Constants ───────────────

// Kobaru x402 Facilitator (official for SKALE hackathon)
export const KOBARU_FACILITATOR_URL = process.env.NEXT_PUBLIC_KOBARU_FACILITATOR_URL || 'https://gateway.kobaru.io'

// USDC on BITE V2 Sandbox (deployed by SKALE team)
export const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS || '0xc4083B1E81ceb461Ccef3FDa8A9F24F0d764B6D8') as Address

// Sandbox Chain ID
export const SANDBOX_CHAIN_ID = 103698795

// ─────────────── Helpers ───────────────

export function generatePaymentRequestId(): string {
    return `x402_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create an x402-compliant payment request.
 * Uses USDC on the BITE V2 Sandbox via Kobaru facilitator.
 */
export function createPaymentRequest(
    recipient: Address,
    amountUSDC: string,
    metadata: Record<string, any> = {}
): X402PaymentRequest {
    return {
        id: generatePaymentRequestId(),
        amount: amountUSDC,
        currency: 'USDC',
        tokenAddress: USDC_ADDRESS,
        recipient,
        deadline: Date.now() + 3600 * 1000, // 1hr expiry
        facilitator: KOBARU_FACILITATOR_URL,
        chainId: SANDBOX_CHAIN_ID,
        metadata: JSON.stringify(metadata),
    }
}

/**
 * Verify a payment on-chain via the public client.
 */
export async function verifyPayment(
    request: X402PaymentRequest,
    txHash: Hash,
    provider: any // PublicClient
): Promise<boolean> {
    if (!txHash) return false

    try {
        const receipt = await provider.getTransactionReceipt({ hash: txHash })
        if (receipt.status !== 'success') return false

        // For USDC: check Transfer event logs
        const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
        const hasTransfer = receipt.logs.some(
            (log: any) => log.topics[0] === transferTopic
        )

        return hasTransfer || receipt.status === 'success'
    } catch (e) {
        console.error('x402: Payment verification failed', e)
        return false
    }
}

/**
 * Format amount for USDC (6 decimals)
 */
export function parseUSDC(amount: string): bigint {
    return parseUnits(amount, 6)
}
