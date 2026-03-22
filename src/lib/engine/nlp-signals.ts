import type { NLPSignals } from "./types";

interface SignalRule {
  signal: keyof NLPSignals;
  patterns: RegExp[];
  keywords: string[];
  weight: number;
}

const SIGNAL_RULES: SignalRule[] = [
  {
    signal: "needsRealtime",
    patterns: [
      /real[\s-]?time/i,
      /live\s+(update|feed|chat|stream|data|dashboard)/i,
      /websocket/i,
      /push\s+notification/i,
    ],
    keywords: [
      "chat", "messaging", "notification", "collaborative", "multiplayer",
      "live", "streaming", "pubsub", "socket", "presence", "sync",
    ],
    weight: 0.25,
  },
  {
    signal: "needsEcommerce",
    patterns: [
      /e[\s-]?commerce/i,
      /online\s+(store|shop)/i,
      /shopping\s+cart/i,
      /payment\s+(process|gateway|integrat)/i,
    ],
    keywords: [
      "payment", "stripe", "checkout", "product", "inventory", "order",
      "shop", "marketplace", "cart", "subscription", "billing", "invoice",
      "pricing", "catalog",
    ],
    weight: 0.2,
  },
  {
    signal: "needsSEO",
    patterns: [/\bseo\b/i, /search\s+engine/i, /server[\s-]?side\s+render/i],
    keywords: [
      "blog", "content", "cms", "marketing", "landing", "editorial",
      "articles", "publishing", "organic", "seo", "static", "pages",
    ],
    weight: 0.2,
  },
  {
    signal: "needsDataProcessing",
    patterns: [
      /data\s+(process|pipeline|warehouse|analytics|ingest)/i,
      /batch\s+(process|job)/i,
      /etl/i,
    ],
    keywords: [
      "analytics", "dashboard", "report", "metrics", "aggregation",
      "processing", "pipeline", "warehouse", "bigdata", "visualization",
      "statistics", "data",
    ],
    weight: 0.2,
  },
  {
    signal: "needsAPI",
    patterns: [
      /\bapi[\s-]?(first|only|driven|gateway)\b/i,
      /rest(ful)?\s+api/i,
      /graphql/i,
      /microservice/i,
      /\bservice\s+(app|application|layer|platform)\b/i,
      /\bbackend\s+(app|service|system)\b/i,
    ],
    keywords: [
      "api", "endpoint", "webhook", "integration", "microservice",
      "gateway", "graphql", "rest", "grpc", "sdk", "service",
      "backend", "server", "microservices",
    ],
    weight: 0.2,
  },
  {
    signal: "needsMobile",
    patterns: [
      /mobile\s+(app|first|native)/i,
      /react\s+native/i,
      /ios\s+(and|&)\s+android/i,
      /cross[\s-]?platform/i,
    ],
    keywords: [
      "mobile", "ios", "android", "app", "native", "responsive",
      "pwa", "flutter", "react-native",
    ],
    weight: 0.2,
  },
  {
    signal: "needsAuth",
    patterns: [
      /user\s+(auth|login|registration|signup)/i,
      /oauth/i,
      /sso/i,
      /role[\s-]?based/i,
    ],
    keywords: [
      "auth", "login", "signup", "register", "password", "session",
      "permission", "role", "admin", "user", "account", "profile",
      "oauth", "sso", "jwt", "security", "secure", "encryption",
      "encrypted", "vault", "credential", "biometric", "2fa", "mfa",
    ],
    weight: 0.2,
  },
  {
    signal: "needsCMS",
    patterns: [
      /content\s+management/i,
      /\bcms\b/i,
      /headless\s+cms/i,
      /admin\s+panel/i,
    ],
    keywords: [
      "cms", "editor", "content", "publish", "draft", "media",
      "upload", "wysiwyg", "markdown", "editorial",
    ],
    weight: 0.2,
  },
  {
    signal: "needsSearch",
    patterns: [
      /full[\s-]?text\s+search/i,
      /search\s+(engine|functionality|feature)/i,
      /elasticsearch/i,
    ],
    keywords: [
      "search", "filter", "autocomplete", "elasticsearch", "algolia",
      "typeahead", "fuzzy",
    ],
    weight: 0.2,
  },
  {
    signal: "needsML",
    patterns: [
      /machine\s+learning/i,
      /\bai\b/i,
      /\bml\b/i,
      /neural\s+network/i,
      /deep\s+learning/i,
      /natural\s+language/i,
    ],
    keywords: [
      "ml", "ai", "model", "training", "inference", "prediction",
      "recommendation", "classification", "nlp", "llm", "gpt",
      "tensorflow", "pytorch",
    ],
    weight: 0.2,
  },
  {
    signal: "isSimpleScript",
    patterns: [
      /\b(calculator|converter|scraper|script|utility|tool)\b/i,
      /\b(automate|automation)\b/i,
      /\bcommand[\s-]?line\s+(tool|utility|app)\b/i,
      /\b(parse|convert|transform)\s+(file|csv|json|xml|data)\b/i,
      /\b(build|make|write)\s+(a|an|me)?\s*(simple|small|quick|basic)?\s*(calculator|converter|timer|counter|game|quiz|todo|script)\b/i,
    ],
    keywords: [
      "calculator", "converter", "scraper", "script", "utility",
      "automation", "cron", "bot", "simple", "basic", "small",
      "todo", "timer", "counter", "quiz", "game", "cli",
      "generate", "parse",
    ],
    weight: 0.15,
  },
  {
    signal: "needsDesktop",
    patterns: [
      /desktop\s+(app|application)/i,
      /\btauri\b/i,
      /\belectron\b/i,
      /\bmaui\b/i,
      /\bgui\s+(app|application|tool)/i,
      /native\s+(desktop|gui|window)/i,
      /\bwindow(s)?\s+app/i,
      /\bmac(os)?\s+app/i,
      /\blinux\s+app/i,
    ],
    keywords: [
      "desktop", "tauri", "electron", "gui", "window", "tray",
      "menubar", "native", "maui", "qt", "gtk", "wxwidgets",
      "system-tray", "cross-platform-desktop",
    ],
    weight: 0.25,
  },
  {
    signal: "needsCLI",
    patterns: [
      /\bcli\s+(tool|app|utility|application)\b/i,
      /command[\s-]?line\s+(tool|interface|app|utility)\b/i,
      /terminal\s+(tool|app|utility)/i,
      /\bshell\s+(tool|script|command)\b/i,
    ],
    keywords: [
      "cli", "terminal", "command-line", "commandline", "shell",
      "argv", "flags", "arguments", "repl", "prompt",
    ],
    weight: 0.25,
  },
  {
    signal: "needsGaming",
    patterns: [
      /\bgame\s*(engine|dev|development|loop|physics)?\b/i,
      /\b(2d|3d)\s*(game|platformer|shooter|rpg|puzzle)\b/i,
      /\b(arcade|retro\s+game|pixel[\s-]?art\s*(game|platformer)|sprite|tilemap)\b/i,
      /\b(multiplayer|pvp|pve|mmo)\b/i,
      /\bgaming\b/i,
      /\bgame\b/i,
      /\bgam(e|ing)\s+animation/i,
      /\banimated\s+(game|character|sprite)/i,
    ],
    keywords: [
      "game", "gaming", "arcade", "pixel", "sprite",
      "platformer", "shooter", "rpg", "puzzle", "level",
      "enemy", "player", "score", "leaderboard", "highscore",
      "physics", "collision", "hitbox", "tilemap", "gamepad",
      "controller", "joystick", "multiplayer",
    ],
    weight: 0.25,
  },
  {
    signal: "needsCreative",
    patterns: [
      /\bcreative\s+(coding|project)\b/i,
      /\bgenerative\s+(art|design|music)\b/i,
      /\binteractive\s+(art|visual|installation|experience)\b/i,
      /\bdata\s+vis(ualization)?\b/i,
    ],
    keywords: [
      "creative", "generative", "art", "artistic", "visual",
      "visualization", "interactive", "canvas", "sketch",
      "drawing", "paint", "animation", "motion", "particle",
      "procedural", "fractal", "shader",
    ],
    weight: 0.2,
  },
  {
    signal: "needs3D",
    patterns: [
      /\b3d\b/i,
      /\bwebgl\b/i,
      /\bthree[\s.]?js\b/i,
      /\b(3d|3D)\s*(model|render|scene|animation|visualization|viewer)\b/i,
      /\bvr\b/i,
      /\bar\b/i,
    ],
    keywords: [
      "3d", "webgl", "opengl", "vulkan", "three.js", "threejs",
      "render", "mesh", "texture", "shader", "raytracing",
      "scene", "camera", "lighting", "vr", "ar", "xr",
      "metaverse", "immersive",
    ],
    weight: 0.25,
  },
];

