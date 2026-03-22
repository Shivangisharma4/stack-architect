import type {
  FormInputs,
  NLPSignals,
  WeightProfile,
  Technology,
  TechCategory,
  TechAttributes,
  ScoredTechnology,
  SelectedStack,
  Platform,
} from "./types";
import { TECHNOLOGIES, getTechById } from "./knowledge-graph";
import { getCompatibility } from "./compatibility-matrix";
import { findBestArchetype } from "./archetypes";

// Categories where the language penalty is HARD — if user says "rust",
// backend/language/build-tool MUST be Rust ecosystem
const HARD_LANGUAGE_CATEGORIES: TechCategory[] = [
  "backend", "language", "build-tool",
];

// Categories where language preference is soft — user says "rust" but
// a React frontend is still fine (no Rust frontend frameworks exist)
const SOFT_LANGUAGE_CATEGORIES: TechCategory[] = [
  "frontend", "mobile", "desktop",
];

// Score a single technology against the weight profile
function scoreTechnology(
  tech: Technology,
  weights: WeightProfile,
  inputs: FormInputs,
  signals: NLPSignals,
  explicitLanguage?: string | null,
  explicitFrameworks?: string[]
): number {
  let score = 0;
  for (const dim of Object.keys(weights) as (keyof WeightProfile)[]) {
    score += tech.attributes[dim as keyof TechAttributes] * weights[dim];
  }

  // Team expertise: strong bonus if tech matches, penalty if it doesn't
  // When someone explicitly selects "rust" in their expertise, they WANT Rust
  if (tech.languages.length > 0 && inputs.teamExpertise.length > 0) {
    const knows = tech.languages.some((lang) =>
      inputs.teamExpertise.includes(lang)
    );
    if (knows) {
      score *= 1.6; // Strong boost — user selected this language
    } else if (HARD_LANGUAGE_CATEGORIES.includes(tech.category)) {
      score *= 0.6; // Penalty on backend/language/build-tool that don't match
    }
  }

  // ---- EXPLICIT LANGUAGE ECOSYSTEM (the big one) ----
  // When user literally says "rust project" or "build with python",
  // this overrides everything for language-sensitive categories.
  if (explicitLanguage && tech.languages.length > 0) {
    const techUsesExplicitLang = tech.languages.includes(explicitLanguage);

    if (techUsesExplicitLang) {
      // This tech is in the user's requested ecosystem — MASSIVE boost
      score *= 2.0;
    } else if (HARD_LANGUAGE_CATEGORIES.includes(tech.category)) {
      // Backend/language/build-tool using wrong language = crushed
      // e.g., Fastify (typescript) when user asked for Rust
      score *= 0.25;
    } else if (SOFT_LANGUAGE_CATEGORIES.includes(tech.category)) {
      // Frontend/mobile/desktop — mild preference for matching,
      // but don't kill non-matching (Next.js is fine as frontend for Rust backend)
      score *= 0.85;
    }
    // Hosting with language restrictions (e.g., Vercel is JS-only)
    // Apply moderate penalty if it doesn't support the user's language
    if (tech.category === "hosting" && !techUsesExplicitLang) {
      score *= 0.6;
    }
    // Categories like database, cache, auth — no penalty
  }

  // ---- EXPLICIT FRAMEWORK MENTION ----
  // When user says "using svelte" or "with vue", that specific tech gets a huge boost
  if (explicitFrameworks && explicitFrameworks.length > 0) {
    if (explicitFrameworks.includes(tech.id)) {
      score *= 2.5; // User literally asked for this tech
    }
  }

  // Platform affinity: strong bonus for matching, heavy penalty for mismatch
  if (tech.platforms.includes(inputs.platform)) {
    score *= 1.35;
  } else {
    const siblingMap: Partial<Record<Platform, Platform[]>> = {
      "mobile-ios": ["mobile-cross"],
      "mobile-android": ["mobile-cross"],
      "mobile-cross": ["mobile-ios", "mobile-android"],
      web: ["script"],
      script: ["web", "cli"],
    };
    const siblings = siblingMap[inputs.platform] ?? [];
    const hasSibling = siblings.some((s) => tech.platforms.includes(s));

    if (hasSibling) {
      score *= 0.85;
    } else {
      score *= 0.4;
    }
  }

  // NLP signal bonuses
  if (signals.needsRealtime > 0.5 && tech.supportsRealtime) score *= 1.1;
  if (signals.needsSEO > 0.5 && tech.tags.includes("seo")) score *= 1.1;
  if (signals.needsML > 0.5 && tech.languages.includes("python")) score *= 1.1;
  if (signals.needsEcommerce > 0.5 && tech.attributes.ecosystemMaturity >= 8) score *= 1.05;
  if (signals.needsCMS > 0.5 && tech.tags.includes("cms")) score *= 1.15;
  if (signals.needsDataProcessing > 0.5 && tech.tags.includes("async")) score *= 1.1;

  // Gaming / Creative / 3D signal bonuses
  const hasGamingTag = tech.tags.some(t =>
    ["gaming", "game-engine", "arcade", "sprite", "pixel", "2d", "3d"].includes(t)
  );
  const hasCreativeTag = tech.tags.some(t =>
    ["creative", "art", "generative", "canvas", "animation", "visual", "interactive"].includes(t)
  );
  const has3DTag = tech.tags.some(t =>
    ["3d", "webgl", "opengl", "vulkan"].includes(t)
  );

  if (signals.needsGaming > 0.3 && hasGamingTag) score *= 1.6;
  if (signals.needsCreative > 0.3 && hasCreativeTag) score *= 1.5;
  if (signals.needs3D > 0.3 && has3DTag) score *= 1.6;

  // Cross-signal: gaming + 3D = double boost for 3D game engines
  if (signals.needsGaming > 0.3 && signals.needs3D > 0.3 && has3DTag && hasGamingTag) {
    score *= 1.3;
  }

  return score;
}

