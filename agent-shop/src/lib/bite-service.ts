// SKALE BITE V2 (Blockchain Integrated Threshold Encryption) Service
// Uses the real @skalenetwork/bite SDK for encrypted transactions on the BITE V2 Sandbox
import { BITE } from '@skalenetwork/bite'

const SANDBOX_RPC = 'https://base-sepolia-testnet.skalenodes.com/v1/bite-v2-sandbox'

// Singleton BITE instance
let biteInstance: BITE | null = null

function getBite(): BITE {
    if (!biteInstance) {
        biteInstance = new BITE(SANDBOX_RPC)
    }
    return biteInstance
}

export class BiteService {
    /**
     * Encrypts a transaction using BITE V2 threshold encryption.
     * The `to` and `data` fields are encrypted so validators can't see them
     * until after block finality when the threshold key is reconstructed.
     */
    static async encryptTransaction(tx: { to: string; data: string; value?: string }): Promise<any> {
        console.log('BITE V2: Encrypting transaction with distributed threshold key...')
        const bite = getBite()
        const encryptedTx = await bite.encryptTransaction(tx)
        console.log('BITE V2: Transaction encrypted — to/data fields hidden until block finality')
        return encryptedTx
    }

    /**
     * Retrieves the decrypted transaction data after block finality.
     * The threshold decryption happens automatically once the block is finalized.
     */
    static async getDecryptedData(txHash: string): Promise<{ to: string; data: string }> {
        console.log('BITE V2: Fetching decrypted transaction data post-finality...')
        const bite = getBite()
        const result = await bite.getDecryptedTransactionData(txHash)
        console.log('BITE V2: Transaction decrypted — original to/data revealed')
        return result as unknown as { to: string; data: string }
    }

    /**
     * Encrypts an arbitrary message using BITE threshold encryption.
     * Useful for encrypting offer details, bids, etc.
     */
    static async encryptMessage(message: string): Promise<string> {
        console.log('BITE V2: Encrypting message with threshold key...')
        const bite = getBite()
        const encrypted = await bite.encryptMessage(message)
        return encrypted
    }

    /**
     * Gets info about the current BITE committee (validators participating in threshold encryption).
     */
    static async getCommitteeInfo(): Promise<any> {
        const bite = getBite()
        return await bite.getCommitteesInfo()
    }

    /**
     * Fallback: simulated encryption for when BITE SDK is unavailable.
     * Used as graceful degradation.
     */
    static async encryptOfferFallback(offerDetails: any): Promise<string> {
        console.log('BITE: Using fallback encryption (simulated)...')
        await new Promise(resolve => setTimeout(resolve, 300))
        return btoa(JSON.stringify(offerDetails))
    }

    static async decryptOfferFallback(encryptedData: string): Promise<any> {
        console.log('BITE: Using fallback decryption (simulated)...')
        await new Promise(resolve => setTimeout(resolve, 300))
        return JSON.parse(atob(encryptedData))
    }
}
