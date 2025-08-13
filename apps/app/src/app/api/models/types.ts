
export interface PricingInfo {
    input?: number | null; // price per token or per 1M tokens
    output?: number | null;
}
export interface ModelConfig {
    id: string;
    label: string;
    provider: string;
    description?: string | null;
    // grouped context information
    context: {
        total: number | null;
        input: number | null;
        output: number | null;
        reserve: number; // technical reserve used in calculation
    };
    pricing?: PricingInfo | null;
}

export interface OpenRouterModel {
    id: string;
    name?: string;
    description?: string;
    context_length?: number;
    pricing?: {
        prompt?: string | number;
        completion?: string | number;
        input?: string | number; // synonym sometimes used
        output?: string | number; // synonym sometimes used
        currency?: string;
    };
    top_provider?: {
        max_completion_tokens?: number;
        context_length?: number;
    };
}

export interface OpenRouterModelsResponse {
    data: OpenRouterModel[];
}