// Filter by hard constraints only (budget, deployment pref, db pref) — NOT platform
function filterCandidates(
  techs: Technology[],
  inputs: FormInputs
): Technology[] {
  return techs.filter((tech) => {
    // Database preference filter
    if (
      inputs.databasePreference !== "no-preference" &&
      tech.category === "database"
    ) {
      if (inputs.databasePreference === "sql") return tech.tags.includes("sql");
      if (inputs.databasePreference === "nosql") return tech.tags.includes("nosql");
    }

    // Budget filter
    if (inputs.budget === "free" && tech.category === "hosting" && !tech.freeHostingAvailable) {
      return false;
    }

    // Deployment preference filter
    if (inputs.deployment !== "no-preference" && tech.category === "hosting") {
      if (inputs.deployment === "serverless" && !tech.tags.includes("serverless")) return false;
      if (inputs.deployment === "containers" && !tech.tags.includes("containers") && !tech.tags.includes("docker")) return false;
      if (inputs.deployment === "vps" && !tech.tags.includes("vps")) return false;
    }

    return true;
  });
}

// Select the best technology for a category considering compatibility
function selectForCategory(
  candidates: ScoredTechnology[],
  selected: ScoredTechnology[]
): ScoredTechnology | null {
  if (!candidates || candidates.length === 0) return null;

  let bestCandidate = candidates[0];
  let bestAdjustedScore = -Infinity;

  // Check if any selected tech is a game engine — stronger compat weight needed
  const gameEngine = selected.find(s => s.technology.category === "game");

  for (const candidate of candidates) {
    let compatBonus = 0;

    // Hard language-engine compatibility: if a game engine is selected and this is a language,
    // check if the engine actually supports this language
    if (gameEngine && candidate.technology.category === "language") {
      const engineLangs = gameEngine.technology.languages;
      const candidateLangs = candidate.technology.languages;
      // Check if any of the candidate's languages overlap with the engine's languages
      const langMatch = candidateLangs.some(l => engineLangs.includes(l)) ||
                        engineLangs.some(l => candidate.technology.id.startsWith(l));
      if (!langMatch) {
        // This language fundamentally doesn't work with this game engine — massive penalty
        compatBonus = -5.0;
      } else {
        // Perfect language match — big bonus
        compatBonus = 3.0;
      }
    } else if (selected.length > 0) {
      for (const sel of selected) {
        const compat = getCompatibility(candidate.technology.id, sel.technology.id);
        const weight = (sel.technology.category === "game" || candidate.technology.category === "game") ? 5.0 : 1.0;
        compatBonus += compat * weight;
      }
      compatBonus /= selected.length;
    }
    // Scale compatibility impact: default 0.2, but 0.6 when game engines are in play
    const compatScale = gameEngine ? 0.6 : 0.2;
    const adjustedScore = candidate.rawScore + compatBonus * compatScale;
    if (adjustedScore > bestAdjustedScore) {
      bestAdjustedScore = adjustedScore;
      bestCandidate = { ...candidate, finalScore: adjustedScore };
    }
  }

  return bestCandidate;
}

