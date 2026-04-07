import type { ToolDefinition } from "./tools/types.js";

const DEFAULT_BASE_URL = "http://tower.mousses.xyz:11434";

export interface OllamaToolCall {
  id?: string;
  function: {
    index?: number;
    name: string;
    arguments: Record<string, unknown>;
  };
}

export interface OllamaMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  thinking?: string;
  tool_calls?: OllamaToolCall[];
}

export interface OllamaChatResponse {
  model: string;
  message: OllamaMessage;
  done: boolean;
  done_reason?: string;
  total_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export class OllamaClient {
  private baseUrl: string;
  model: string;

  constructor(model = "gemma4:26b", baseUrl = DEFAULT_BASE_URL) {
    this.model = model;
    this.baseUrl = baseUrl;
  }

  async chat(
    messages: OllamaMessage[],
    tools?: ToolDefinition[]
  ): Promise<OllamaChatResponse> {
    const body: Record<string, unknown> = {
      model: this.model,
      messages,
      stream: false,
    };

    if (tools && tools.length > 0) {
      body.tools = tools;
    }

    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ollama API error ${res.status}: ${text}`);
    }

    return (await res.json()) as OllamaChatResponse;
  }
}
