#!/usr/bin/env node

import * as readline from "node:readline";
import { OllamaClient } from "./ollama.js";
import { Agent } from "./agent.js";
import * as ui from "./ui.js";

const DEFAULT_MODEL = "gemma4:26b";

async function main() {
  let model = process.argv[2] || DEFAULT_MODEL;
  let client = new OllamaClient(model);
  let agent = new Agent(client);

  ui.banner(model);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("close", () => {
    console.log();
    process.exit(0);
  });

  const prompt = () => {
    rl.question(`  ${model} > `, async (input) => {
      const trimmed = input.trim();

      if (!trimmed) {
        prompt();
        return;
      }

      // Handle slash commands
      if (trimmed === "/exit" || trimmed === "/quit") {
        console.log();
        rl.close();
        return;
      }

      if (trimmed === "/clear") {
        agent.clear();
        ui.info("Conversation cleared.");
        prompt();
        return;
      }

      if (trimmed.startsWith("/model")) {
        const newModel = trimmed.split(/\s+/)[1];
        if (newModel) {
          model = newModel;
          client = new OllamaClient(model);
          agent = new Agent(client);
          ui.info(`Switched to ${model}. Conversation cleared.`);
        } else {
          ui.info(`Current model: ${model}`);
        }
        prompt();
        return;
      }

      try {
        await agent.run(trimmed);
      } catch (err) {
        ui.errorMessage(
          err instanceof Error ? err.message : String(err)
        );
      }

      prompt();
    });
  };

  prompt();
}

main();
