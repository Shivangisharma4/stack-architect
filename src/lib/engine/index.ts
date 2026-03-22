import type {
  FormInputs,
  StackRecommendation,
  AlternativeStack,
  SelectedStack,
  WeightProfile,
  NLPSignals,
  TechCategory,
  ScoredTechnology,
} from "./types";
import { extractSignals, detectExplicitLanguage, detectExplicitFrameworks } from "./nlp-signals";
import { calculateWeights } from "./weight-calculator";
import { solve, solveWithExclusions } from "./constraint-solver";
import {
  computeEfficiency,
  identifyTradeoffs,
} from "./efficiency-score";
import { findBestArchetype } from "./archetypes";

// Generate a one-line summary that proves we understood the project
function summarizeProject(description: string, signals: NLPSignals, platform: string): string {
  const parts: string[] = [];

  // Platform context
  const platformLabels: Record<string, string> = {
    web: "web application",
    desktop: "desktop application",
    "mobile-ios": "iOS application",
    "mobile-android": "Android application",
    "mobile-cross": "cross-platform mobile app",
    cli: "command-line tool",
    script: "standalone program",
    game: "game",
  };
  parts.push(platformLabels[platform] ?? "application");

  // Detected features
  const features: string[] = [];
  if (signals.needsAuth > 0.3) features.push("user authentication");
  if (signals.needsRealtime > 0.3) features.push("real-time features");
  if (signals.needsEcommerce > 0.3) features.push("payment processing");
  if (signals.needsSEO > 0.3) features.push("SEO optimization");
  if (signals.needsDataProcessing > 0.3) features.push("data processing");
  if (signals.needsML > 0.3) features.push("ML/AI capabilities");
  if (signals.needsCMS > 0.3) features.push("content management");
  if (signals.needsSearch > 0.3) features.push("search functionality");
  if (signals.needsAPI > 0.3) features.push("API integration");

  // Extract the first meaningful noun phrase from description (up to ~8 words)
  const firstSentence = description.split(/[.!?\n]/)[0].trim();
  const condensed = firstSentence.length > 60
    ? firstSentence.slice(0, 57) + "..."
    : firstSentence;

  if (features.length > 0) {
    return `A ${parts[0]}: "${condensed}", requiring ${features.slice(0, 3).join(", ")}`;
  }
  return `A ${parts[0]}: "${condensed}"`;
}

// Determine what makes a stack variant different
function labelAlternative(
  alt: SelectedStack,
  primary: SelectedStack,
  weights: WeightProfile
): string {
  // Find the key category that differs
  const coreSlots: { key: keyof SelectedStack; label: string }[] = [
    { key: "frontend", label: "frontend" },
    { key: "backend", label: "backend" },
    { key: "game", label: "engine" },
    { key: "mobile", label: "framework" },
    { key: "desktop", label: "framework" },
    { key: "language", label: "language" },
  ];

  for (const { key } of coreSlots) {
    const altTech = alt[key] as ScoredTechnology | null;
    const priTech = primary[key] as ScoredTechnology | null;
    if (altTech && priTech && altTech.technology.id !== priTech.technology.id) {
      // Characterize what this variant optimizes
      const altAttrs = altTech.technology.attributes;
      const priAttrs = priTech.technology.attributes;

      if (altAttrs.timeToMVP > priAttrs.timeToMVP + 1) return "Fastest to Ship";
      if (altAttrs.performanceAtScale > priAttrs.performanceAtScale + 1) return "Performance Focused";
      if (altAttrs.learningCurve > priAttrs.learningCurve + 1) return "Easiest to Learn";
      if (altAttrs.typeSafety > priAttrs.typeSafety + 1) return "Type-Safe Alternative";
      if (altAttrs.costEfficiency > priAttrs.costEfficiency + 1) return "Budget Friendly";
      if (altAttrs.ecosystemMaturity > priAttrs.ecosystemMaturity + 1) return "Battle-Tested";
      if (altAttrs.communitySize > priAttrs.communitySize + 1) return "Largest Community";

      return `${altTech.technology.name}-Based Stack`;
    }
  }

  // Fallback: look at what's broadly different
  const sortedDims = (Object.keys(weights) as (keyof WeightProfile)[])
    .sort((a, b) => weights[b] - weights[a]);
  const topDim = sortedDims[0];
  const dimLabels: Record<string, string> = {
    performanceAtScale: "Performance Focused",
    learningCurve: "Beginner Friendly",
    ecosystemMaturity: "Battle-Tested",
    timeToMVP: "Rapid Development",
    costEfficiency: "Budget Optimized",
    typeSafety: "Type-Safe",
    communitySize: "Popular Choice",
    hiringEase: "Easy to Staff",
  };
  return dimLabels[topDim] ?? "Alternative Stack";
}

