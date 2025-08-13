import { NextResponse } from 'next/server';
import { ModelConfig, OpenRouterModel, OpenRouterModelsResponse } from './types';

// Combined catalog: label + vercel model id + openrouter alias (to be filled later)
const VERCEL_MODELS = [
    { label: 'GPT‑5', vercelName: 'openai/gpt-5', openRouterName: 'openai/gpt-5' },
    { label: 'GPT‑5 mini', vercelName: 'openai/gpt-5-mini', openRouterName: 'openai/gpt-5-mini' },
    { label: 'Gemini 2.5 Flash', vercelName: 'google/gemini-2.5-flash', openRouterName: 'google/gemini-2.5-flash' },
    { label: 'Grok‑4', vercelName: 'xai/grok-4', openRouterName: 'x-ai/grok-4' },
    { label: 'Qwen 3 235B', vercelName: 'alibaba/qwen-3-235b', openRouterName: 'qwen/qwen3-235b-a22b-2507' },
    { label: 'Claude 4.1 Opus', vercelName: 'anthropic/claude-4.1-opus', openRouterName: 'anthropic/claude-opus-4.1' },
    { label: 'Kimi K2', vercelName: 'moonshotai/kimi-k2', openRouterName: 'moonshotai/kimi-k2' },
    { label: 'GLM 4.5', vercelName: 'zai/glm-4.5', openRouterName: 'z-ai/glm-4.5' },
    { label: 'DeepSeek R1', vercelName: 'deepseek/deepseek-r1', openRouterName: 'deepseek/deepseek-r1' },
] as const;

const SAFETY_MARGIN_TOKENS = 1024; // buffer for system/instructions/tool calls

const toNumber = (v: string | number | undefined): number | undefined => {
    if (v === undefined) return undefined;
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : undefined;
};

const enrichWithOpenRouter = async (
    models: ModelConfig[],
    vercelToOpenRouter: Map<string, string>,
    apiKey?: string
): Promise<ModelConfig[]> => {
    if (!apiKey) return models;

    const res = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        next: { revalidate: 1800 },
    });

    if (!res.ok) return models;
    const data = (await res.json()) as OpenRouterModelsResponse | { models?: OpenRouterModel[] } | unknown;

    let openrouterModels: OpenRouterModel[] = [];
    if (typeof data === 'object' && data !== null) {
        if (Array.isArray((data as OpenRouterModelsResponse).data)) {
            openrouterModels = (data as OpenRouterModelsResponse).data;
        } else if (Array.isArray((data as { models?: OpenRouterModel[] }).models)) {
            openrouterModels = (data as { models?: OpenRouterModel[] }).models ?? [];
        }
    }

    if (openrouterModels.length === 0) return models;

    const byId = new Map<string, OpenRouterModel>(openrouterModels.map((model) => [model.id, model]));

    return models.map((model) => {
        const openRouterId = vercelToOpenRouter.get(model.id) || model.id;
        const meta = byId.get(openRouterId) || byId.get(model.id);
        if (!meta) return model;

        const total = meta.context_length ?? meta.top_provider?.context_length ?? null;
        const output = meta.top_provider?.max_completion_tokens ?? null;

        // Derive a safe max input tokens if we have both total and output
        let input: number | null = null;
        if (typeof total === 'number' && typeof output === 'number') {
            const computed = total - output - SAFETY_MARGIN_TOKENS;
            input = computed > 0 ? computed : Math.max(total - output, 0);
        }

        const inputPrice = toNumber(meta.pricing?.prompt) ?? toNumber(meta.pricing?.input);
        const outputPrice = toNumber(meta.pricing?.completion) ?? toNumber(meta.pricing?.output);

        return {
            ...model,
            label: meta.name ?? model.label,
            description: meta.description ?? model.description ?? null,
            context: {
                total,
                input,
                output,
                reserve: SAFETY_MARGIN_TOKENS,
            },
            pricing: {
                input: inputPrice ?? null,
                output: outputPrice ?? null,
            }
        };
    });
};

// GET /api/ai/models (hardcoded + enrichment when available)
export async function GET() {
    const baseModel = (id: string, label: string): ModelConfig => ({
        id,
        label: label || id.split('/').slice(-1)[0] || id,
        provider: id.includes('/') ? id.split('/')[0] : 'unknown',
        description: null,
        context: { total: null, input: null, output: null, reserve: SAFETY_MARGIN_TOKENS },
        pricing: { input: null, output: null },
    });
    let models: ModelConfig[] = VERCEL_MODELS.map(({ vercelName, label }) => baseModel(vercelName, label));
    const apiKey = process.env.OPENROUTER_API_KEY;
    const vercelToOpenRouter = new Map<string, string>(
        VERCEL_MODELS.filter((model) => model.openRouterName).map((model) => [model.vercelName, model.openRouterName])
    );

    try {
        models = await enrichWithOpenRouter(models, vercelToOpenRouter, apiKey);
    } catch {
        // Ignore enrichment failures; return static list
    }

    const response = NextResponse.json(models);
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
}

export async function OPTIONS() {
    const response = new NextResponse(null, { status: 200 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
}
