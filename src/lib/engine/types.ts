// ---- Platform ----

export type Platform =
  | "web"
  | "desktop"
  | "mobile-ios"
  | "mobile-android"
  | "mobile-cross"
  | "cli"
  | "script";

// ---- Technology Categories ----

export type TechCategory =
  | "frontend"
  | "backend"
  | "database"
  | "cache"
  | "orm"
  | "auth"
  | "hosting"
  | "cms"
  | "mobile"
  | "desktop"
  | "language"
  | "build-tool";

// ---- Technology Attributes (8 dimensions, 0-10 each) ----

export interface TechAttributes {
  performanceAtScale: number;
  learningCurve: number;       // 10 = easiest to learn
  ecosystemMaturity: number;
  timeToMVP: number;           // 10 = fastest to ship
  costEfficiency: number;      // 10 = cheapest to run
  typeSafety: number;
  communitySize: number;
  hiringEase: number;
}

export const ATTRIBUTE_LABELS: Record<keyof TechAttributes, string> = {
  performanceAtScale: "Scale Performance",
  learningCurve: "Learning Curve",
  ecosystemMaturity: "Ecosystem Maturity",
  timeToMVP: "Time to MVP",
  costEfficiency: "Cost Efficiency",
  typeSafety: "Type Safety",
  communitySize: "Community Size",
  hiringEase: "Hiring Ease",
};

// ---- Technology Definition ----

export interface Technology {
  id: string;
  name: string;
  category: TechCategory;
  attributes: TechAttributes;
  tags: string[];
  supportsRealtime: boolean;
  freeHostingAvailable: boolean;
  languages: string[];
  platforms: Platform[];         // which platforms this tech supports
}

// ---- NLP Signals ----

export interface NLPSignals {
  needsRealtime: number;
  needsEcommerce: number;
  needsSEO: number;
  needsDataProcessing: number;
  needsAPI: number;
  needsMobile: number;
  needsAuth: number;
  needsCMS: number;
  needsSearch: number;
  needsML: number;
  isSimpleScript: number;        // "calculator", "todo", "script" — doesn't need a full stack
  needsDesktop: number;          // desktop app signals
  needsCLI: number;              // command-line tool signals
  needsGaming: number;           // games, animations, interactive visuals
  needsCreative: number;         // art, generative, creative coding
  needs3D: number;               // 3D, WebGL, three.js, 3D visualization
}

// ---- Weight Profile ----

export interface WeightProfile {
  performanceAtScale: number;
  learningCurve: number;
  ecosystemMaturity: number;
  timeToMVP: number;
  costEfficiency: number;
  typeSafety: number;
  communitySize: number;
  hiringEase: number;
}

// ---- Form Input Types ----

export type ScaleTier = "hobby" | "startup" | "growth" | "enterprise";
export type Timeline = "hackathon" | "weeks" | "months" | "no-rush";
export type Budget = "free" | "low" | "moderate" | "enterprise";
export type DeploymentPref = "serverless" | "containers" | "vps" | "managed" | "no-preference";
export type Priority = "performance" | "security" | "dev-speed" | "seo" | "realtime" | "cost";

export interface FormInputs {
  projectDescription: string;
  platform: Platform;
  scale: ScaleTier;
  timeline: Timeline;
  teamExpertise: string[];
  budget: Budget;
  deployment: DeploymentPref;
  priorities: Priority[];
  databasePreference: string;
}

// ---- Engine Output ----

export interface ScoredTechnology {
  technology: Technology;
  rawScore: number;
  finalScore: number;
}

// SelectedStack is now flexible — different platforms need different slots
export interface SelectedStack {
  // Core (always present for web)
  frontend: ScoredTechnology | null;
  backend: ScoredTechnology | null;
  database: ScoredTechnology | null;
  hosting: ScoredTechnology | null;
  // Optional add-ons
  orm: ScoredTechnology | null;
  auth: ScoredTechnology | null;
  cache: ScoredTechnology | null;
  cms: ScoredTechnology | null;
  // Platform-specific
  mobile: ScoredTechnology | null;
  desktop: ScoredTechnology | null;
  language: ScoredTechnology | null;
  buildTool: ScoredTechnology | null;
}

export interface AlternativeStack {
  stack: SelectedStack;
  efficiencyScore: number;
  compatibilityScore: number;
  archetypeMatch: string | null;
  archetypeDescription: string | null;
  label: string; // e.g. "Performance Optimized", "Fastest to Ship"
}

export interface StackRecommendation {
  efficiencyScore: number;
  stack: SelectedStack;
  platform: Platform;
  archetypeMatch: string | null;
  archetypeDescription: string | null;
  compatibilityScore: number;
  tradeoffs: string[];
  weightProfile: WeightProfile;
  nlpSignals: NLPSignals;
  alternatives: AlternativeStack[];
  projectSummary: string; // one-line summary to prove we understood the project
}

// ---- Archetype ----

export interface Archetype {
  id: string;
  name: string;
  description: string;
  triggerSignals: Partial<NLPSignals>;
  triggerScale: ScaleTier[];
  triggerTimeline: Timeline[];
  triggerPlatforms: Platform[];
  stack: Partial<Record<TechCategory, string>>;
}

// ---- Form State ----

export interface FormState {
  step: number;
  inputs: FormInputs;
  isLoading: boolean;
  recommendation: StackRecommendation | null;
  aiNarration: string;
  isStreaming: boolean;
  error: string | null;
}

export type FormAction =
  | { type: "SET_FIELD"; field: keyof FormInputs; value: FormInputs[keyof FormInputs] }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "START_LOADING" }
  | { type: "SET_RECOMMENDATION"; payload: StackRecommendation }
  | { type: "APPEND_NARRATION"; payload: string }
  | { type: "FINISH_STREAMING" }
  | { type: "SET_ERROR"; payload: string }
  | { type: "RESET" };