export function extractSignals(description: string): NLPSignals {
  const signals: NLPSignals = {
    needsRealtime: 0,
    needsEcommerce: 0,
    needsSEO: 0,
    needsDataProcessing: 0,
    needsAPI: 0,
    needsMobile: 0,
    needsAuth: 0,
    needsCMS: 0,
    needsSearch: 0,
    needsML: 0,
    isSimpleScript: 0,
    needsDesktop: 0,
    needsCLI: 0,
    needsGaming: 0,
    needsCreative: 0,
    needs3D: 0,
  };

  const descLower = description.toLowerCase();

  for (const rule of SIGNAL_RULES) {
    let score = 0;

    // Regex patterns get higher confidence
    for (const pat of rule.patterns) {
      if (pat.test(description)) {
        score += rule.weight * 1.5;
      }
    }

    // Keyword matches
    for (const kw of rule.keywords) {
      if (descLower.includes(kw.toLowerCase())) {
        score += rule.weight;
      }
    }

    signals[rule.signal] = Math.min(1, score);
  }

  // Boost isSimpleScript if no complex web signals are detected
  const webSignalSum =
    signals.needsRealtime + signals.needsEcommerce + signals.needsSEO +
    signals.needsAuth + signals.needsCMS + signals.needsSearch +
    signals.needsDataProcessing;
  if (webSignalSum < 0.3 && signals.isSimpleScript > 0) {
    signals.isSimpleScript = Math.min(1, signals.isSimpleScript * 1.5);
  }

  return signals;
}

