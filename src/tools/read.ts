import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Tool } from "./types.js";

export const readFileTool: Tool = {
  definition: {
    type: "function",
    function: {
      name: "read_file",
      description:
        "Read the contents of a file. Returns the file content as text. Use offset and limit to read specific portions of large files.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The path to the file to read",
          },
          offset: {
            type: "string",
            description:
              "Line number to start reading from (0-based). Optional.",
          },
          limit: {
            type: "string",
            description: "Maximum number of lines to read. Optional.",
          },
        },
        required: ["path"],
      },
    },
  },

  async execute(args) {
    const filePath = resolve(args.path as string);
    const content = await readFile(filePath, "utf-8");
    const lines = content.split("\n");

    const offset = args.offset ? parseInt(args.offset as string, 10) : 0;
    const limit = args.limit
      ? parseInt(args.limit as string, 10)
      : lines.length;

    const selected = lines.slice(offset, offset + limit);
    const numbered = selected.map(
      (line, i) => `${(offset + i + 1).toString().padStart(4)}  ${line}`
    );
    return numbered.join("\n");
  },
};
