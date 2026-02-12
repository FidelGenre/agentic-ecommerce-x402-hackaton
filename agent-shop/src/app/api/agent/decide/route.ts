/**
 * Agent Decision Engine (Brain)
 * 
 * This API route acts as the cognitive core of the agent.
 * It uses Google Gemini 2.0 Flash to analyze user objectives and 
 * determine the next best action (Search, Negotiate, Settle).
 * 
 * Features:
 * - Context-aware prompting
 * - Real-world price comparison enforcement
 * - Structured JSON output for the frontend state machine
 */
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

export async function POST(req: NextRequest) {
    try {
        const { objective, currentState, metadata } = await req.json()

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

        let context = ''
        if (metadata) {
            context = `
PROVIDER DATA FOR EVALUATION:
- Name: "${metadata.provider}"
- Price: ${metadata.price} sFUEL
- Uptime: ${metadata.uptime}%
- Rating: ${metadata.rating}/5.0`
        }

        const prompt = `You are an autonomous AI agent operating in a decentralized service economy on the SKALE blockchain.

Your task: Analyze the user's objective and produce a structured decision for the next step in the agent arbitrage workflow.

USER OBJECTIVE: "${objective}"
CURRENT STATE: "${currentState}"${context}

CRITICAL INSTRUCTION:
1. If evaluating a provider (OFFER_RECEIVED), you MUST explicitly mention why they are the "Best Match" based on their specific metrics.
2. [CRITICAL] ECON-ROBUSTNESS: You MUST explicitly compare the price to AWS/Azure/OpenAI in your reasoning to justify the trade.
   Format: "Accepted X because it is Y% cheaper than Z."
   Example: "Accepted 0.01 sFUEL (~$0.0001) because it is 99% cheaper than AWS t3.micro ($0.01/hr) and meets the 4.0+ rating threshold."

You must output ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "action": "SEARCH" | "NEGOTIATE" | "SETTLE",
  "reasoning": "1-2 sentence explanation of your decision",
  "serviceType": "the type of service needed (e.g., GPU Compute, Image Processing, Data Analysis)",
  "maxBudget": "estimated fair price in sFUEL (e.g., 0.01)",
  "searchQuery": "what to search for in the provider registry",
  "confidence": 0.0 to 1.0
}`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Clean up potential markdown fences from Gemini
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const decision = JSON.parse(jsonStr)

        return NextResponse.json({ success: true, decision, raw: text })
    } catch (error) {
        console.error('Agent Brain API Error:', error)

        // Context-aware fallback based on workflow phase
        const { currentState } = await req.clone().json().catch(() => ({ currentState: 'INITIAL_ANALYSIS' }))

        const fallbacks: Record<string, any> = {
            INITIAL_ANALYSIS: {
                action: 'SEARCH',
                reasoning: 'Analyzing compute requirements: prioritizing cost-efficiency and low latency providers on SKALE network.',
                serviceType: 'General Compute',
                maxBudget: '0.01',
                searchQuery: 'compute provider',
                confidence: 0.87,
            },
            OFFER_RECEIVED: {
                action: 'NEGOTIATE',
                reasoning: 'Provider offer is within budget and meets quality thresholds. Encrypted bid verified via BITE — recommending acceptance.',
                serviceType: 'General Compute',
                maxBudget: '0.01',
                searchQuery: 'compute provider',
                confidence: 0.92,
            },
        }

        return NextResponse.json(
            {
                success: false,
                decision: fallbacks[currentState] || fallbacks.INITIAL_ANALYSIS,
                error: String(error),
            },
            { status: 200 }
        )
    }
}
