import type {
  FormInputs,
  NLPSignals,
  WeightProfile,
  ScaleTier,
  Timeline,
  Priority,
  Platform,
} from "./types";

function applyMultipliers(
  w: WeightProfile,
  multipliers: Partial<WeightProfile>
) {
  for (const [key, mult] of Object.entries(multipliers)) {
    w[key as keyof WeightProfile] *= mult as number;
  }
}

function normalize(w: WeightProfile): WeightProfile {
  const sum = Object.values(w).reduce((a, b) => a + b, 0);
  if (sum === 0) return w;
  const result = { ...w };
  for (const key of Object.keys(result) as (keyof WeightProfile)[]) {
    result[key] = result[key] / sum;
  }
  return result;
}

export function calculateWeights(
  inputs: FormInputs,
  signals: NLPSignals
): WeightProfile {
  // Start with equal baseline
  const w: WeightProfile = {
    performanceAtScale: 1,
    learningCurve: 1,
    ecosystemMaturity: 1,
    timeToMVP: 1,
    costEfficiency: 1,
    typeSafety: 1,
    communitySize: 1,
    hiringEase: 1,
  };

  // ---- Scale adjustments ----
  const scaleMultipliers: Record<ScaleTier, Partial<WeightProfile>> = {
    hobby: {
      performanceAtScale: 0.3,
      costEfficiency: 2.0,
      hiringEase: 0.2,
      learningCurve: 1.8,
      timeToMVP: 1.5,
    },
    startup: {
      timeToMVP: 2.0,
      costEfficiency: 1.5,
      performanceAtScale: 0.8,
      hiringEase: 1.2,
    },
    growth: {
      performanceAtScale: 1.5,
      hiringEase: 1.5,
      ecosystemMaturity: 1.3,
      typeSafety: 1.2,
    },
    enterprise: {
      performanceAtScale: 2.0,
      typeSafety: 2.0,
      hiringEase: 1.8,
      ecosystemMaturity: 1.5,
      costEfficiency: 0.5,
    },
  };
  applyMultipliers(w, scaleMultipliers[inputs.scale]);

  // ---- Timeline adjustments ----
  const timelineMultipliers: Record<Timeline, Partial<WeightProfile>> = {
    hackathon: {
      timeToMVP: 3.0,
      learningCurve: 2.0,
      typeSafety: 0.3,
      ecosystemMaturity: 0.7,
    },
    weeks: {
      timeToMVP: 2.0,
      learningCurve: 1.5,
      typeSafety: 0.6,
    },
    months: {},
    "no-rush": {
      typeSafety: 1.5,
      ecosystemMaturity: 1.3,
      performanceAtScale: 1.2,
    },
  };
  applyMultipliers(w, timelineMultipliers[inputs.timeline]);

  // ---- Budget adjustments ----
  const budgetCostMultiplier: Record<string, number> = {
    free: 2.5,
    low: 1.8,
    moderate: 1.0,
    enterprise: 0.4,
  };
  w.costEfficiency *= budgetCostMultiplier[inputs.budget] ?? 1;

  // ---- Priority boosts (user's top 2) ----
  const priorityMap: Record<Priority, keyof WeightProfile> = {
    performance: "performanceAtScale",
    security: "typeSafety",
    "dev-speed": "timeToMVP",
    seo: "ecosystemMaturity",
    realtime: "performanceAtScale",
    cost: "costEfficiency",
  };

  for (const p of inputs.priorities) {
    const dim = priorityMap[p];
    if (dim) w[dim] *= 1.8;
  }

  // ---- NLP signal adjustments ----
  if (signals.needsRealtime > 0.5) {
    w.performanceAtScale *= 1.3;
  }
  if (signals.needsSEO > 0.5) {
    w.ecosystemMaturity *= 1.2;
  }
  if (signals.needsDataProcessing > 0.5) {
    w.performanceAtScale *= 1.4;
    w.typeSafety *= 1.2;
  }
  if (signals.needsEcommerce > 0.5) {
    w.ecosystemMaturity *= 1.3;
    w.typeSafety *= 1.2;
  }
  if (signals.needsML > 0.5) {
    w.performanceAtScale *= 1.3;
    w.ecosystemMaturity *= 1.2;
  }
  if (signals.needsAuth > 0.5) {
    // Security-sensitive apps need type safety and mature ecosystems
    w.typeSafety *= 1.5;
    w.ecosystemMaturity *= 1.2;
    w.performanceAtScale *= 1.2;
  }

  // ---- Platform adjustments ----
  const platformMultipliers: Partial<Record<Platform, Partial<WeightProfile>>> = {
    script: {
      timeToMVP: 2.5,
      learningCurve: 2.0,
      performanceAtScale: 0.3,
      hiringEase: 0.3,
      communitySize: 0.5,
    },
    cli: {
      performanceAtScale: 1.5,
      timeToMVP: 1.3,
      typeSafety: 1.3,
      learningCurve: 1.2,
      hiringEase: 0.4,
    },
    desktop: {
      performanceAtScale: 1.5,
      ecosystemMaturity: 1.3,
      typeSafety: 1.2,
    },
    "mobile-ios": {
      ecosystemMaturity: 1.3,
      performanceAtScale: 1.3,
    },
    "mobile-android": {
      ecosystemMaturity: 1.3,
      performanceAtScale: 1.3,
    },
    "mobile-cross": {
      timeToMVP: 1.5,
      communitySize: 1.3,
    },
  };

  const platformMult = platformMultipliers[inputs.platform];
  if (platformMult) applyMultipliers(w, platformMult);

  // Simple script: heavily favor speed and simplicity
  if (signals.isSimpleScript > 0.5) {
    w.timeToMVP *= 2.0;
    w.learningCurve *= 1.8;
    w.performanceAtScale *= 0.3;
    w.hiringEase *= 0.2;
  }

  return normalize(w);
}
