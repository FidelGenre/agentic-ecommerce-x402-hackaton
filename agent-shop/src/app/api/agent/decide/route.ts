import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

export async function POST(req: NextRequest) {
    try {
        const { objective, currentState } = await req.json()

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        const prompt = `You are an autonomous AI agent operating in a decentralized service economy on the SKALE blockchain.

Your task: Analyze the user's objective and produce a structured decision for the next step in the agent arbitrage workflow.

USER OBJECTIVE: "${objective}"
CURRENT STATE: "${currentState}"

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
        return NextResponse.json(
            {
                success: false,
                decision: {
                    action: 'SEARCH',
                    reasoning: 'Fallback: LLM unavailable, proceeding with default search.',
                    serviceType: 'General Compute',
                    maxBudget: '0.01',
                    searchQuery: 'compute provider',
                    confidence: 0.5,
                },
                error: String(error),
            },
            { status: 200 } // Return 200 with fallback so the flow doesn't break
        )
    }
}
