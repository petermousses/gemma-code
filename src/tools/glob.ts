import { glob } from "glob";
import type { Tool } from "./types.js";

export const globTool: Tool = {
  definition: {
    type: "function",
    function: {
      name: "glob",
      description:
        "Find files matching a glob pattern. Returns matching file paths, one per line. Example patterns: '**/*.ts', 'src/**/*.json', '*.md'.",
      parameters: {
        type: "object",
        properties: {
          pattern: {
            type: "string",
            description: "The glob pattern to match files against",
          },
          path: {
            type: "string",
            description:
              "Directory to search in. Defaults to the current working directory.",
          },
        },
        required: ["pattern"],
      },
    },
  },

  async execute(args) {
    const pattern = args.pattern as string;
    const cwd = (args.path as string) || process.cwd();
    const matches = await glob(pattern, {
      cwd,
      nodir: true,
      ignore: ["**/node_modules/**", "**/.git/**"],
    });

    if (matches.length === 0) {
      return "No files matched the pattern.";
    }
    return matches.sort().join("\n");
  },
};