// Detect explicit language mentions in the description
const LANGUAGE_PATTERNS: { lang: string; patterns: RegExp[] }[] = [
  { lang: "python", patterns: [/\bpython\b/i, /\bpy\b/i, /\bdjango\b/i, /\bflask\b/i, /\bfastapi\b/i] },
  { lang: "rust", patterns: [/\brust\b/i, /\bcargo\b/i, /\bactix\b/i, /\btokio\b/i] },
  { lang: "go", patterns: [/\bgolang\b/i, /\bgo\s+(lang|program|app)/i] },
  { lang: "kotlin", patterns: [/\bkotlin\b/i, /\bjetpack\s+compose\b/i] },
  { lang: "java", patterns: [/\bjava\b/i, /\bspring\b/i, /\bjvm\b/i] },
  { lang: "swift", patterns: [/\bswift\b/i, /\bswiftui\b/i, /\buikit\b/i] },
  { lang: "csharp", patterns: [/\bc#\b/i, /\bcsharp\b/i, /\b\.net\b/i, /\bmaui\b/i] },
  { lang: "cpp", patterns: [/\bc\+\+\b/i, /\bcpp\b/i, /\bqt\b/i] },
  { lang: "typescript", patterns: [/\btypescript\b/i, /\bts\b/i, /\bnode\.?js\b/i, /\bdeno\b/i, /\bbun\b/i] },
  { lang: "c", patterns: [/\bc\s+(program|language|code)\b/i, /\bin\s+c\b/i, /\busing\s+c\b/i, /\bwith\s+c\b/i] },
  { lang: "lua", patterns: [/\blua\b/i, /\blove2d\b/i, /\blöve\b/i] },
  { lang: "php", patterns: [/\bphp\b/i, /\blaravel\b/i, /\bwordpress\b/i] },
  { lang: "elixir", patterns: [/\belixir\b/i, /\bphoenix\b/i, /\bliveview\b/i] },
  { lang: "ruby", patterns: [/\bruby\b/i, /\brails\b/i, /\bruby\s+on\s+rails\b/i] },
  { lang: "dart", patterns: [/\bdart\b/i, /\bflutter\b/i] },
];

export function detectExplicitLanguage(description: string): string | null {
  for (const { lang, patterns } of LANGUAGE_PATTERNS) {
    for (const pat of patterns) {
      if (pat.test(description)) return lang;
    }
  }
  return null;
}

// Detect explicit framework/tech mentions — returns matching tech IDs
// e.g. "using svelte" → "sveltekit", "with vue" → "nuxt"
const FRAMEWORK_PATTERNS: { techId: string; patterns: RegExp[] }[] = [
  { techId: "sveltekit", patterns: [/\bsvelte\b/i, /\bsveltekit\b/i] },
  { techId: "nuxt", patterns: [/\bvue\b/i, /\bvue[\s.]?js\b/i, /\bnuxt\b/i] },
  { techId: "nextjs", patterns: [/\bnext[\s.]?js\b/i, /\bnextjs\b/i] },
  { techId: "remix", patterns: [/\bremix\b/i] },
  { techId: "astro", patterns: [/\bastro\b/i] },
  { techId: "angular", patterns: [/\bangular\b/i] },
  { techId: "react-native", patterns: [/\breact[\s-]native\b/i] },
  { techId: "flutter", patterns: [/\bflutter\b/i] },
  { techId: "expo-sdk", patterns: [/\bexpo\b/i] },
  { techId: "tauri", patterns: [/\btauri\b/i] },
  { techId: "electron", patterns: [/\belectron\b/i] },
  { techId: "fastify", patterns: [/\bfastify\b/i] },
  { techId: "express", patterns: [/\bexpress\b/i, /\bexpress[\s.]?js\b/i] },
  { techId: "convex", patterns: [/\bconvex\b/i] },
  { techId: "supabase", patterns: [/\bsupabase\b/i] },
  { techId: "firebase", patterns: [/\bfirebase\b/i] },
  { techId: "mongodb", patterns: [/\bmongo\b/i, /\bmongodb\b/i] },
  { techId: "postgresql", patterns: [/\bpostgres\b/i, /\bpostgresql\b/i] },
  { techId: "redis", patterns: [/\bredis\b/i] },
  // New tech detections
  { techId: "vue", patterns: [/\bvue\b(?!\s*\.?\s*js)/i] }, // "vue" alone without .js = standalone Vue
  { techId: "solid", patterns: [/\bsolid[\s.]?js\b/i, /\bsolidjs\b/i] },
  { techId: "threejs", patterns: [/\bthree[\s.]?js\b/i, /\bthreejs\b/i] },
  { techId: "phaser", patterns: [/\bphaser\b/i] },
  { techId: "p5js", patterns: [/\bp5[\s.]?js\b/i, /\bprocessing\b/i] },
  { techId: "bevy", patterns: [/\bbevy\b/i] },
  { techId: "pygame", patterns: [/\bpygame\b/i] },
  { techId: "love2d", patterns: [/\blove2d\b/i, /\blöve\b/i] },
  { techId: "godot", patterns: [/\bgodot\b/i] },
  { techId: "hono", patterns: [/\bhono\b/i] },
  { techId: "nestjs", patterns: [/\bnest[\s.]?js\b/i, /\bnestjs\b/i] },
  { techId: "gin", patterns: [/\bgin\b(?!\s+and\b)/i] },
  { techId: "phoenix", patterns: [/\bphoenix\b/i] },
  { techId: "laravel", patterns: [/\blaravel\b/i] },
  { techId: "flask", patterns: [/\bflask\b/i] },
];

// Auto-detect platform from description keywords
// Returns the detected platform or null if ambiguous
import type { Platform } from "./types";

const PLATFORM_PATTERNS: { platform: Platform; patterns: RegExp[]; keywords: string[] }[] = [
  {
    platform: "game",
    patterns: [
      /\bgame\b/i, /\bgaming\b/i, /\bplatformer\b/i, /\bshooter\b/i,
      /\brpg\b/i, /\bpuzzle\s+game\b/i, /\barcade\b/i, /\bgame\s+engine\b/i,
      /\b(bevy|phaser|pygame|godot|love2d|unity|unreal)\b/i,
    ],
    keywords: ["game", "gaming", "platformer", "shooter", "rpg", "arcade", "sprite", "tilemap"],
  },
  {
    platform: "mobile-ios",
    patterns: [
      /\bios\s+app\b/i, /\biphone\s+app\b/i, /\bipad\s+app\b/i,
      /\bswiftui\b/i, /\buikit\b/i, /\bapple\s+(app|store)\b/i,
    ],
    keywords: ["ios", "iphone", "ipad", "swiftui"],
  },
  {
    platform: "mobile-android",
    patterns: [
      /\bandroid\s+app\b/i, /\bjetpack\s+compose\b/i,
      /\bgoogle\s+play\b/i, /\bandroid\s+studio\b/i,
    ],
    keywords: ["android"],
  },
  {
    platform: "mobile-cross",
    patterns: [
      /\bcross[\s-]?platform\s+(mobile|app)\b/i,
      /\bios\s+(and|&|\+)\s+android\b/i,
      /\breact[\s-]native\b/i, /\bflutter\b/i, /\bexpo\b/i,
    ],
    keywords: ["cross-platform", "react-native", "flutter"],
  },
  {
    platform: "desktop",
    patterns: [
      /\bdesktop\s+app\b/i, /\btauri\b/i, /\belectron\b/i,
      /\bnative\s+desktop\b/i, /\bwindows\s+app\b/i, /\bmac\s+app\b/i,
    ],
    keywords: ["desktop", "tauri", "electron"],
  },
  {
    platform: "cli",
    patterns: [
      /\bcli\s+(tool|app)\b/i, /\bcommand[\s-]?line\b/i,
      /\bterminal\s+(tool|app)\b/i,
    ],
    keywords: ["cli", "command-line", "terminal"],
  },
  {
    platform: "script",
    patterns: [
      /\bscript\b/i, /\bautomation\b/i, /\bscraper\b/i,
      /\butility\b/i, /\bcalculator\b/i,
    ],
    keywords: ["script", "scraper", "automation", "utility"],
  },
  {
    platform: "web",
    patterns: [
      /\bweb\s*(site|app|application|page)\b/i, /\bwebsite\b/i,
      /\bdashboard\b/i, /\blanding\s+page\b/i, /\bblog\b/i,
      /\be[\s-]?commerce\b/i, /\bsaas\b/i, /\bweb\s+portal\b/i,
    ],
    keywords: ["website", "webapp", "saas", "dashboard", "blog", "landing"],
  },
];

export function detectPlatform(description: string): { platform: Platform; confidence: number } | null {
  const descLower = description.toLowerCase();
  let bestPlatform: Platform | null = null;
  let bestScore = 0;

  for (const { platform, patterns, keywords } of PLATFORM_PATTERNS) {
    let score = 0;
    for (const pat of patterns) {
      if (pat.test(description)) score += 2;
    }
    for (const kw of keywords) {
      if (descLower.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestPlatform = platform;
    }
  }

  if (bestPlatform && bestScore >= 2) {
    return { platform: bestPlatform, confidence: Math.min(bestScore / 6, 1) };
  }
  return null;
}

export function detectExplicitFrameworks(description: string): string[] {
  const matches: string[] = [];
  for (const { techId, patterns } of FRAMEWORK_PATTERNS) {
    for (const pat of patterns) {
      if (pat.test(description)) {
        matches.push(techId);
        break;
      }
    }
  }
  return matches;
}
