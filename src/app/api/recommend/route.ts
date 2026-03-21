import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { selectStack } from "@/lib/engine";
import type { FormInputs, SelectedStack, ScoredTechnology, NLPSignals } from "@/lib/engine/types";

const VALID_PLATFORMS = [
  "web", "desktop", "mobile-ios", "mobile-android", "mobile-cross", "cli", "script", "game",
];
const VALID_SCALES = ["hobby", "startup", "growth", "enterprise"];
const VALID_TIMELINES = ["hackathon", "weeks", "months", "no-rush"];
const VALID_BUDGETS = ["free", "low", "moderate", "enterprise"];
const VALID_DEPLOYMENTS = [
  "serverless",
  "containers",
  "vps",
  "managed",
  "no-preference",
];
const VALID_PRIORITIES = [
  "performance",
  "security",
  "dev-speed",
  "seo",
  "realtime",
  "cost",
];

function validateBody(body: unknown): body is FormInputs {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.projectDescription === "string" &&
    b.projectDescription.length >= 20 &&
    b.projectDescription.length <= 2000 &&
    VALID_PLATFORMS.includes(b.platform as string) &&
    VALID_SCALES.includes(b.scale as string) &&
    VALID_TIMELINES.includes(b.timeline as string) &&
    Array.isArray(b.teamExpertise) &&
    VALID_BUDGETS.includes(b.budget as string) &&
    VALID_DEPLOYMENTS.includes(b.deployment as string) &&
    Array.isArray(b.priorities) &&
    b.priorities.length === 2 &&
    (b.priorities as string[]).every((p) => VALID_PRIORITIES.includes(p)) &&
    typeof b.databasePreference === "string"
  );
}

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// ---- Deterministic Narration Generator ----
// Generates project-specific reasoning without any AI API call

function getTechNames(stack: SelectedStack): { label: string; name: string; score: number }[] {
  const entries: { label: string; name: string; score: number }[] = [];
  const slots: [string, ScoredTechnology | null][] = [
    ["Frontend", stack.frontend],
    ["Backend", stack.backend],
    ["Database", stack.database],
    ["Hosting", stack.hosting],
    ["Language", stack.language],
    ["Game Engine", stack.game],
    ["Mobile Framework", stack.mobile],
    ["Desktop Framework", stack.desktop],
    ["Build Tool", stack.buildTool],
    ["ORM", stack.orm],
    ["Auth", stack.auth],
    ["Cache", stack.cache],
    ["CMS", stack.cms],
  ];
  for (const [label, slot] of slots) {
    if (slot) entries.push({ label, name: slot.technology.name, score: slot.rawScore });
  }
  return entries;
}

