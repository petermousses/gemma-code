import { exec } from "node:child_process";
import type { Tool } from "./types.js";

export const bashTool: Tool = {
  definition: {
    type: "function",
    function: {
      name: "bash",
      description:
        "Run a shell command and return its output. Returns both stdout and stderr. Commands time out after 60 seconds.",
      parameters: {
        type: "object",
        properties: {
          command: {
            type: "string",
            description: "The shell command to execute",
          },
        },
        required: ["command"],
      },
    },
  },

  async execute(args) {
    const command = args.command as string;
    return new Promise<string>((resolve) => {
      exec(command, { timeout: 60_000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        let result = "";
        if (stdout) result += stdout;
        if (stderr) result += (result ? "\n" : "") + `[stderr] ${stderr}`;
        if (error && !stdout && !stderr) {
          result = `Error: ${error.message}`;
        }
        resolve(result || "(no output)");
      });
    });
  },
};
