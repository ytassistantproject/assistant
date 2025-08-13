import { NextRequest, NextResponse } from 'next/server';
import { generateText, type CoreMessage } from 'ai';
import { gateway } from '@ai-sdk/gateway';

// This route uses Vercel AI Gateway via the AI SDK provider `gateway()`.
// - On Vercel, OIDC is handled automatically if enabled in project settings.
// - For local dev, pull envs with `vercel env pull` to get the OIDC token.
// Docs: https://ai-sdk.dev/providers/ai-gateway

interface GenerateRequestBody {
    model?: string;
    prompt?: string;
    messages?: CoreMessage[];
    maxOutputTokens?: number;
    temperature?: number;
}

const isCoreMessageArray = (val: unknown): val is CoreMessage[] =>
    Array.isArray(val) &&
    val.every((m) => {
        if (typeof m !== 'object' || m === null) return false;
        const maybe = m as { role?: unknown; content?: unknown };
        return typeof maybe.role === 'string' && 'content' in maybe;
    });

export async function POST(request: NextRequest) {
    try {
        const raw = (await request.json().catch(() => ({}))) as unknown;
        const body: GenerateRequestBody = (typeof raw === 'object' && raw !== null ? raw : {}) as GenerateRequestBody;

        const model = typeof body.model === 'string' ? body.model : 'openai/gpt-4o-mini';
        const prompt = typeof body.prompt === 'string' ? body.prompt : undefined;
        const messages = isCoreMessageArray(body.messages) ? body.messages : undefined;
        const maxOutputTokens = typeof body.maxOutputTokens === 'number' ? body.maxOutputTokens : 800;
        const temperature = typeof body.temperature === 'number' ? body.temperature : 0.7;

        if (!prompt && !(messages && messages.length > 0)) {
            const response = NextResponse.json(
                { error: 'Either `prompt` (string) or `messages` (array) is required' },
                { status: 400 }
            );
            response.headers.set('Access-Control-Allow-Origin', '*');
            return response;
        }

        // Use AI SDK generateText with the AI Gateway provider
        const result = await generateText({
            model: gateway(model),
            ...(prompt ? { prompt } : {}),
            ...(messages ? { messages } : {}),
            maxOutputTokens,
            temperature,
        });

        const response = NextResponse.json({
            text: result.text,
            finishReason: result.finishReason,
            model,
        });
        response.headers.set('Access-Control-Allow-Origin', '*');
        return response;
    } catch (error) {
        console.error('AI Gateway route error:', error);
        const response = NextResponse.json(
            {
                error: 'Failed to process AI request',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
        response.headers.set('Access-Control-Allow-Origin', '*');
        return response;
    }
}

export async function OPTIONS() {
    const response = new NextResponse(null, { status: 200 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
}
