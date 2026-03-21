// Sparse compatibility matrix: key = sorted "techA::techB", value = -1.0 to 1.0
// -1 = terrible pairing, 0 = neutral, 1 = perfect natural combo
// Only known-good and known-bad pairings are recorded; unknowns default to 0

const COMPATIBILITY: Record<string, number> = {
  // ---- Strong positive pairings ----

  // Next.js ecosystem
  "nextjs::prisma": 0.9,
  "nextjs::vercel": 1.0,
  "nextjs::postgresql": 0.8,
  "nextjs::supabase": 0.9,
  "nextjs::nextauth": 1.0,
  "nextjs::clerk": 0.85,
  "nextjs::sanity": 0.85,
  "nextjs::drizzle": 0.85,
  "nextjs::redis": 0.7,
  "nextjs::mongodb": 0.7,
  "nextjs::railway": 0.7,

  // SvelteKit ecosystem
  "sveltekit::vercel": 0.8,
  "sveltekit::prisma": 0.8,
  "sveltekit::supabase": 0.85,
  "sveltekit::drizzle": 0.8,
  "sveltekit::postgresql": 0.7,
  "sveltekit::flyio": 0.75,

  // Nuxt ecosystem
  "nuxt::vercel": 0.7,
  "nuxt::supabase": 0.8,
  "nuxt::prisma": 0.7,
  "nuxt::postgresql": 0.7,

  // Remix ecosystem
  "remix::prisma": 0.85,
  "remix::vercel": 0.75,
  "remix::flyio": 0.85,
  "remix::postgresql": 0.8,
  "remix::drizzle": 0.8,

  // Astro ecosystem
  "astro::vercel": 0.85,
  "astro::sanity": 0.9,
  "astro::strapi": 0.85,
  "astro::supabase": 0.7,

  // Angular ecosystem
  "angular::spring-boot": 0.9,
  "angular::aws": 0.85,
  "angular::auth0": 0.8,
  "angular::postgresql": 0.7,

  // Express ecosystem
  "express::mongodb": 0.85,
  "express::prisma": 0.8,
  "express::postgresql": 0.8,
  "express::redis": 0.9,
  "express::railway": 0.75,
  "express::digitalocean": 0.8,

  // Fastify ecosystem
  "fastify::prisma": 0.8,
  "fastify::postgresql": 0.85,
  "fastify::redis": 0.9,
  "fastify::drizzle": 0.85,
  "fastify::flyio": 0.8,

  // Django ecosystem
  "django::postgresql": 0.95,
  "django::railway": 0.8,
  "django::redis": 0.85,
  "django::digitalocean": 0.8,
  "django::auth0": 0.6,
  "django::sqlalchemy": 0.3,

  // Rails ecosystem
  "activerecord::rails": 1.0,
  "postgresql::rails": 0.95,
  "rails::redis": 0.9,
  "digitalocean::rails": 0.8,
  "flyio::rails": 0.85,
  "rails::railway": 0.8,

  // Spring Boot ecosystem
  "aws::spring-boot": 0.9,
  "postgresql::spring-boot": 0.9,
  "redis::spring-boot": 0.85,
  "auth0::spring-boot": 0.8,
  "mysql::spring-boot": 0.85,

  // FastAPI ecosystem
  "fastapi::postgresql": 0.9,
  "fastapi::redis": 0.85,
  "fastapi::sqlalchemy": 0.95,
  "fastapi::railway": 0.8,
  "fastapi::flyio": 0.8,
  "fastapi::mongodb": 0.7,

  // Go Fiber ecosystem
  "flyio::go-fiber": 0.9,
  "go-fiber::postgresql": 0.85,
  "go-fiber::redis": 0.9,
  "digitalocean::go-fiber": 0.8,
  "aws::go-fiber": 0.8,

  // Database + ORM natural pairs
  "drizzle::postgresql": 0.9,
  "drizzle::mysql": 0.85,
  "drizzle::sqlite": 0.9,
  "prisma::postgresql": 0.95,
  "prisma::mysql": 0.85,
  "prisma::mongodb": 0.7,
  "prisma::sqlite": 0.85,
  "activerecord::postgresql": 0.95,
  "activerecord::mysql": 0.85,
  "postgresql::sqlalchemy": 0.95,
  "mysql::sqlalchemy": 0.85,

  // Supabase includes auth/storage
  "clerk::supabase": 0.3,
  "nextauth::supabase": 0.5,

  // ---- Negative / awkward pairings ----

  // Cross-ecosystem mismatches
  "django::nextjs": -0.6,
  "nextjs::rails": -0.5,
  "activerecord::nextjs": -0.9,
  "nextjs::sqlalchemy": -0.8,
  "spring-boot::vercel": -0.8,
  "django::prisma": -0.8,
  "django::drizzle": -0.9,
  "prisma::rails": -0.8,
  "drizzle::rails": -0.9,
  "drizzle::django": -0.9,
  "activerecord::fastapi": -0.9,
  "go-fiber::prisma": -0.7,
  "go-fiber::drizzle": -0.7,
  "go-fiber::activerecord": -0.9,
  "go-fiber::sqlalchemy": -0.9,
  "rails::vercel": -0.7,
  "django::vercel": -0.7,
  "spring-boot::railway": -0.3,
  "angular::vercel": -0.4,

  // Auth mismatches
  "django::clerk": -0.6,
  "django::nextauth": -0.8,
  "rails::clerk": -0.6,
  "rails::nextauth": -0.8,
  "spring-boot::nextauth": -0.9,
  "spring-boot::clerk": -0.5,
  "go-fiber::nextauth": -0.9,
  "go-fiber::clerk": -0.5,

  // DynamoDB with non-AWS
  "dynamodb::prisma": -0.5,
  "dynamodb::drizzle": -0.5,
  "dynamodb::vercel": -0.3,
  "dynamodb::railway": -0.5,
  "dynamodb::activerecord": -0.7,
  "dynamodb::sqlalchemy": -0.5,
  "aws::dynamodb": 1.0,

  // ---- Mobile pairings ----
  "expo::supabase": 0.9,
  "expo::clerk": 0.85,
  "expo::firebase-auth": 0.8,
  "expo::vercel": 0.7,
  "react-native::supabase": 0.85,
  "react-native::clerk": 0.8,
  "react-native::firebase-auth": 0.8,
  "flutter::firebase-auth": 0.9,
  "flutter::supabase": 0.7,
  "swiftui::core-data": 0.95,
  "swiftui::swift-lang": 1.0,
  "swift-lang::core-data": 0.9,
  "swift-lang::uikit": 0.95,
  "jetpack-compose::kotlin-lang": 1.0,
  "jetpack-compose::realm": 0.85,
  "kotlin-lang::realm": 0.8,
  "kotlin-multiplatform::realm": 0.8,

  // ---- Desktop pairings ----
  "tauri::rust-lang": 1.0,
  "tauri::cargo": 0.9,
  "electron::typescript-node": 0.95,
  "dotnet-maui::csharp-lang": 1.0,
  "qt::cpp-lang": 0.95,
  "swiftui-macos::swift-lang": 1.0,

  // ---- CLI pairings ----
  "rust-lang::cargo": 1.0,
  "rust-lang::clap": 0.95,
  "cargo::clap": 0.9,
  "go-lang::cobra": 0.95,
  "python-lang::click": 0.9,

  // ---- Language-backend pairings ----
  "rust-lang::actix-web": 1.0,
  "convex::nextjs": 0.85,
  "convex::react-native": 0.8,

  // ---- Cross-ecosystem negatives ----
  "swiftui::kotlin-lang": -0.9,
  "jetpack-compose::swift-lang": -0.9,
  "tauri::csharp-lang": -0.7,
  "electron::rust-lang": -0.3,
  "flutter::swift-lang": -0.4,
  "flutter::kotlin-lang": -0.4,

  // ---- New tech pairings ----

  // Vue.js ecosystem
  "vue::nuxt": 0.95,
  "vue::hono": 0.7,
  "vue::netlify": 0.8,

  // SolidJS
  "solid::hono": 0.8,
  "solid::cloudflare-pages": 0.85,
  "solid::turso": 0.75,

  // Gaming / Creative
  "threejs::nextjs": 0.7,
  "threejs::sveltekit": 0.7,
  "threejs::vercel": 0.7,
  "threejs::cloudflare-pages": 0.6,
  "phaser::nextjs": 0.6,
  "phaser::sveltekit": 0.65,
  "phaser::netlify": 0.7,
  "phaser::vercel": 0.65,
  "p5js::netlify": 0.8,
  "p5js::vercel": 0.7,
  "bevy::rust-lang": 1.0,
  "bevy::cargo": 0.95,
  "pygame::python-lang": 1.0,
  "pygame::click": 0.6,
  "love2d::lua-lang": 1.0,
  "godot::cpp-lang": 0.8,
  "godot::c-lang": 0.7,

  // New backends
  "hono::cloudflare-pages": 0.95,
  "hono::turso": 0.85,
  "hono::vercel": 0.7,
  "hono::drizzle": 0.8,
  "nestjs::postgresql": 0.85,
  "nestjs::prisma": 0.9,
  "nestjs::aws": 0.8,
  "nestjs::angular": 0.8,
  "nestjs::auth0": 0.8,
  "gin::go-lang": 1.0,
  "gin::postgresql": 0.8,
  "gin::aws": 0.8,
  "gin::redis": 0.8,
  "phoenix::elixir-lang": 1.0,
  "phoenix::postgresql": 0.9,
  "phoenix::fly-io": 0.85,
  "phoenix::redis": 0.7,
  "laravel::php-lang": 1.0,
  "laravel::mysql": 0.9,
  "laravel::postgresql": 0.8,
  "laravel::digitalocean": 0.8,
  "laravel::redis": 0.8,
  "laravel::render": 0.7,
  "flask::python-lang": 1.0,
  "flask::postgresql": 0.8,
  "flask::sqlite": 0.8,
  "flask::render": 0.7,
  "flask::railway": 0.7,

  // New databases
  "planetscale::prisma": 0.85,
  "planetscale::nextjs": 0.75,
  "planetscale::vercel": 0.8,
  "turso::sveltekit": 0.8,
  "turso::drizzle": 0.85,
  "turso::hono": 0.85,
  "firestore::flutter": 0.9,
  "firestore::react-native": 0.8,
  "firestore::firebase-auth": 1.0,

  // New hosting
  "netlify::astro": 0.9,
  "netlify::sveltekit": 0.8,
  "netlify::nuxt": 0.75,
  "cloudflare-pages::hono": 0.95,
  "cloudflare-pages::sveltekit": 0.8,
  "cloudflare-pages::turso": 0.85,
  "render::django": 0.8,
  "render::flask": 0.8,
  "render::laravel": 0.7,
  "render::postgresql": 0.7,

  // Go ecosystem
  "go-lang::gin": 1.0,

  // Dart/Flutter
  "dart-lang::flutter": 1.0,
  "dart-lang::firestore": 0.8,

  // Ruby
  "ruby-lang::rails": 1.0,
  "ruby-lang::activerecord": 1.0,
  "ruby-lang::postgresql": 0.8,
  "ruby-lang::redis": 0.8,
  "ruby-lang::render": 0.7,

  // PHP
  "php-lang::laravel": 1.0,
  "php-lang::mysql": 0.9,

  // Elixir
  "elixir-lang::phoenix": 1.0,
  "elixir-lang::postgresql": 0.8,

  // Lua
  "lua-lang::love2d": 1.0,

  // C
  "c-lang::godot": 0.6,

  // Convex ecosystem (user mentioned)
  "convex::sveltekit": 0.8,
  "convex::nuxt": 0.7,
  "convex::vue": 0.7,

  // Cross-ecosystem negatives for new techs
  "laravel::nextjs": -0.5,
  "laravel::nuxt": -0.5,
  "laravel::sveltekit": -0.5,
  "flask::nextjs": -0.3,
  "phoenix::nextjs": -0.4,
  "gin::nextjs": -0.3,
  "nestjs::django": -0.8,
  "nestjs::laravel": -0.8,
  "nestjs::flask": -0.7,

  // ORM mismatches — Prisma/Drizzle are Node.js only
  "laravel::prisma": -0.9,
  "laravel::drizzle": -0.9,
  "phoenix::prisma": -0.9,
  "phoenix::drizzle": -0.9,
  "gin::prisma": -0.8,
  "gin::drizzle": -0.8,
  "flask::prisma": -0.8,
  "flask::drizzle": -0.8,
  "actix::prisma": -0.8,
  "actix::drizzle": -0.8,
};

export function getCompatibility(techA: string, techB: string): number {
  if (techA === techB) return 0;
  const key = [techA, techB].sort().join("::");
  return COMPATIBILITY[key] ?? 0;
}
