import type {
  SelectedStack,
  WeightProfile,
  NLPSignals,
  ScoredTechnology,
  TechAttributes,
} from "./types";
import { getCompatibility } from "./compatibility-matrix";

function getAllTechs(stack: SelectedStack): ScoredTechnology[] {
  const techs: ScoredTechnology[] = [];
  const slots: (ScoredTechnology | null)[] = [
    stack.frontend, stack.backend, stack.database, stack.hosting,
    stack.orm, stack.auth, stack.cache, stack.cms,
    stack.mobile, stack.desktop, stack.language, stack.buildTool,
    stack.game,
  ];
  for (const s of slots) {
    if (s) techs.push(s);
  }
  return techs;
}

export function computeEfficiency(
  stack: SelectedStack,
  weights: WeightProfile,
  signals: NLPSignals
): { efficiencyScore: number; compatibilityScore: number } {
  const allTechs = getAllTechs(stack);
  if (allTechs.length === 0) {
    return { efficiencyScore: 0, compatibilityScore: 0 };
  }

  // Component 1: Weighted attribute score (0-70 points)
  let totalWeightedScore = 0;
  for (const scored of allTechs) {
    const attrs = scored.technology.attributes;
    let techScore = 0;
    for (const dim of Object.keys(weights) as (keyof WeightProfile)[]) {
      techScore += attrs[dim as keyof TechAttributes] * weights[dim];
    }
    totalWeightedScore += techScore;
  }
  const avgWeightedScore = totalWeightedScore / allTechs.length;
  const attributeComponent = (avgWeightedScore / 10) * 70;

  // Component 2: Compatibility score (0-20 points)
  let totalCompat = 0;
  let pairCount = 0;
  for (let i = 0; i < allTechs.length; i++) {
    for (let j = i + 1; j < allTechs.length; j++) {
      totalCompat += getCompatibility(
        allTechs[i].technology.id,
        allTechs[j].technology.id
      );
      pairCount++;
    }
  }
  // For single-tech stacks (e.g., script), give full compatibility
  const avgCompat = pairCount > 0 ? totalCompat / pairCount : 1;
  const compatComponent = ((avgCompat + 1) / 2) * 20;

  // Component 3: Signal coverage (0-10 points)
  let signalCoverage = 0;
  let activeSignals = 0;

  const hasRealtime = allTechs.some((t) => t.technology.supportsRealtime);
  const hasTags = (tag: string) =>
    allTechs.some((t) => t.technology.tags.includes(tag));
  const hasLang = (lang: string) =>
    allTechs.some((t) => t.technology.languages.includes(lang));

  if (signals.needsRealtime > 0.5) {
    activeSignals++;
    if (hasRealtime) signalCoverage++;
  }
  if (signals.needsSEO > 0.5) {
    activeSignals++;
    if (hasTags("seo") || hasTags("ssr") || hasTags("ssg")) signalCoverage++;
  }
  if (signals.needsEcommerce > 0.5) {
    activeSignals++;
    if (allTechs.some((t) => t.technology.attributes.ecosystemMaturity >= 7))
      signalCoverage++;
  }
  if (signals.needsML > 0.5) {
    activeSignals++;
    if (hasLang("python") || hasTags("ml")) signalCoverage++;
  }
  if (signals.needsDataProcessing > 0.5) {
    activeSignals++;
    if (hasTags("cache") || hasTags("queue") || hasTags("async"))
      signalCoverage++;
  }
  if (signals.needsCMS > 0.5) {
    activeSignals++;
    if (hasTags("cms") || hasTags("headless") || hasTags("admin"))
      signalCoverage++;
  }
  if (signals.isSimpleScript > 0.5) {
    activeSignals++;
    // Script signal is covered if we selected just a language
    if (allTechs.some((t) => t.technology.category === "language"))
      signalCoverage++;
  }
  if (signals.needsDesktop > 0.5) {
    activeSignals++;
    if (allTechs.some((t) => t.technology.category === "desktop"))
      signalCoverage++;
  }
  if (signals.needsCLI > 0.5) {
    activeSignals++;
    if (hasTags("cli") || allTechs.some((t) => t.technology.category === "build-tool"))
      signalCoverage++;
  }

  const signalComponent =
    activeSignals > 0 ? (signalCoverage / activeSignals) * 10 : 10;

  const efficiencyScore = Math.round(
    Math.min(100, attributeComponent + compatComponent + signalComponent)
  );
  const compatibilityScore = Math.round(((avgCompat + 1) / 2) * 100);

  return { efficiencyScore, compatibilityScore };
}

export function identifyTradeoffs(
  stack: SelectedStack,
  weights: WeightProfile
): string[] {
  const allTechs = getAllTechs(stack);
  if (allTechs.length === 0) return [];
  const tradeoffs: string[] = [];

  const dimLabels: Record<keyof WeightProfile, string> = {
    performanceAtScale: "Scale Performance",
    learningCurve: "Ease of Learning",
    ecosystemMaturity: "Ecosystem Maturity",
    timeToMVP: "Development Speed",
    costEfficiency: "Cost Efficiency",
    typeSafety: "Type Safety",
    communitySize: "Community Support",
    hiringEase: "Hiring Availability",
  };

  for (const dim of Object.keys(weights) as (keyof WeightProfile)[]) {
    if (weights[dim] < 0.05) continue;

    const avgScore =
      allTechs.reduce(
        (sum, t) => sum + t.technology.attributes[dim as keyof TechAttributes],
        0
      ) / allTechs.length;

    if (avgScore < 5.5) {
      const label = dimLabels[dim];
      tradeoffs.push(
        `${label} scores ${avgScore.toFixed(1)}/10. This stack trades ${label.toLowerCase()} for strength in other areas`
      );
    }
  }

  return tradeoffs;
}
