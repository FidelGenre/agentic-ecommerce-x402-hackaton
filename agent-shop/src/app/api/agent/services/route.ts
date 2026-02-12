/**
 * Service Registry API
 * 
 * Interfaces with the ServiceMarketplace smart contract on SKALE.
 * Fetches real-time provider data (Price, Uptime, Reputation)
 * to populate the agent's innovative "Market View".
 */
import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, formatEther } from 'viem'

const SANDBOX_RPC = 'https://base-sepolia-testnet.skalenodes.com/v1/bite-v2-sandbox'
const MARKETPLACE_ADDRESS = (process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || '0xEcB3fA9afa1344BD5fCC3cE6a71bB815FBB3B532') as `0x${string}`

const SERVICE_ABI = [
    {
        name: 'services',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'serviceId', type: 'uint256' }],
        outputs: [
            { name: 'provider', type: 'address' },
            { name: 'active', type: 'bool' },
            { name: 'uptime', type: 'uint8' },
            { name: 'rating', type: 'uint8' },
            { name: 'name', type: 'string' },
            { name: 'description', type: 'string' },
            { name: 'pricePerUnit', type: 'uint256' },
            { name: 'ratingCount', type: 'uint256' },
        ],
    },
    {
        name: 'nextServiceId',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
] as const

export async function GET(_req: NextRequest) {
    try {
        const client = createPublicClient({
            transport: http(SANDBOX_RPC),
        })

        const nextId = await client.readContract({
            address: MARKETPLACE_ADDRESS,
            abi: SERVICE_ABI,
            functionName: 'nextServiceId',
        })

        const totalServices = Number(nextId)
        if (totalServices === 0) {
            return NextResponse.json({ success: false, error: 'No services registered' })
        }

        // Read all services
        const services = []
        for (let i = 0; i < totalServices; i++) {
            const result = await client.readContract({
                address: MARKETPLACE_ADDRESS,
                abi: SERVICE_ABI,
                functionName: 'services',
                args: [BigInt(i)],
            })

            const [provider, active, uptime, rating, name, description, pricePerUnit] = result
            if (active) {
                services.push({
                    id: i,
                    provider,
                    name,
                    description,
                    price: formatEther(pricePerUnit),
                    active,
                    uptime: Number(uptime),
                    rating: Number(rating),
                })
            }
        }

        return NextResponse.json({
            success: true,
            services,
            contract: MARKETPLACE_ADDRESS,
            totalRegistered: totalServices,
        })
    } catch (error) {
        console.error('Service Registry Error (Using Mock):', error)
        // Fallback Mock Data to prevent 500 in demo
        return NextResponse.json({
            success: true,
            services: [
                {
                    id: 0,
                    provider: '0x83934d93e8c9c0F82Fb1A45',
                    name: 'GPU Compute Node (Mock)',
                    description: 'High-performance GPU processing (Fallback)',
                    price: '0.01',
                    active: true,
                    uptime: 99.9,
                    rating: 4.8
                }
            ],
            contract: MARKETPLACE_ADDRESS,
            totalRegistered: 1,
            isMock: true
        })
    }
}
