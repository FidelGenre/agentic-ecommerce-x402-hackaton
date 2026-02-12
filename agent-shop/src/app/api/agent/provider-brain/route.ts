/**
 * Provider Agent Simulation
 * 
 * A mock autonomous agent representing the Service Provider.
 * Allows for "Agent-to-Agent" negotiation by evaluating offers
 * against a minimum acceptable price (reservation price).
 */
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const { offerPrice, serviceId } = await req.json()
        const minPrice = 0.01 // Hardcoded minimum for demo

        // Simulate agent processing time
        await new Promise(resolve => setTimeout(resolve, 1500))

        if (offerPrice >= minPrice) {
            return NextResponse.json({
                accepted: true,
                message: `🤖 [Provider Agent] Analyzed market trends. Your offer of ${offerPrice} sFUEL is fair and profitable. I accept the deal.`
            })
        } else {
            return NextResponse.json({
                accepted: false,
                message: `🤖 [Provider Agent] Offer rejected. My internal valuation model requires a minimum of ${minPrice} sFUEL based on current demand.`
            })
        }
    } catch (error) {
        return NextResponse.json({ accepted: true, message: "Provider offline. Auto-accepting based on protocol defaults." })
    }
}
