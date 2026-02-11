# Agent Service Arbitrage (SKALE x402 + BITE)

An autonomous agent economy on SKALE Network where AI agents negotiate services using Threshold Encryption (BITE) and settle payments instantly via x402.

## Features
- **Agent Terminal**: Visualizes the AI's thought process (Google Gemini).
- **SKALE BITE**: Encrypted offers to prevent front-running.
- **x402 Payments**: Gasless, instant settlement for agent services.

## Setup
1.  `npm install`
2.  cp `.env.local.example` `.env.local` and add your `GOOGLE_API_KEY`.
3.  `npm run dev`

## Architecture
- **Framework**: Next.js 14 + TailwindCSS
- **State**: Custom `useAgent` hook
- **Blockchain**: Viem + Wagmi (SKALE Chaos Testnet)
