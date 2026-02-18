import { createPublicClient, createWalletClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import dotenv from 'dotenv'
import { join } from 'path'

dotenv.config({ path: '.env.local' })

const MARKETPLACE_ADDRESS = '0xb64100AAF149215b6CA3B1D366031e39ecb04ce3'
const RPC_URL = 'https://base-sepolia-testnet.skalenodes.com/v1/bite-v2-sandbox'
const PRIVATE_KEY = process.env.NEXT_PUBLIC_BOT_PRIVATE_KEY

const account = privateKeyToAccount(PRIVATE_KEY)
console.log(`Using Agent/Bot Address: ${account.address}`)

const publicClient = createPublicClient({
    chain: { id: 103698795, name: 'BITE', nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 }, rpcUrls: { default: { http: [RPC_URL] } } },
    transport: http()
})

const walletClient = createWalletClient({
    account,
    chain: { id: 103698795, name: 'BITE', nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 }, rpcUrls: { default: { http: [RPC_URL] } } },
    transport: http()
})

const API = [
    {
        type: "function",
        name: "registerService",
        inputs: [
            { name: "_name", type: "string" },
            { name: "_description", type: "string" },
            { name: "_pricePerUnit", type: "uint256" },
            { name: "_uptime", type: "uint8" },
            { name: "_rating", type: "uint8" },
        ],
        outputs: [{ name: "serviceId", type: "uint256" }],
        stateMutability: "nonpayable",
    }
]

async function register() {
    console.log('Registering STEALTHBID service on-chain...')
    try {
        const { request } = await publicClient.simulateContract({
            address: MARKETPLACE_ADDRESS,
            abi: API,
            functionName: 'registerService',
            args: [
                'STEALTHBID Market Intel',
                'Elite intelligence for SKALE ecosystem',
                parseEther('0.01'),
                100,
                5
            ],
            account
        })

        const hash = await walletClient.writeContract(request)
        console.log(`Transaction submitted! Hash: ${hash}`)

        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        console.log(`Service registered successfully!`)

        const nextId = await publicClient.readContract({
            address: MARKETPLACE_ADDRESS,
            abi: [{ name: 'nextServiceId', type: 'function', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' }],
            functionName: 'nextServiceId'
        })

        console.log(`New Service ID: ${Number(nextId) - 1}`)
    } catch (e) {
        console.error('Registration failed:', e)
    }
}

register()
