import type { Tool } from "./types.js";

const SEARXNG_URL = "https://search.omv.mousses.xyz";

interface SearxResult {
  title: string;
  url: string;
  content: string;
  score?: number;
}

export const webSearchTool: Tool = {
  definition: {
    type: "function",
    function: {
      name: "web_search",
      description:
        "Search the web using SearXNG. Returns titles, URLs, and snippets for the top results.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query",
          },
          num_results: {
            type: "string",
            description:
              "Number of results to return (default 5, max 20)",
          },
        },
        required: ["query"],
      },
    },
  },

  async execute(args) {
    const query = args.query as string;
    const numResults = Math.min(
      parseInt((args.num_results as string) || "5", 10),
      20
    );

    const params = new URLSearchParams({
      q: query,
      format: "json",
      categories: "general",
    });

    const res = await fetch(`${SEARXNG_URL}/search?${params}`);
    if (!res.ok) {
      return `Search error: ${res.status} ${res.statusText}`;
    }

    const data = (await res.json()) as { results: SearxResult[] };
    const results = data.results.slice(0, numResults);

    if (results.length === 0) {
      return "No results found.";
    }

    return results
      .map(
        (r, i) =>
          `${i + 1}. ${r.title}\n   ${r.url}\n   ${r.content || "(no snippet)"}`
      )
      .join("\n\n");
  },
};
