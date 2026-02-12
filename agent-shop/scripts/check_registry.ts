import { createPublicClient, http, formatEther } from 'viem'

const SANDBOX_RPC = 'https://base-sepolia-testnet.skalenodes.com/v1/bite-v2-sandbox'
const MARKETPLACE_ADDRESS = '0xb64100AAF149215b6CA3B1D366031e39ecb04ce3' // The deployed contract from README

const SERVICE_ABI = [
    {
        name: 'nextServiceId',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        name: 'services',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'serviceId', type: 'uint256' }],
        outputs: [
            { name: 'provider', type: 'address' },
            { name: 'name', type: 'string' },
            { name: 'description', type: 'string' },
            { name: 'pricePerUnit', type: 'uint256' },
            { name: 'active', type: 'bool' },
            { name: 'uptime', type: 'uint8' },
            { name: 'rating', type: 'uint8' },
        ],
    },
] as const

async function main() {
    console.log(`Checking ServiceMarketplace at ${MARKETPLACE_ADDRESS}...`)

    const client = createPublicClient({
        transport: http(SANDBOX_RPC),
    })

    try {
        const nextId = await client.readContract({
            address: MARKETPLACE_ADDRESS as `0x${string}`,
            abi: SERVICE_ABI,
            functionName: 'nextServiceId',
        })
        console.log(`Current nextServiceId: ${nextId}`)

        if (Number(nextId) > 0) {
            const firstService = await client.readContract({
                address: MARKETPLACE_ADDRESS as `0x${string}`,
                abi: SERVICE_ABI,
                functionName: 'services',
                args: [BigInt(0)]
            })
            console.log('First Service:', firstService)
        } else {
            console.log('Registry is empty. No services registered.')
        }

    } catch (e) {
        console.error('Error reading contract:', e)
    }
}

main()
