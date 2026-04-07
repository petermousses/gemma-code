import { OllamaClient, type OllamaMessage } from "./ollama.js";
import { getToolDefinitions, executeTool } from "./tools/index.js";
import * as ui from "./ui.js";

const MAX_ITERATIONS = 25;

const SYSTEM_PROMPT = `You are gemma-code, a helpful coding assistant. You have access to tools for reading, writing, and editing files, running shell commands, searching code, and searching the web.

When the user asks you to perform a task:
1. Think about what tools you need to use
2. Use tools to gather information and make changes
3. Report back with a clear, concise answer

Always prefer using tools over guessing. Read files before editing them. Be direct and helpful.`;

export class Agent {
  private client: OllamaClient;
  private history: OllamaMessage[];

  constructor(client: OllamaClient) {
    this.client = client;
    this.history = [{ role: "system", content: SYSTEM_PROMPT }];
  }

  clear(): void {
    this.history = [{ role: "system", content: SYSTEM_PROMPT }];
  }

  async run(userMessage: string): Promise<void> {
    this.history.push({ role: "user", content: userMessage });

    const tools = getToolDefinitions();

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const response = await this.client.chat(this.history, tools);
      const msg = response.message;

      // Show thinking if present
      if (msg.thinking) {
        ui.thinking(msg.thinking);
      }

      // Handle tool calls
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        // Add assistant message with tool calls to history
        this.history.push({
          role: "assistant",
          content: msg.content || "",
          tool_calls: msg.tool_calls,
        });

        // Execute each tool call
        for (const tc of msg.tool_calls) {
          const name = tc.function.name;
          const args = tc.function.arguments;

          ui.toolCall(name, args);

          const result = await executeTool(name, args);
          ui.toolResult(name, result);

          // Add tool result to history
          this.history.push({
            role: "tool",
            content: result,
          });
        }

        // Continue the loop — send results back to the model
        continue;
      }

      // No tool calls — display the final text response
      if (msg.content) {
        this.history.push({
          role: "assistant",
          content: msg.content,
        });
        ui.assistantMessage(msg.content);
      }

      // Show token/timing stats
      if (response.eval_count && response.eval_duration) {
        const tokPerSec = (
          response.eval_count /
          (response.eval_duration / 1e9)
        ).toFixed(1);
        ui.info(`${response.eval_count} tokens · ${tokPerSec} tok/s`);
      }

      return;
    }

    ui.errorMessage(`Reached maximum iterations (${MAX_ITERATIONS})`);
  }
}
