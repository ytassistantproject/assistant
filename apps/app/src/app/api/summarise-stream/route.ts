import { NextRequest } from 'next/server'
import { streamText, generateText, type CoreMessage } from 'ai'
import { gateway } from '@ai-sdk/gateway'

interface GenerateRequestBody {
    model?: string
    prompt?: string
    messages?: CoreMessage[]
    maxOutputTokens?: number
    temperature?: number
}

const isCoreMessageArray = (val: unknown): val is CoreMessage[] =>
    Array.isArray(val) &&
    val.every((m) => {
        if (typeof m !== 'object' || m === null) return false
        const maybe = m as { role?: unknown; content?: unknown }
        return typeof maybe.role === 'string' && 'content' in maybe
    })

export async function POST(request: Request) {
    const body = await request.json().catch(() => ({}));
    const result = await streamText({
        model: gateway(body.model ?? 'openai/gpt-4o-mini'),
        ...(body.prompt ? { prompt: body.prompt } : {}),
        ...(Array.isArray(body.messages) ? { messages: body.messages } : {}),
        maxOutputTokens: body.maxOutputTokens ?? 800,
        temperature: body.temperature ?? 0.7,
    });

    // ⬇️ use this:
    return result.toUIMessageStreamResponse(); // or .toAIStreamResponse()
}

export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}


