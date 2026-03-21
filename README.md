# Stack Architect

**The right stack for your project.** A deterministic tech stack recommendation engine that actually listens to what you're building.

Describe your project, set your constraints, and get a scored, ranked blueprint — not the same MERN stack everyone else gets.

---

## What it does

Stack Architect analyzes your project description using NLP signal detection, scores 93 technologies across 8 dimensions, and recommends the best stack using a **deterministic algorithm** — not an LLM guessing. AI only steps in at the end to explain *why* the algorithm chose what it chose.

Say "a retro pixel-art game" → you get **Phaser + Flask**. Say "REST API in Go" → you get **Gin + PostgreSQL**. Say "real-time chat with Phoenix" → you get **Phoenix + Elixir + Redis**. Not Next.js + Express for everything.

## How it works

1. **NLP Signal Extraction** — Detects 16 signal categories from your description: gaming, 3D, real-time, e-commerce, auth, creative coding, and more. Also detects explicit language and framework mentions ("using svelte", "a rust project").

2. **8-Dimension Scoring** — Every technology is rated on: Performance at Scale, Learning Curve, Ecosystem Maturity, Time to MVP, Cost Efficiency, Type Safety, Community Size, and Hiring Ease.

3. **Dynamic Weight Calculator** — Your inputs (scale, timeline, budget, priorities, expertise) shift dimension weights via multiplier tables. An enterprise app with a tight deadline gets very different weights than a hobby hackathon project.

4. **Language Ecosystem Awareness** — Say "rust" and the engine gives a 2x boost to all Rust-ecosystem techs and a 0.25x penalty to competing backends. Select Go as your expertise and Gin crushes Express.

5. **Compatibility Matrix** — 200+ pairwise scores ensure the recommended techs actually work well together. Laravel won't get paired with Prisma. Phoenix won't get Drizzle.

6. **Smart ORM Filtering** — Backends with built-in ORMs (Laravel/Eloquent, Django, Rails) skip external ORM selection. Non-Node backends never get Node-only ORMs.

7. **Alternative Generation** — Returns the primary recommendation plus 3 alternatives by re-running the solver with the lead tech excluded, so you see real options.

8. **AI Narration** — After the algorithm selects the stack (~5ms), Claude streams architectural reasoning that references your actual project — not generic advice.

## Tech coverage

**93 technologies** across 12 categories:

- **Languages**: Python, Rust, Go, Java, C#, TypeScript, C++, C, Swift, Kotlin, Lua, PHP, Elixir, Ruby, Dart
- **Frontend**: Next.js, Nuxt, SvelteKit, Remix, Astro, Angular, Vue.js, SolidJS, Three.js, Phaser, p5.js
- **Backend**: Express, Fastify, Django, Rails, Spring Boot, FastAPI, Go Fiber, Actix Web, Convex, Hono, NestJS, Gin, Phoenix, Laravel, Flask
- **Gaming/Creative**: Phaser, Three.js, p5.js, Bevy, Pygame, Love2D, Godot
- **Mobile**: SwiftUI, UIKit, Jetpack Compose, React Native, Flutter, Kotlin Multiplatform, Expo
- **Desktop**: Tauri, Electron, .NET MAUI, Qt, SwiftUI macOS
- **Databases**: PostgreSQL, MySQL, MongoDB, SQLite, Supabase, DynamoDB, Realm, Core Data, PlanetScale, Turso, Firestore
- **Hosting**: Vercel, AWS, Railway, Fly.io, DigitalOcean, Netlify, Cloudflare Pages, Render
- **And more**: Redis, Prisma, Drizzle, SQLAlchemy, NextAuth, Clerk, Auth0, Firebase Auth, Sanity, Strapi

## Getting started

```bash
git clone https://github.com/yourusername/stack-architect.git
cd stack-architect
npm install
```

Create a `.env.local` file:

```
ANTHROPIC_API_KEY=your_api_key_here
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech stack

Built with Next.js 16, TypeScript, Tailwind CSS v4, and the Anthropic SDK. The scoring engine is pure TypeScript with zero external dependencies — the only API call is for the narration stream.

## Design

Dark obsidian theme with Cormorant Garamond serif headings, Inter body text, JetBrains Mono for scores and code, and a bronze accent palette.