// Determine which tech categories to fill based on platform + signals
// This is a PREFERENCE order, not a hard constraint
function getRelevantSlots(
  platform: Platform,
  signals: NLPSignals,
  inputs: FormInputs
): { primary: TechCategory[]; optional: TechCategory[] } {
  switch (platform) {
    case "script":
      // Scripts are simple — language is primary, but if description sounds
      // complex enough, also suggest a framework/hosting
      return {
        primary: ["language"],
        optional: ["frontend", "database", "hosting"],
      };

    case "cli":
      return {
        primary: ["language", "build-tool"],
        optional: ["database"],
      };

    case "desktop":
      return {
        primary: ["desktop", "language"],
        optional: ["database", "backend", "hosting"],
      };

    case "mobile-ios":
      return {
        primary: ["mobile", "language"],
        optional: ["database", "backend", "hosting", "auth"],
      };

    case "mobile-android":
      return {
        primary: ["mobile", "language"],
        optional: ["database", "backend", "hosting", "auth"],
      };

    case "mobile-cross":
      return {
        primary: ["mobile"],
        optional: ["database", "backend", "hosting", "auth", "language"],
      };

    case "game":
      return {
        primary: ["game", "language"],
        optional: ["backend", "database", "hosting", "auth"],
      };

    case "web":
    default:
      // If gaming/creative signals are strong, swap frontend for game engine
      if (signals.needsGaming > 0.3 || signals.needsCreative > 0.3 || signals.needs3D > 0.3) {
        return {
          primary: ["game", "language"],
          optional: ["backend", "database", "hosting", "auth"],
        };
      }
      // If it's a service/API app, backend is primary, frontend is optional
      if (signals.needsAPI > 0.4 && signals.needsSEO < 0.3 && signals.needsCMS < 0.3) {
        return {
          primary: ["backend", "database", "hosting", "language"],
          optional: ["orm", "auth", "cache", "frontend"],
        };
      }
      return {
        primary: ["frontend", "backend", "database", "hosting"],
        optional: ["orm", "auth", "cache", "cms", "language"],
      };
  }
}

// Decide if an optional slot is worth filling based on signals
function shouldIncludeOptional(
  category: TechCategory,
  signals: NLPSignals,
  inputs: FormInputs,
  platform: Platform,
  hasComplexDescription: boolean
): boolean {
  switch (category) {
    case "orm":
      return true; // decided by DB type downstream
    case "auth":
      return signals.needsAuth > 0.3 || signals.needsEcommerce > 0.3;
    case "cache":
      return inputs.scale === "growth" || inputs.scale === "enterprise" || signals.needsRealtime > 0.5;
    case "cms":
      return signals.needsCMS > 0.4;
    case "backend":
      return signals.needsAPI > 0.3 || signals.needsAuth > 0.3;
    case "hosting":
      return signals.needsAPI > 0.3 || hasComplexDescription;
    case "database":
      return true;
    case "frontend":
      // For scripts — only add a frontend if the project sounds complex
      return hasComplexDescription;
    case "language":
      // Always show language if user explicitly mentioned one, or if non-web platform
      return platform !== "web" || inputs.teamExpertise.length > 0;
    default:
      return false;
  }
}

