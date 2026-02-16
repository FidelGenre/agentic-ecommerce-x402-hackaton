import { parseEther, type Address } from 'viem'

// ─────────────── Constants ───────────────

// ⚠️ PLACEHOLDERS - To be verified by User/Wispy
export const ALGEBRA_ROUTER_ADDRESS = '0x0000000000000000000000000000000000000000' as Address
export const WETH_ADDRESS = '0x0000000000000000000000000000000000000000' as Address
export const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS || '0xc4083B1E81ceb461Ccef3FDa8A9F24F0d764B6D8') as Address

export const ALGEBRA_ROUTER_ABI = [
    {
        name: 'exactInputSingle',
        type: 'function',
        stateMutability: 'payable',
        inputs: [
            {
                type: 'tuple',
                name: 'params',
                components: [
                    { type: 'address', name: 'tokenIn' },
                    { type: 'address', name: 'tokenOut' },
                    { type: 'address', name: 'recipient' },
                    { type: 'uint256', name: 'deadline' },
                    { type: 'uint256', name: 'amountIn' },
                    { type: 'uint256', name: 'amountOutMinimum' },
                    { type: 'uint160', name: 'limitSqrtPrice' },
                ],
            },
        ],
        outputs: [{ type: 'uint256', name: 'amountOut' }],
    },
] as const

export const ERC20_ABI = [
    {
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
    },
    {
        name: 'allowance',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
        ],
        outputs: [{ name: '', type: 'uint256' }],
    },
] as const