function generateNarration(
  inputs: FormInputs,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recommendation: any
): string {
  const techs = getTechNames(recommendation.stack);
  const stack = recommendation.stack;
  const signals: NLPSignals = recommendation.nlpSignals;
  const coreNames = techs.slice(0, 4).map(t => t.name);
  const firstSentence = inputs.projectDescription.split(/[.!?\n]/)[0].trim();

  const platformLabel: Record<string, string> = {
    web: "web application",
    desktop: "desktop application",
    "mobile-ios": "iOS app",
    "mobile-android": "Android app",
    "mobile-cross": "cross-platform mobile app",
    cli: "command-line tool",
    script: "standalone program",
    game: "game",
  };
  const platName = platformLabel[inputs.platform] ?? "application";

  const lines: string[] = [];

  // Section 1: Why This Stack Works
  lines.push("## Why This Stack Works for Your Project");
  lines.push("");

  // Build a context-aware opening
  const mainTech = techs[0];
  lines.push(
    `For your ${platName} — "${firstSentence}" — the engine selected \`${coreNames.join("` + `")}\` as the core stack, ` +
    `scoring ${recommendation.efficiencyScore}% efficiency across all weighted dimensions.`
  );

  // Explain key tech choices
  if (stack.game) {
    const lang = stack.language;
    lines.push(
      `\`${stack.game.technology.name}\` is the right engine here` +
      (lang ? ` paired with \`${lang.technology.name}\`` : "") +
      ` — it scores ${stack.game.technology.attributes.performanceAtScale}/10 on performance` +
      ` and ${stack.game.technology.attributes.ecosystemMaturity}/10 on ecosystem maturity,` +
      ` giving you access to established tooling and community resources.`
    );
  } else if (stack.frontend && stack.backend) {
    lines.push(
      `\`${stack.frontend.technology.name}\` handles the presentation layer` +
      ` while \`${stack.backend.technology.name}\` manages server logic` +
      (stack.database ? ` with \`${stack.database.technology.name}\` for data persistence` : "") +
      `. This combination scores ${recommendation.compatibilityScore}% on inter-stack compatibility.`
    );
  } else if (stack.language) {
    lines.push(
      `\`${stack.language.technology.name}\` is the right choice for this —` +
      ` it scores ${stack.language.technology.attributes.timeToMVP}/10 on time-to-MVP` +
      ` and ${stack.language.technology.attributes.learningCurve}/10 on learning curve.`
    );
  }

  // Signal-specific reasoning
  if (signals.needsAuth > 0.3 && stack.auth) {
    lines.push(`\`${stack.auth.technology.name}\` handles authentication, which your project requires for secure user access.`);
  }
  if (signals.needsRealtime > 0.3) {
    const realtimeTech = techs.find(t => {
      const s = recommendation.stack[t.label.toLowerCase().replace(/ /g, "")] as ScoredTechnology | null;
      return s?.technology.supportsRealtime;
    });
    if (realtimeTech) {
      lines.push(`Real-time capabilities are covered — \`${realtimeTech.name}\` supports WebSocket and event-driven patterns out of the box.`);
    }
  }
  if (signals.needsEcommerce > 0.3) {
    lines.push("The stack's ecosystem maturity ensures reliable payment integration and transaction handling.");
  }

  lines.push("");

  // Section 2: How to Build It
  lines.push("## How to Build It");
  lines.push("");

  // Generate actionable steps based on the actual stack
  if (stack.game) {
    lines.push(`- Set up your \`${stack.game.technology.name}\` project` +
      (stack.language ? ` with \`${stack.language.technology.name}\`` : "") +
      ` — start with the engine's project template to get asset pipelines and build tooling configured`);
    if (stack.database) {
      lines.push(`- Use \`${stack.database.technology.name}\` for persistent storage — game saves, player data, and leaderboards`);
    }
    lines.push(`- Structure your game loop with clear separation between input handling, update logic, and rendering`);
    if (signals.needsRealtime > 0.3) {
      lines.push("- For multiplayer, implement a dedicated server with authoritative game state and client-side prediction");
    }
  } else if (stack.frontend && stack.backend) {
    lines.push(`- Scaffold the \`${stack.frontend.technology.name}\` frontend and \`${stack.backend.technology.name}\` API as separate concerns — ` +
      (stack.frontend.technology.name.includes("Next") || stack.frontend.technology.name.includes("Nuxt")
        ? "they share a repo with the meta-framework's API routes"
        : "connect them via REST or GraphQL endpoints"));
    if (stack.database && stack.orm) {
      lines.push(`- Define your schema in \`${stack.orm.technology.name}\` with \`${stack.database.technology.name}\` as the backing store — run migrations early to lock down your data model`);
    } else if (stack.database) {
      lines.push(`- Set up \`${stack.database.technology.name}\` with proper indexing from day one — schema changes get expensive later`);
    }
    if (stack.auth) {
      lines.push(`- Wire \`${stack.auth.technology.name}\` for authentication before building protected routes — it's harder to retrofit`);
    }
    if (stack.hosting) {
      lines.push(`- Deploy to \`${stack.hosting.technology.name}\` with CI/CD from the start — even a basic pipeline saves hours`);
    }
  } else if (stack.language) {
    lines.push(`- Start with \`${stack.language.technology.name}\` and keep dependencies minimal — the simpler the project, the fewer moving parts`);
    if (stack.database) {
      lines.push(`- Use \`${stack.database.technology.name}\` for any data that needs to persist between runs`);
    }
    lines.push("- Write tests for core logic first — they're cheap to add now and expensive to add later");
  } else if (stack.mobile) {
    lines.push(`- Initialize your \`${stack.mobile.technology.name}\` project with the recommended project structure`);
    if (stack.database) {
      lines.push(`- Use \`${stack.database.technology.name}\` for local data persistence`);
    }
    if (stack.auth) {
      lines.push(`- Integrate \`${stack.auth.technology.name}\` early for user authentication flows`);
    }
  }

  lines.push("");

  // Section 3: Trade-offs
  lines.push("## What You're Trading Off");
  lines.push("");

  if (recommendation.tradeoffs.length > 0) {
    lines.push(recommendation.tradeoffs.slice(0, 3).join(" "));
  } else {
    // Generate based on stack characteristics
    const weakDims: string[] = [];
    for (const t of techs.slice(0, 3)) {
      const slot = Object.values(recommendation.stack).find(
        (s: unknown) => s && (s as ScoredTechnology).technology?.name === t.name
      ) as ScoredTechnology | undefined;
      if (slot) {
        const attrs = slot.technology.attributes;
        if (attrs.learningCurve < 5) weakDims.push(`\`${t.name}\` has a steeper learning curve (${attrs.learningCurve}/10)`);
        if (attrs.hiringEase < 4) weakDims.push(`finding developers experienced with \`${t.name}\` may be harder (${attrs.hiringEase}/10 hiring ease)`);
        if (attrs.timeToMVP < 5) weakDims.push(`\`${t.name}\` trades development speed for power`);
      }
    }
    if (weakDims.length > 0) {
      lines.push(weakDims.slice(0, 2).join(". Also, ") + ". These are acceptable trade-offs given your priorities.");
    } else {
      lines.push("This stack is well-balanced for your constraints with no major blind spots. The main risk is scope creep — keep your MVP focused.");
    }
  }

  return lines.join("\n");
}

export async function POST(request: NextRequest) {
  const ip = getIP(request);
  const { allowed, retryAfter } = checkRateLimit(ip);

  if (!allowed) {
    return Response.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!validateBody(body)) {
    return Response.json(
      { error: "Invalid request. Ensure all fields are filled correctly." },
      { status: 400 }
    );
  }

  // STEP 1: Algorithmic selection (deterministic, ~5ms)
  const recommendation = selectStack(body);

  // STEP 2: Generate deterministic narration (no API key needed)
  const narration = generateNarration(body, recommendation);

  // STEP 3: Stream response via SSE
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        // First chunk: algorithmic results as JSON
        const scoreData = {
          type: "scores" as const,
          data: recommendation,
        };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(scoreData)}\n\n`)
        );

        // Stream narration word-by-word for the typing effect
        const words = narration.split(/(\s+)/);
        for (let i = 0; i < words.length; i += 3) {
          const chunk = words.slice(i, i + 3).join("");
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "narration", text: chunk })}\n\n`
            )
          );
          // Small delay for streaming feel
          await new Promise((r) => setTimeout(r, 8));
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
        );
        controller.close();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Stream interrupted";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: msg })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store",
      Connection: "keep-alive",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
