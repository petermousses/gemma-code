import { writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import type { Tool } from "./types.js";

export const writeFileTool: Tool = {
  definition: {
    type: "function",
    function: {
      name: "write_file",
      description:
        "Write content to a file. Creates the file if it doesn't exist, overwrites if it does. Creates parent directories as needed.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The path to the file to write",
          },
          content: {
            type: "string",
            description: "The content to write to the file",
          },
        },
        required: ["path", "content"],
      },
    },
  },

  async execute(args) {
    const filePath = resolve(args.path as string);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, args.content as string, "utf-8");
    return `Wrote ${(args.content as string).split("\n").length} lines to ${filePath}`;
  },
};
