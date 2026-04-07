import { exec } from "node:child_process";
import type { Tool } from "./types.js";

export const grepTool: Tool = {
  definition: {
    type: "function",
    function: {
      name: "grep",
      description:
        "Search file contents using a regex pattern. Returns matching lines with file paths and line numbers. Uses ripgrep (rg) if available, otherwise falls back to grep.",
      parameters: {
        type: "object",
        properties: {
          pattern: {
            type: "string",
            description: "The regex pattern to search for",
          },
          path: {
            type: "string",
            description:
              "File or directory to search in. Defaults to current directory.",
          },
          glob: {
            type: "string",
            description:
              "Glob pattern to filter which files to search. Example: '*.ts'",
          },
        },
        required: ["pattern"],
      },
    },
  },

  async execute(args) {
    const pattern = args.pattern as string;
    const searchPath = (args.path as string) || ".";
    const fileGlob = args.glob as string | undefined;

    // Try ripgrep first, fall back to grep
    const globArg = fileGlob ? `--glob '${fileGlob}'` : "";
    const rgCmd = `rg -n --no-heading ${globArg} -- ${JSON.stringify(pattern)} ${JSON.stringify(searchPath)}`;
    const grepCmd = `grep -rn ${fileGlob ? `--include='${fileGlob}'` : ""} -- ${JSON.stringify(pattern)} ${JSON.stringify(searchPath)}`;

    return new Promise<string>((resolve) => {
      exec(rgCmd, { timeout: 30_000, maxBuffer: 1024 * 1024 }, (rgErr, rgOut) => {
        if (!rgErr && rgOut) {
          const lines = rgOut.trim().split("\n");
          resolve(
            lines.length > 100
              ? lines.slice(0, 100).join("\n") + `\n... (${lines.length - 100} more matches)`
              : rgOut.trim()
          );
          return;
        }
        exec(grepCmd, { timeout: 30_000, maxBuffer: 1024 * 1024 }, (grepErr, grepOut) => {
          if (grepOut) {
            const lines = grepOut.trim().split("\n");
            resolve(
              lines.length > 100
                ? lines.slice(0, 100).join("\n") + `\n... (${lines.length - 100} more matches)`
                : grepOut.trim()
            );
          } else {
            resolve("No matches found.");
          }
        });
      });
    });
  },
};
