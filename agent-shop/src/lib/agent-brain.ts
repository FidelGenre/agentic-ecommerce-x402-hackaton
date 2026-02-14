import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

export interface AgentDecision {
    action: 'SEARCH' | 'NEGOTIATE' | 'PAY' | 'ERROR'
    reasoning: string
    payload?: any
}

export class AgentBrain {
    private model: any // Using 'any' for now as @google/generative-ai types might be mismatched in this env, but logic is strict.

    constructor() {
        this.model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    }

    async decide(currentState: string, goal: string): Promise<AgentDecision> {
        const prompt = `
      You are an autonomous agent participating in a decentralized service economy on SKALE.
      Your goal is: "${goal}"
      Current state: "${currentState}"

      Decide the next best action.
      Available actions:
      - SEARCH: Look for service providers. Payload: { query: string }
      - NEGOTIATE: Engage with a provider. Payload: { providerId: string, offer: string }
      - PAY: Finalize transaction. Payload: { amount: string, recipient: string }
      - ERROR: Cannot proceed.

      Output ONLY JSON in this format:
      {
        "action": "ACTION_NAME",
        "reasoning": "brief explanation",
        "payload": { ... }
      }
    `

        try {
            const result = await this.model.generateContent(prompt)
            const response = await result.response
            const text = response.text()
            // Basic cleanup to ensure JSON
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()
            return JSON.parse(jsonStr) as AgentDecision
        } catch (error) {
            console.error('Agent Brain Error:', error)
            return {
                action: 'ERROR',
                reasoning: 'Failed to generate decision from LLM',
                payload: { error: String(error) }
            }
        }
    }
}