export function solve(
  inputs: FormInputs,
  weights: WeightProfile,
  signals: NLPSignals,
  explicitLanguage?: string | null,
  explicitFrameworks?: string[]
): SelectedStack {
  const filtered = filterCandidates(TECHNOLOGIES, inputs);

  // Score all technologies with explicit language/framework awareness
  const scored: ScoredTechnology[] = filtered.map((tech) => ({
    technology: tech,
    rawScore: scoreTechnology(tech, weights, inputs, signals, explicitLanguage, explicitFrameworks),
    finalScore: 0,
  }));

  // Group by category and keep top N per category
  const byCategory = new Map<TechCategory, ScoredTechnology[]>();
  for (const s of scored) {
    const cat = s.technology.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(s);
  }
  for (const [cat, techs] of byCategory) {
    techs.sort((a, b) => b.rawScore - a.rawScore);
    // Keep more language candidates when game platform is selected
    // because compatibility with the game engine matters more than raw score
    const limit = (cat === "language" && inputs.platform === "game") ? 15 : 5;
    techs.splice(limit);
  }

  const { primary, optional } = getRelevantSlots(inputs.platform, signals, inputs);
  const hasComplexDescription = inputs.projectDescription.length > 80;

  // Check for archetype match
  const archetypeMatch = findBestArchetype(inputs, signals);
  let archetypeStack: SelectedStack | null = null;

  if (archetypeMatch && archetypeMatch.confidence >= 0.5) {
    const archTechs = archetypeMatch.archetype.stack;
    const buildArchSlot = (techId: string | undefined): ScoredTechnology | null => {
      if (!techId) return null;
      const tech = getTechById(techId);
      if (!tech) return null;
      return {
        technology: tech,
        rawScore: scoreTechnology(tech, weights, inputs, signals),
        finalScore: 0,
      };
    };

    const slots: Partial<Record<TechCategory, ScoredTechnology | null>> = {};
    for (const [cat, techId] of Object.entries(archTechs)) {
      slots[cat as TechCategory] = buildArchSlot(techId);
    }

    archetypeStack = {
      frontend: slots.frontend ?? null,
      backend: slots.backend ?? null,
      database: slots.database ?? null,
      hosting: slots.hosting ?? null,
      orm: slots.orm ?? null,
      auth: slots.auth ?? null,
      cache: slots.cache ?? null,
      cms: slots.cms ?? null,
      mobile: slots.mobile ?? null,
      desktop: slots.desktop ?? null,
      language: slots.language ?? null,
      buildTool: slots["build-tool"] ?? null,
      game: slots.game ?? null,
    };
  }

  // Greedy compatibility-aware selection
  const selected: ScoredTechnology[] = [];
  const selections: Partial<Record<TechCategory, ScoredTechnology | null>> = {};

  // Select primary slots
  for (const cat of primary) {
    const candidates = byCategory.get(cat);
    const pick = selectForCategory(candidates ?? [], selected);
    selections[cat] = pick;
    if (pick) selected.push(pick);
  }

  // Select optional slots
  for (const cat of optional) {
    if (!shouldIncludeOptional(cat, signals, inputs, inputs.platform, hasComplexDescription)) continue;

    // ORM: only if we have a SQL database AND a compatible backend
    if (cat === "orm") {
      const dbTags = selections.database?.technology.tags ?? [];
      if (!dbTags.includes("sql") || dbTags.includes("baas")) continue;

      // Skip ORM if backend already has a built-in one (Laravel=Eloquent, Django=Django ORM, Rails=ActiveRecord)
      const backendId = selections.backend?.technology.id;
      const backendsWithBuiltInORM = ["laravel", "django", "rails", "spring-boot", "phoenix", "vapor"];
      if (backendId && backendsWithBuiltInORM.includes(backendId)) continue;

      // Filter ORM candidates to only those sharing a language with the backend
      const backendLangs = selections.backend?.technology.languages ?? [];
      if (backendLangs.length > 0) {
        const compatibleORMs = (byCategory.get(cat) ?? []).filter(orm =>
          orm.technology.languages.some(l => backendLangs.includes(l))
        );
        const pick = selectForCategory(compatibleORMs, selected);
        selections[cat] = pick;
        if (pick) selected.push(pick);
        continue;
      }
    }

    const candidates = byCategory.get(cat);
    const pick = selectForCategory(candidates ?? [], selected);
    selections[cat] = pick;
    if (pick) selected.push(pick);
  }

  const algorithmicStack: SelectedStack = {
    frontend: selections.frontend ?? null,
    backend: selections.backend ?? null,
    database: selections.database ?? null,
    hosting: selections.hosting ?? null,
    orm: selections.orm ?? null,
    auth: selections.auth ?? null,
    cache: selections.cache ?? null,
    cms: selections.cms ?? null,
    mobile: selections.mobile ?? null,
    desktop: selections.desktop ?? null,
    language: selections.language ?? null,
    buildTool: selections["build-tool"] ?? null,
    game: selections.game ?? null,
  };

  // Compare archetype vs algorithmic
  if (archetypeStack) {
    const archTotal = sumScores(archetypeStack);
    const algoTotal = sumScores(algorithmicStack);
    if (archTotal > algoTotal) return archetypeStack;
  }

  return algorithmicStack;
}