// Get the "lead" tech category for a platform (what we exclude to generate variants)
function getLeadCategory(platform: string): TechCategory {
  switch (platform) {
    case "mobile-ios":
    case "mobile-android":
    case "mobile-cross":
      return "mobile";
    case "desktop":
      return "desktop";
    case "game":
      return "game";
    case "cli":
    case "script":
      return "language";
    case "web":
    default:
      return "frontend";
  }
}

export function selectStack(inputs: FormInputs): StackRecommendation {
  // Step 1: Extract NLP signals
  const nlpSignals = extractSignals(inputs.projectDescription);

  // Step 1.5: Detect explicit language and framework mentions
  const explicitLang = detectExplicitLanguage(inputs.projectDescription);
  const explicitFrameworks = detectExplicitFrameworks(inputs.projectDescription);
  if (explicitLang && !inputs.teamExpertise.includes(explicitLang)) {
    inputs = { ...inputs, teamExpertise: [...inputs.teamExpertise, explicitLang] };
  }

  // Step 2: Calculate dynamic weight profile
  const weightProfile = calculateWeights(inputs, nlpSignals);

  // Step 3: Primary solve (pass explicit language + frameworks for ecosystem-aware scoring)
  const stack = solve(inputs, weightProfile, nlpSignals, explicitLang, explicitFrameworks);

  // Step 4: Efficiency + compatibility
  const { efficiencyScore, compatibilityScore } = computeEfficiency(
    stack, weightProfile, nlpSignals
  );

  // Step 5: Tradeoffs
  const tradeoffs = identifyTradeoffs(stack, weightProfile);

  // Step 6: Archetype match
  const archetypeResult = findBestArchetype(inputs, nlpSignals);

  // Step 7: Generate alternatives by excluding the primary's lead tech
  const leadCat = getLeadCategory(inputs.platform);
  const primaryLeadId = getLeadTechId(stack, leadCat);
  const alternatives: AlternativeStack[] = [];
  const excludedIds: string[] = primaryLeadId ? [primaryLeadId] : [];

  for (let i = 0; i < 3; i++) {
    const altStack = solveWithExclusions(inputs, weightProfile, nlpSignals, excludedIds, explicitLang, explicitFrameworks);
    const altLeadId = getLeadTechId(altStack, leadCat);

    // Skip if we got the same stack or an empty lead
    if (!altLeadId || excludedIds.includes(altLeadId)) break;

    const altScores = computeEfficiency(altStack, weightProfile, nlpSignals);

    alternatives.push({
      stack: altStack,
      efficiencyScore: altScores.efficiencyScore,
      compatibilityScore: altScores.compatibilityScore,
      archetypeMatch: null,
      archetypeDescription: null,
      label: labelAlternative(altStack, stack, weightProfile),
    });

    excludedIds.push(altLeadId);
  }

  // Step 8: Project summary
  const projectSummary = summarizeProject(
    inputs.projectDescription, nlpSignals, inputs.platform
  );

  return {
    efficiencyScore,
    stack,
    platform: inputs.platform,
    archetypeMatch: archetypeResult?.archetype.name ?? null,
    archetypeDescription: archetypeResult?.archetype.description ?? null,
    compatibilityScore,
    tradeoffs,
    weightProfile,
    nlpSignals,
    alternatives,
    projectSummary,
  };
}

function getLeadTechId(stack: SelectedStack, category: TechCategory): string | null {
  const catMap: Record<string, keyof SelectedStack> = {
    frontend: "frontend",
    backend: "backend",
    database: "database",
    hosting: "hosting",
    mobile: "mobile",
    desktop: "desktop",
    language: "language",
    "build-tool": "buildTool",
    game: "game",
  };
  const key = catMap[category];
  if (!key) return null;
  const slot = stack[key] as ScoredTechnology | null;
  return slot?.technology.id ?? null;
}
