import type { Archetype, FormInputs, NLPSignals } from "./types";

export const ARCHETYPES: Archetype[] = [
  // ---- Web Archetypes ----
  {
    id: "startup-sprint",
    name: "The Startup Sprint",
    description: "Ship fast with a modern JS full-stack. Supabase handles auth, database, and storage in one service.",
    triggerSignals: {},
    triggerScale: ["hobby", "startup"],
    triggerTimeline: ["hackathon", "weeks"],
    triggerPlatforms: ["web"],
    stack: {
      frontend: "nextjs",
      database: "supabase",
      hosting: "vercel",
      orm: "prisma",
      auth: "nextauth",
    },
  },
  {
    id: "enterprise-fortress",
    name: "The Enterprise Fortress",
    description: "Battle-tested Java ecosystem built for millions of users, strict type safety, and long-term maintainability.",
    triggerSignals: {},
    triggerScale: ["enterprise"],
    triggerTimeline: ["months", "no-rush"],
    triggerPlatforms: ["web"],
    stack: {
      frontend: "angular",
      backend: "spring-boot",
      database: "postgresql",
      hosting: "aws",
      cache: "redis",
      auth: "auth0",
    },
  },
  {
    id: "realtime-engine",
    name: "The Real-time Engine",
    description: "WebSocket-ready stack for chat, live feeds, and collaborative apps. Redis pubsub ties it all together.",
    triggerSignals: { needsRealtime: 0.6 },
    triggerScale: ["startup", "growth"],
    triggerTimeline: ["weeks", "months"],
    triggerPlatforms: ["web"],
    stack: {
      frontend: "nextjs",
      backend: "fastify",
      database: "postgresql",
      hosting: "railway",
      cache: "redis",
      orm: "prisma",
    },
  },
  {
    id: "content-platform",
    name: "The Content Platform",
    description: "SEO-optimized content architecture. Headless CMS for editors, static generation for performance.",
    triggerSignals: { needsSEO: 0.6, needsCMS: 0.5 },
    triggerScale: ["hobby", "startup", "growth"],
    triggerTimeline: ["weeks", "months"],
    triggerPlatforms: ["web"],
    stack: {
      frontend: "astro",
      database: "postgresql",
      hosting: "vercel",
      cms: "sanity",
    },
  },
  {
    id: "data-powerhouse",
    name: "The Data Powerhouse",
    description: "Python-native stack optimized for data processing, ML pipelines, and analytics dashboards.",
    triggerSignals: { needsDataProcessing: 0.5, needsML: 0.4 },
    triggerScale: ["startup", "growth", "enterprise"],
    triggerTimeline: ["months", "no-rush"],
    triggerPlatforms: ["web"],
    stack: {
      frontend: "nextjs",
      backend: "fastapi",
      database: "postgresql",
      hosting: "railway",
      cache: "redis",
      orm: "sqlalchemy",
    },
  },
  {
    id: "indie-hacker",
    name: "The Indie Hacker",
    description: "Minimal bundle, maximum performance. Svelte's compiler-first approach keeps everything lean.",
    triggerSignals: {},
    triggerScale: ["hobby", "startup"],
    triggerTimeline: ["hackathon", "weeks"],
    triggerPlatforms: ["web"],
    stack: {
      frontend: "sveltekit",
      database: "supabase",
      hosting: "vercel",
      orm: "drizzle",
    },
  },
  {
    id: "go-machine",
    name: "The Go Machine",
    description: "Raw throughput with minimal memory. Go's concurrency model handles massive request volumes effortlessly.",
    triggerSignals: { needsAPI: 0.5 },
    triggerScale: ["growth", "enterprise"],
    triggerTimeline: ["months", "no-rush"],
    triggerPlatforms: ["web"],
    stack: {
      frontend: "nextjs",
      backend: "go-fiber",
      database: "postgresql",
      hosting: "flyio",
      cache: "redis",
    },
  },
  {
    id: "python-stack",
    name: "The Python Stack",
    description: "Convention-driven development with Django's batteries-included approach. Admin panel out of the box.",
    triggerSignals: { needsAuth: 0.4, needsCMS: 0.3 },
    triggerScale: ["startup", "growth"],
    triggerTimeline: ["weeks", "months"],
    triggerPlatforms: ["web"],
    stack: {
      frontend: "nextjs",
      backend: "django",
      database: "postgresql",
      hosting: "railway",
      cache: "redis",
    },
  },

  // ---- Mobile Archetypes ----
  {
    id: "ios-native",
    name: "The iOS Native",
    description: "Pure SwiftUI for maximum iOS performance and platform integration. The gold standard for Apple ecosystem apps.",
    triggerSignals: {},
    triggerScale: ["hobby", "startup", "growth"],
    triggerTimeline: ["weeks", "months"],
    triggerPlatforms: ["mobile-ios"],
    stack: { mobile: "swiftui", language: "swift-lang", database: "core-data" },
  },
  {
    id: "android-native",
    name: "The Android Native",
    description: "Jetpack Compose with Kotlin for modern, reactive Android development. Google's recommended approach.",
    triggerSignals: {},
    triggerScale: ["hobby", "startup", "growth"],
    triggerTimeline: ["weeks", "months"],
    triggerPlatforms: ["mobile-android"],
    stack: { mobile: "jetpack-compose", language: "kotlin-lang", database: "realm" },
  },
  {
    id: "cross-platform-mobile",
    name: "The Cross-Platform Mobile",
    description: "React Native + Expo for shipping to iOS and Android from a single codebase with near-native performance.",
    triggerSignals: {},
    triggerScale: ["startup", "growth"],
    triggerTimeline: ["weeks", "months"],
    triggerPlatforms: ["mobile-cross"],
    stack: { mobile: "expo", database: "supabase", hosting: "vercel", auth: "clerk" },
  },
  {
    id: "flutter-mobile",
    name: "The Flutter Stack",
    description: "Flutter's widget system gives pixel-perfect control on both platforms with a single Dart codebase.",
    triggerSignals: {},
    triggerScale: ["startup", "growth"],
    triggerTimeline: ["months", "no-rush"],
    triggerPlatforms: ["mobile-cross"],
    stack: { mobile: "flutter", database: "firebase-auth" },
  },

  // ---- Desktop Archetypes ----
  {
    id: "desktop-rust",
    name: "The Rust Desktop",
    description: "Tauri combines Rust's memory safety with web technologies for lightweight, secure desktop apps.",
    triggerSignals: {},
    triggerScale: ["hobby", "startup"],
    triggerTimeline: ["weeks", "months"],
    triggerPlatforms: ["desktop"],
    stack: { desktop: "tauri", language: "rust-lang" },
  },
  {
    id: "desktop-electron",
    name: "The Electron Desktop",
    description: "Ship desktop apps with web tech you already know. Massive ecosystem and proven at scale (VS Code, Slack, Discord).",
    triggerSignals: {},
    triggerScale: ["startup", "growth"],
    triggerTimeline: ["weeks", "months"],
    triggerPlatforms: ["desktop"],
    stack: { desktop: "electron", language: "typescript-node" },
  },

  // ---- Script / CLI Archetypes ----
  {
    id: "python-script",
    name: "The Python Script",
    description: "Python's simplicity and rich standard library make it the default choice for scripts, tools, and automation.",
    triggerSignals: { isSimpleScript: 0.3 },
    triggerScale: ["hobby", "startup"],
    triggerTimeline: ["hackathon", "weeks"],
    triggerPlatforms: ["script"],
    stack: { language: "python-lang" },
  },
  {
    id: "rust-cli",
    name: "The Rust CLI",
    description: "Blazing-fast compiled binaries with Clap for argument parsing. Zero-dependency distribution.",
    triggerSignals: { needsCLI: 0.4 },
    triggerScale: ["hobby", "startup", "growth"],
    triggerTimeline: ["weeks", "months"],
    triggerPlatforms: ["cli"],
    stack: { language: "rust-lang", "build-tool": "cargo" },
  },
  {
    id: "go-cli",
    name: "The Go CLI",
    description: "Single-binary CLIs with Cobra. Fast compilation, easy cross-compilation, and built-in concurrency.",
    triggerSignals: { needsCLI: 0.4 },
    triggerScale: ["startup", "growth"],
    triggerTimeline: ["weeks", "months"],
    triggerPlatforms: ["cli"],
    stack: { language: "go-lang", "build-tool": "cobra" },
  },
];