function sumScores(stack: SelectedStack): number {
  let total = 0;
  const slots: (ScoredTechnology | null)[] = [
    stack.frontend, stack.backend, stack.database, stack.hosting,
    stack.orm, stack.auth, stack.cache, stack.cms,
    stack.mobile, stack.desktop, stack.language, stack.buildTool,
    stack.game,
  ];
  for (const s of slots) {
    if (s) total += s.rawScore;
  }
  return total;
}

// Generate an alternative stack by excluding specific tech IDs
export function solveWithExclusions(
  inputs: FormInputs,
  weights: WeightProfile,
  signals: NLPSignals,
  excludeIds: string[],
  explicitLanguage?: string | null,
  explicitFrameworks?: string[]
): SelectedStack {
  const filtered = filterCandidates(TECHNOLOGIES, inputs)
    .filter((t) => !excludeIds.includes(t.id));

  const scored: ScoredTechnology[] = filtered.map((tech) => ({
    technology: tech,
    rawScore: scoreTechnology(tech, weights, inputs, signals, explicitLanguage, explicitFrameworks),
    finalScore: 0,
  }));

  const byCategory = new Map<TechCategory, ScoredTechnology[]>();
  for (const s of scored) {
    const cat = s.technology.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(s);
  }
  for (const [cat, techs] of byCategory) {
    techs.sort((a, b) => b.rawScore - a.rawScore);
    const limit = (cat === "language" && inputs.platform === "game") ? 15 : 5;
    techs.splice(limit);
  }

  const { primary, optional } = getRelevantSlots(inputs.platform, signals, inputs);
  const hasComplexDescription = inputs.projectDescription.length > 80;

  const selected: ScoredTechnology[] = [];
  const selections: Partial<Record<TechCategory, ScoredTechnology | null>> = {};

  for (const cat of primary) {
    const candidates = byCategory.get(cat);
    const pick = selectForCategory(candidates ?? [], selected);
    selections[cat] = pick;
    if (pick) selected.push(pick);
  }

  for (const cat of optional) {
    if (!shouldIncludeOptional(cat, signals, inputs, inputs.platform, hasComplexDescription)) continue;
    if (cat === "orm") {
      const dbTags = selections.database?.technology.tags ?? [];
      if (!dbTags.includes("sql") || dbTags.includes("baas")) continue;
      const backendId = selections.backend?.technology.id;
      const backendsWithBuiltInORM = ["laravel", "django", "rails", "spring-boot", "phoenix", "vapor"];
      if (backendId && backendsWithBuiltInORM.includes(backendId)) continue;
      const backendLangs = selections.backend?.technology.languages ?? [];
      if (backendLangs.length > 0) {
        const compatibleORMs = (byCategory.get(cat) ?? []).filter(orm =>
          orm.technology.languages.some(l => backendLangs.includes(l))
        );
        const pick = selectForCategory(compatibleORMs, selected);
        selections[cat] = pick;
        if (pick) selected.push(pick);
        continue;
      }
    }
    const candidates = byCategory.get(cat);
    const pick = selectForCategory(candidates ?? [], selected);
    selections[cat] = pick;
    if (pick) selected.push(pick);
  }

  return {
    frontend: selections.frontend ?? null,
    backend: selections.backend ?? null,
    database: selections.database ?? null,
    hosting: selections.hosting ?? null,
    orm: selections.orm ?? null,
    auth: selections.auth ?? null,
    cache: selections.cache ?? null,
    cms: selections.cms ?? null,
    mobile: selections.mobile ?? null,
    desktop: selections.desktop ?? null,
    language: selections.language ?? null,
    buildTool: selections["build-tool"] ?? null,
    game: selections.game ?? null,
  };
}
