import { NextRequest } from "next/server";
import { getClient } from "@/lib/anthropic";
import { checkRateLimit } from "@/lib/rate-limit";
import { selectStack } from "@/lib/engine";
import type { FormInputs } from "@/lib/engine/types";

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

function buildNarrationPrompt(
  inputs: FormInputs,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recommendation: any
): string {
  const stack = recommendation.stack;
  const stackSummary: string[] = [];

  const addSlot = (label: string, slot: typeof stack.frontend) => {
    if (slot) stackSummary.push(`${label}: ${slot.technology.name} (score: ${slot.rawScore.toFixed(2)})`);
  };

  addSlot("Frontend", stack.frontend);
  addSlot("Backend", stack.backend);
  addSlot("Database", stack.database);
  addSlot("Hosting", stack.hosting);
  addSlot("Language", stack.language);
  addSlot("Game Engine", stack.game);
  addSlot("Mobile Framework", stack.mobile);
  addSlot("Desktop Framework", stack.desktop);
  addSlot("Build Tool", stack.buildTool);
  addSlot("ORM", stack.orm);
  addSlot("Auth", stack.auth);
  addSlot("Cache", stack.cache);
  addSlot("CMS", stack.cms);

  return `You are an expert software architect. A deterministic algorithm has selected this tech stack — your job is to explain WHY it's right for THIS SPECIFIC project. Do NOT suggest alternatives or different technologies.

CRITICAL: Reference the user's actual project by name/purpose. Never give generic advice. Every sentence should connect back to what they're building.

THE USER'S PROJECT:
"${inputs.projectDescription}"
Platform: ${inputs.platform} | Scale: ${inputs.scale} | Timeline: ${inputs.timeline} | Budget: ${inputs.budget}
Team knows: ${inputs.teamExpertise.join(", ") || "not specified"} | Priorities: ${inputs.priorities.join(", ")}

THE ALGORITHM CHOSE:
${stackSummary.join("\n")}
Efficiency: ${recommendation.efficiencyScore}% | Compatibility: ${recommendation.compatibilityScore}%
${recommendation.archetypeMatch ? `Pattern: ${recommendation.archetypeMatch}` : ""}

Respond exactly in this markdown structure:

## Why This Stack Works for Your Project
3-4 sentences explaining why THESE SPECIFIC technologies fit THIS project. Name the project. Reference its specific features. Explain how the chosen stack addresses them.

## How to Build It
3-4 bullet points with specific, actionable implementation steps. Reference real libraries, APIs, configurations, or patterns. Every tip must be relevant to their project — not generic "best practices".

## What You're Trading Off
2-3 sentences about what this stack sacrifices and practical ways to mitigate. Be honest but constructive.

Be concise and direct. Write like a senior engineer talking to a peer, not a tutorial.`;
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

  // STEP 2: Stream hybrid response via SSE
  const encoder = new TextEncoder();
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY;

  try {
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

          // Stream AI narration only if API key is configured
          if (hasApiKey) {
            const client = getClient();
            const narrationPrompt = buildNarrationPrompt(body, recommendation);

            const stream = await client.messages.stream({
              model: "claude-sonnet-4-20250514",
              max_tokens: 1500,
              messages: [{ role: "user", content: narrationPrompt }],
            });

            for await (const event of stream) {
              if (
                event.type === "content_block_delta" &&
                event.delta.type === "text_delta"
              ) {
                const chunk = {
                  type: "narration" as const,
                  text: event.delta.text,
                };
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
                );
              }
            }
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
  } catch (err) {
    console.error("Recommend API error:", err);

    // Even if AI fails, return the algorithmic results
    return Response.json({
      recommendation,
      aiError: "AI narration unavailable. Algorithmic results are shown.",
    });
  }
}