export function findBestArchetype(
  inputs: FormInputs,
  signals: NLPSignals
): { archetype: Archetype; confidence: number } | null {
  let bestMatch: Archetype | null = null;
  let bestScore = 0;

  for (const arch of ARCHETYPES) {
    let score = 0;
    let factors = 0;

    // Platform match — must match platform or skip
    if (arch.triggerPlatforms.length > 0) {
      if (!arch.triggerPlatforms.includes(inputs.platform)) continue;
      factors++;
      score += 1;
    }

    // Scale match
    if (arch.triggerScale.length > 0) {
      factors++;
      if (arch.triggerScale.includes(inputs.scale)) score += 1;
    }

    // Timeline match
    if (arch.triggerTimeline.length > 0) {
      factors++;
      if (arch.triggerTimeline.includes(inputs.timeline)) score += 1;
    }

    // Signal matches
    for (const [signal, threshold] of Object.entries(arch.triggerSignals)) {
      factors++;
      const signalValue = signals[signal as keyof NLPSignals];
      if (signalValue >= (threshold as number)) {
        score += 1 + signalValue;
      }
    }

    // Team expertise match
    const archLanguages = new Set<string>();
    for (const techId of Object.values(arch.stack)) {
      if (techId === "nextjs" || techId === "sveltekit" || techId === "nuxt" || techId === "remix" || techId === "astro") {
        archLanguages.add("typescript");
        archLanguages.add("javascript");
      }
      if (techId === "django" || techId === "fastapi" || techId === "python-lang") archLanguages.add("python");
      if (techId === "rails") archLanguages.add("ruby");
      if (techId === "spring-boot") archLanguages.add("java");
      if (techId === "go-fiber" || techId === "go-lang") archLanguages.add("go");
      if (techId === "rust-lang") archLanguages.add("rust");
      if (techId === "swift-lang" || techId === "swiftui") archLanguages.add("swift");
      if (techId === "kotlin-lang" || techId === "jetpack-compose") archLanguages.add("kotlin");
      if (techId === "typescript-node" || techId === "electron") archLanguages.add("typescript");
    }

    const expertiseOverlap = inputs.teamExpertise.filter((e) =>
      archLanguages.has(e)
    ).length;
    if (expertiseOverlap > 0) {
      factors++;
      score += Math.min(expertiseOverlap * 0.5, 1.5);
    }

    const confidence = factors > 0 ? score / factors : 0;
    if (confidence > bestScore) {
      bestScore = confidence;
      bestMatch = arch;
    }
  }

  if (bestMatch && bestScore >= 0.5) {
    return { archetype: bestMatch, confidence: bestScore };
  }

  return null;
}
