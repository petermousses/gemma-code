import chalk from "chalk";

export function banner(model: string): void {
  console.log(
    chalk.bold.cyan("\n  gemma-code") +
      chalk.dim(` — agent harness for ${model}\n`)
  );
  console.log(
    chalk.dim(
      "  Commands: /model <name>  /clear  /exit\n"
    )
  );
}

export function thinking(text: string): void {
  const lines = text.split("\n");
  const truncated = lines.length > 20 ? lines.slice(0, 20) : lines;
  console.log(chalk.dim("  [thinking]"));
  for (const line of truncated) {
    console.log(chalk.dim(`  ${line}`));
  }
  if (lines.length > 20) {
    console.log(chalk.dim(`  ... (${lines.length - 20} more lines)`));
  }
  console.log();
}

export function toolCall(name: string, args: Record<string, unknown>): void {
  const argsStr = Object.entries(args)
    .map(([k, v]) => {
      const val = typeof v === "string" ? v : JSON.stringify(v);
      const truncated = val.length > 80 ? val.slice(0, 77) + "..." : val;
      return `${k}=${truncated}`;
    })
    .join(", ");
  console.log(chalk.cyan(`  ▸ ${name}`) + chalk.dim(`(${argsStr})`));
}

export function toolResult(name: string, result: string): void {
  const lines = result.split("\n");
  const truncated = lines.length > 30 ? lines.slice(0, 30) : lines;
  for (const line of truncated) {
    console.log(chalk.dim(`    ${line}`));
  }
  if (lines.length > 30) {
    console.log(chalk.dim(`    ... (${lines.length - 30} more lines)`));
  }
  console.log();
}

export function assistantMessage(text: string): void {
  console.log();
  console.log(text);
  console.log();
}

export function errorMessage(text: string): void {
  console.log(chalk.red(`  Error: ${text}`));
}

export function info(text: string): void {
  console.log(chalk.dim(`  ${text}`));
}
