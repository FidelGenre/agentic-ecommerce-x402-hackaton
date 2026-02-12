import { createWalletClient, createPublicClient, http, defineChain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { readFileSync } from 'fs'

// SKALE BITE V2 Sandbox (Official Hackathon Chain)
const skaleSandbox = defineChain({
    id: 103698795,
    name: 'SKALE BITE V2 Sandbox',
    nativeCurrency: { decimals: 18, name: 'sFUEL', symbol: 'sFUEL' },
    rpcUrls: { default: { http: ['https://base-sepolia-testnet.skalenodes.com/v1/bite-v2-sandbox'] } },
    testnet: true,
})

const chains = { skaleSandbox }

async function deploy() {
    const pk = '0x52d884477b9977f573b8874a094137735cb06006861cf9cfa1b0db9423858c2d'
    const account = privateKeyToAccount(pk)

    // Read compiled bytecode from Foundry output
    const artifact = JSON.parse(readFileSync('out/ServiceMarketplace.sol/ServiceMarketplace.json', 'utf8'))
    const bytecode = artifact.bytecode.object

    console.log(`\nDeployer: ${account.address}`)
    console.log(`Bytecode size: ${(bytecode.length - 2) / 2} bytes\n`)

    // Try each chain
    for (const [name, chain] of Object.entries(chains)) {
        console.log(`\n--- Trying ${name} (Chain ID: ${chain.id}) ---`)

        const publicClient = createPublicClient({ chain, transport: http() })
        const walletClient = createWalletClient({ account, chain, transport: http() })

        try {
            const balance = await publicClient.getBalance({ address: account.address })
            console.log(`Balance: ${balance} wei (${Number(balance) / 1e18} sFUEL)`)

            if (balance === 0n) {
                console.log(`Skipping ${name} — no sFUEL`)
                continue
            }

            // Get nonce
            const nonce = await publicClient.getTransactionCount({ address: account.address })
            console.log(`Nonce: ${nonce}`)

            // Deploy
            console.log('Sending deployment tx...')
            const hash = await walletClient.deployContract({
                abi: artifact.abi,
                bytecode: bytecode,
                gas: 10_000_000n,
                gasPrice: 100000n,
            })
            console.log(`TX Hash: ${hash}`)

            // Wait for receipt
            console.log('Waiting for receipt...')
            const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 30_000 })
            console.log(`Status: ${receipt.status}`)
            console.log(`Contract: ${receipt.contractAddress}`)
            console.log(`Gas Used: ${receipt.gasUsed}`)
            console.log(`Block: ${receipt.blockNumber}`)

            if (receipt.status === 'success' && receipt.contractAddress) {
                // Verify bytecode
                const code = await publicClient.getCode({ address: receipt.contractAddress })
                if (code && code !== '0x') {
                    console.log(`\n✅ SUCCESS! Contract deployed and verified on ${name}`)
                    console.log(`Address: ${receipt.contractAddress}`)
                    console.log(`Chain: ${name} (${chain.id})`)
                    console.log(`RPC: ${chain.rpcUrls.default.http[0]}`)
                    return { chain: name, address: receipt.contractAddress, chainDef: chain }
                } else {
                    console.log(`❌ TX succeeded but no bytecode at address — contract constructor reverted`)
                }
            } else {
                console.log(`❌ TX reverted on ${name}`)
            }
        } catch (err) {
            console.log(`❌ Error on ${name}: ${err.message || err}`)
        }
    }

    console.log('\n❌ All chains failed. Check sFUEL balances and SKALE chain status.')
}

deploy().catch(console.error)
