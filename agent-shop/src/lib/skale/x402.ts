import { parseEther, type Address } from 'viem'

// Types for x402 Payment Request
export interface PaymentRequest {
    id: string
    amount: string // in Ether string
    currency: string // 'sFUEL' or token address
    recipient: Address
    deadline: number
    metadata?: string // JSON string for extra data
}

export interface PaymentProof {
    requestId: string
    transactionHash: string
    payer: Address
    timestamp: number
}

// Generate a unique Payment Request ID
export function generatePaymentRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Create the payment object intended for the Agent
export function createPaymentRequest(
    recipient: Address,
    amount: string,
    metadata: Record<string, any> = {}
): PaymentRequest {
    return {
        id: generatePaymentRequestId(),
        amount,
        currency: 'sFUEL', // SKALE Fuel
        recipient,
        deadline: Date.now() + 3600 * 1000, // 1 hour expiry
        metadata: JSON.stringify(metadata)
    }
}

// Helper to validate if a transaction matches the request (Basic Mock)
// In a real implementation, this would query the chain to verify tx details
export async function verifyPayment(
    request: PaymentRequest,
    txHash: string,
    provider: any // PublicClient
): Promise<boolean> {
    if (!txHash) return false

    try {
        const receipt = await provider.getTransactionReceipt({ hash: txHash })
        if (receipt.status !== 'success') return false

        // Logic to verify amount/recipient would go here
        // For now, we assume if the tx succeeded and hash is provided, it's valid for the demo flow
        return true
    } catch (e) {
        console.error('Payment verification failed', e)
        return false
    }
}
