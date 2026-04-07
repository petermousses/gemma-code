import type { Tool, ToolDefinition } from "./types.js";
import { readFileTool } from "./read.js";
import { writeFileTool } from "./write.js";
import { editFileTool } from "./edit.js";
import { bashTool } from "./bash.js";
import { globTool } from "./glob.js";
import { grepTool } from "./grep.js";
import { webSearchTool } from "./web-search.js";

const tools: Tool[] = [
  readFileTool,
  writeFileTool,
  editFileTool,
  bashTool,
  globTool,
  grepTool,
  webSearchTool,
];

const toolMap = new Map<string, Tool>(
  tools.map((t) => [t.definition.function.name, t])
);

export function getToolDefinitions(): ToolDefinition[] {
  return tools.map((t) => t.definition);
}

export function getTool(name: string): Tool | undefined {
  return toolMap.get(name);
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  const tool = toolMap.get(name);
  if (!tool) {
    return `Error: unknown tool "${name}"`;
  }
  try {
    return await tool.execute(args);
  } catch (err) {
    return `Error executing ${name}: ${err instanceof Error ? err.message : String(err)}`;
  }
}
