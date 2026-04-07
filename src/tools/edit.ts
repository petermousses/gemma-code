import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Tool } from "./types.js";

export const editFileTool: Tool = {
  definition: {
    type: "function",
    function: {
      name: "edit_file",
      description:
        "Edit a file by replacing an exact string match with new content. The old_string must appear exactly once in the file for the replacement to succeed.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The path to the file to edit",
          },
          old_string: {
            type: "string",
            description: "The exact string to find and replace",
          },
          new_string: {
            type: "string",
            description: "The string to replace it with",
          },
        },
        required: ["path", "old_string", "new_string"],
      },
    },
  },

  async execute(args) {
    const filePath = resolve(args.path as string);
    const oldStr = args.old_string as string;
    const newStr = args.new_string as string;

    const content = await readFile(filePath, "utf-8");
    const occurrences = content.split(oldStr).length - 1;

    if (occurrences === 0) {
      return `Error: old_string not found in ${filePath}`;
    }
    if (occurrences > 1) {
      return `Error: old_string found ${occurrences} times in ${filePath}. Must be unique.`;
    }

    const updated = content.replace(oldStr, newStr);
    await writeFile(filePath, updated, "utf-8");
    return `Edited ${filePath}: replaced 1 occurrence`;
  },
};
