# Graph Report - nightbeam-studio-website  (2026-08-06)

## Corpus Check
- 247 files · ~94,563 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1529 nodes · 3491 edges · 98 communities (66 shown, 32 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.68)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `91f6c303`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- retrieval.ts
- MemoryDataStore
- client.ts
- DataRepo
- auth-forms.tsx
- compilerOptions
- dependencies
- migration.sql
- types.ts
- getRepo
- requireUser
- guards.ts
- route.ts
- card.tsx
- cn
- data-repo.ts
- Deployment
- memory-store.ts
- page.tsx
- RedisCache
- section-forms.tsx
- devDependencies
- getServerEnv
- schemas.ts
- icons.tsx
- empty.ts
- scripts
- url-filters.ts
- repo-memory.ts
- deepseek.ts
- button.tsx
- actions.ts
- search-modal.tsx
- page.tsx
- permissions.ts
- auth.ts
- button.tsx
- ProjectSummary
- layout.tsx
- auth.config.ts
- email.ts
- page.tsx
- NightBeam Assistant (Chatbot)
- package.json
- allowScripts
- StoreProductDetail
- settings-form.tsx
- digest.ts
- AnnouncementDto
- next-auth.d.ts
- NightBeam Studio Website — Agent Guide
- section-forms.tsx
- ProjectOverrideDto
- EventType
- migration.sql
- patch-auth-callbacks.js
- opengraph-image.tsx
- Main Config
- eslint.config.mjs
- chatbot-kb-sync.ts
- next.config.ts
- prisma
- @tailwindcss/postcss
- tsx
- @types/react
- postcss.config.mjs
- migration.sql
- migration.sql
- migration.sql
- robots.ts
- installation.md
- README.md
- prisma.integration.test.ts
- { GET, POST }
- migration.sql
- vps-oauth-debug.sh
- vite-env.d.ts
- eslint-config-next
- tailwindcss
- @types/node
- typescript
- react
- @types/node
- @types/react
- @types/react-dom
- @vitejs/plugin-react

## God Nodes (most connected - your core abstractions)
1. `getRepo()` - 153 edges
2. `MemoryDataStore` - 87 edges
3. `getServerEnv()` - 79 edges
4. `DataRepo` - 79 edges
5. `requireUser()` - 57 edges
6. `requirePermission()` - 38 edges
7. `cn()` - 36 edges
8. `withErrorHandling()` - 33 edges
9. `PixelHeading()` - 23 edges
10. `ProjectSummary` - 20 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `getServerEnv()`  [EXTRACTED]
  prisma/seed.ts → src/lib/config/env.ts
- `chunkDoc()` --indirect_call--> `text()`  [INFERRED]
  src/lib/chatbot/retrieval.ts → tools/nightbeam-ops/src/mcp/server.ts
- `main()` --calls--> `getRepo()`  [EXTRACTED]
  scripts/chatbot-kb-sync.ts → src/lib/db/repo.ts
- `buildCatalogIndex()` --indirect_call--> `doc()`  [INFERRED]
  src/lib/chatbot/knowledge.ts → tests/unit/chatbot-retrieval.test.ts
- `chunkAll()` --indirect_call--> `doc()`  [INFERRED]
  src/lib/chatbot/retrieval.ts → tests/unit/chatbot-retrieval.test.ts

## Import Cycles
- None detected.

## Communities (98 total, 32 thin omitted)

### Community 0 - "retrieval.ts"
Cohesion: 0.07
Nodes (51): chatRequestSchema, jsonError(), apiKey(), DeepSeekChatOptions, deepSeekJson(), DeepSeekJsonOptions, DeepSeekMessage, streamDeepSeekChat() (+43 more)

### Community 1 - "MemoryDataStore"
Cohesion: 0.04
Nodes (7): cloneSeedProject(), defaultPrefs(), MemoryDataStore, uid(), AuditLogDto, LoginHistoryDto, NotificationType

### Community 2 - "client.ts"
Cohesion: 0.06
Nodes (55): collectDocs(), extractTitle(), main(), emailShell(), EmailShellInput, escapeHtml(), getTransporter(), MailInput (+47 more)

### Community 3 - "DataRepo"
Cohesion: 0.05
Nodes (4): DataRepo, AnnouncementDto, HomeSectionDto, UserDto

### Community 4 - "auth-forms.tsx"
Cohesion: 0.11
Nodes (10): metadata, LoginPage(), metadata, oauthErrorMessage(), metadata, metadata, metadata, metadata (+2 more)

### Community 5 - "compilerOptions"
Cohesion: 0.06
Nodes (33): esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, ./src/*, ./src/lib/stubs/empty.ts (+25 more)

### Community 6 - "dependencies"
Cohesion: 0.06
Nodes (33): @auth/prisma-adapter, bcryptjs, client-only, ioredis, motion, next, next-auth, node-cron (+25 more)

### Community 7 - "migration.sql"
Cohesion: 0.12
Nodes (32): "Account", "AnalyticsEvent", "Announcement", "ApiErrorLog", "AuditLog", "Category", "ChangelogEntry", "CustomProject" (+24 more)

### Community 8 - "types.ts"
Cohesion: 0.10
Nodes (18): resolveAdapter(), applyOverride(), mapDetail(), mapSummary(), mapVersion(), ProjectDetailRow, ProjectSummaryRow, getPrisma() (+10 more)

### Community 9 - "getRepo"
Cohesion: 0.10
Nodes (52): createTray(), createWindow(), __dirname, pollReminders(), registerIpc(), main(), server, buildSeedDatabase() (+44 more)

### Community 10 - "requireUser"
Cohesion: 0.05
Nodes (89): AdminProjectsPage(), eventSchema, POST(), compactSchema, POST(), DELETE(), identityFrom(), PATCH() (+81 more)

### Community 11 - "guards.ts"
Cohesion: 0.08
Nodes (40): BuiltByBitError, cache, extractList(), fetchJson(), getCreatorLicenses(), getCreatorResources(), getCreatorStores(), getCreatorVersions() (+32 more)

### Community 12 - "route.ts"
Cohesion: 0.15
Nodes (16): metadata, LoginForm(), RegisterForm(), ResetForm(), VerifyForm(), forgotPasswordAction(), loginAction(), randomToken() (+8 more)

### Community 13 - "card.tsx"
Cohesion: 0.05
Nodes (60): metadata, VALUES, AdminAnalyticsPage(), AdminAnnouncementsPage(), AdminErrorsPage(), AdminOverview(), AdminUsersPage(), metadata (+52 more)

### Community 14 - "cn"
Cohesion: 0.07
Nodes (49): electron, node, src/mcp, src/seed, src/store, addNote(), buildSeedDatabase(), completeTask() (+41 more)

### Community 15 - "data-repo.ts"
Cohesion: 0.10
Nodes (12): SessionUser, ApiErrorInput, AuditLogInput, UserPatch, MemoryUserRecord, memoryRepo, ApiErrorDto, NotificationDto (+4 more)

### Community 16 - "Deployment"
Cohesion: 0.09
Nodes (21): Backups, Deployment, Environment checklist, Google Search Console, Health checks, Prerequisites, Production on this VPS (`nightbeam.dev`), Quick start (+13 more)

### Community 17 - "memory-store.ts"
Cohesion: 0.12
Nodes (17): main(), prisma, memoryAdapter, SEED_ANNOUNCEMENTS, SEED_CATEGORIES, SEED_PROJECTS, SEED_SECTIONS, SEED_SOCIALS (+9 more)

### Community 18 - "page.tsx"
Cohesion: 0.24
Nodes (9): HomePage(), metadata, AnnouncementBar(), YouTubeEmbed(), ProjectCard(), StatCounter(), formatNumber(), cache (+1 more)

### Community 19 - "RedisCache"
Cohesion: 0.11
Nodes (11): credentialsProvider, { handlers, auth, signIn, signOut }, limiterCache, RateLimitResult, isSessionRevoked(), revocationCache, CacheStats, createCache() (+3 more)

### Community 20 - "section-forms.tsx"
Cohesion: 0.18
Nodes (16): AnnouncementForm(), SettingsForm(), ButtonProps, sizes, variants, Checkbox(), Input, Label() (+8 more)

### Community 21 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, devDependencies, eslint, @playwright/test, prisma, @tailwindcss/postcss, tsx, @types/node-cron (+11 more)

### Community 22 - "getServerEnv"
Cohesion: 0.10
Nodes (20): Can I use it in my own mod / modpack?, Community & Support, Compatibility, Configuration, Do I need to install Jauml as a player?, Does it hurt performance?, Does it replace Cloth Config / other config UIs?, Features (+12 more)

### Community 23 - "schemas.ts"
Cohesion: 0.14
Nodes (16): PasswordStrengthMeter(), adminUserSchema, announcementSchema, commentSchema, forgotPasswordSchema, LoginInput, loginSchema, notificationPrefsSchema (+8 more)

### Community 24 - "icons.tsx"
Cohesion: 0.19
Nodes (19): ArrowRightIcon(), base(), BellIcon(), CheckIcon(), ChevronDownIcon(), ChevronLeftIcon(), ChevronRightIcon(), CloseIcon() (+11 more)

### Community 25 - "empty.ts"
Cohesion: 0.33
Nodes (6): StoreCard(), StoreCta(), Badge(), BadgeTone, tones, formatPrice()

### Community 26 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, cf:sync, db:deploy, db:generate, db:migrate, db:seed, db:studio (+9 more)

### Community 27 - "url-filters.ts"
Cohesion: 0.10
Nodes (19): src/ui, src/vite-env.d.ts, vite/client, compilerOptions, isolatedModules, jsx, lib, module (+11 more)

### Community 29 - "deepseek.ts"
Cohesion: 0.80
Nodes (3): normalizeYouTubeVideoId(), selectHomepageVideoId(), YOUTUBE_HOSTS

### Community 30 - "button.tsx"
Cohesion: 0.11
Nodes (19): concurrently, electron, electron-builder, esbuild, devDependencies, concurrently, electron, electron-builder (+11 more)

### Community 31 - "actions.ts"
Cohesion: 0.12
Nodes (26): AdminSectionsPage(), AdminSyncPage(), DeleteAnnouncementButton(), ProjectOverrideForm(), HomepageVideoForm(), SectionForm(), SocialForm(), SyncPanel() (+18 more)

### Community 32 - "search-modal.tsx"
Cohesion: 0.09
Nodes (21): ChatPage(), metadata, Turnstile(), Window, ChatMarkdown(), inline(), renderBlock(), ChatMessage (+13 more)

### Community 33 - "page.tsx"
Cohesion: 0.24
Nodes (14): metadata, ProjectsPage(), FilterBar(), ProjectFilters, ProjectType, LEGACY_SINGLE, LOADERS, MULTI (+6 more)

### Community 34 - "permissions.ts"
Cohesion: 0.09
Nodes (24): AdminLayout(), LINKS, metadata, BuiltByBitIcon(), LoginOAuthButtons(), OAuthButtons(), PROVIDERS, authConfig (+16 more)

### Community 35 - "auth.ts"
Cohesion: 0.12
Nodes (15): electron/**/*.ts, compilerOptions, declaration, esModuleInterop, lib, module, moduleResolution, outDir (+7 more)

### Community 38 - "layout.tsx"
Cohesion: 0.19
Nodes (11): LINKS, Navbar(), NavUser, SearchModal(), SearchResult, UserMenu(), applyTheme(), ThemeToggle() (+3 more)

### Community 39 - "auth.config.ts"
Cohesion: 0.17
Nodes (11): @modelcontextprotocol/sdk, dependencies, @modelcontextprotocol/sdk, zod, description, zod, main, name (+3 more)

### Community 40 - "email.ts"
Cohesion: 0.17
Nodes (11): dir, dist/**/*, dist-electron/**/*, build, appId, directories, files, productName (+3 more)

### Community 41 - "page.tsx"
Cohesion: 0.14
Nodes (17): DashboardLayout(), LINKS, metadata, buildHref(), metadata, parseStoreFilters(), StorePage(), ProjectActions() (+9 more)

### Community 42 - "NightBeam Assistant (Chatbot)"
Cohesion: 0.25
Nodes (7): Environment variables, How it works, Knowledge base, NightBeam Assistant (Chatbot), Operations, Security model (jailbreak defense), UI

### Community 43 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, prisma, seed, private, version

### Community 44 - "allowScripts"
Cohesion: 0.29
Nodes (7): allowScripts, esbuild@0.28.1, prisma@6.19.3, @prisma/client@6.19.3, @prisma/engines@6.19.3, sharp@0.34.5, unrs-resolver@1.12.2

### Community 45 - "StoreProductDetail"
Cohesion: 0.10
Nodes (12): CategoryDto, ChatMessageDto, CommunityStatsDto, FileType, ProjectCommentDto, ProjectFileDto, SocialPlatform, StoreFilters (+4 more)

### Community 46 - "settings-form.tsx"
Cohesion: 0.18
Nodes (11): scripts, build, build:electron, build:ui, dev, dev:app, dist, mcp (+3 more)

### Community 48 - "AnnouncementDto"
Cohesion: 0.36
Nodes (7): api(), App(), hoursFromNow(), Snapshot, statusPill(), Tab, tomorrowNine()

### Community 49 - "next-auth.d.ts"
Cohesion: 0.33
Nodes (5): JWT, next-auth, next-auth/jwt, Session, User

### Community 50 - "NightBeam Studio Website — Agent Guide"
Cohesion: 0.40
Nodes (4): Conventions, Data & auth, NightBeam Studio Website — Agent Guide, Quality gates (run before committing)

### Community 51 - "section-forms.tsx"
Cohesion: 0.25
Nodes (7): Cursor MCP, Desktop, Env, Features, NightBeam Ops, Scripts, Setup

### Community 55 - "migration.sql"
Cohesion: 0.67
Nodes (3): "ChatbotKnowledgeDoc", "ChatMessage", "User"

### Community 56 - "patch-auth-callbacks.js"
Cohesion: 0.40
Nodes (4): end, fs, s, start

### Community 60 - "chatbot-kb-sync.ts"
Cohesion: 0.40
Nodes (4): Data, Desktop, NightBeam Ops, Typical flows

### Community 61 - "next.config.ts"
Cohesion: 0.50
Nodes (3): contentSecurityPolicy, nextConfig, securityHeaders

### Community 62 - "prisma"
Cohesion: 0.40
Nodes (3): electron, root, vite

### Community 63 - "@tailwindcss/postcss"
Cohesion: 0.50
Nodes (3): nightbeam-ops, NIGHTBEAM_OPS_DATA, npx

## Knowledge Gaps
- **393 isolated node(s):** `npx`, `NIGHTBEAM_OPS_DATA`, `eslintConfig`, `contentSecurityPolicy`, `securityHeaders` (+388 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `text()` connect `retrieval.ts` to `getRepo`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Why does `getRepo()` connect `requireUser` to `retrieval.ts`, `page.tsx`, `client.ts`, `layout.tsx`, `types.ts`, `page.tsx`, `guards.ts`, `route.ts`, `card.tsx`, `page.tsx`, `RedisCache`, `section-forms.tsx`, `actions.ts`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **What connects `npx`, `NIGHTBEAM_OPS_DATA`, `eslintConfig` to the rest of the system?**
  _393 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `retrieval.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06912442396313365 - nodes in this community are weakly interconnected._
- **Should `MemoryDataStore` be split into smaller, more focused modules?**
  _Cohesion score 0.04283447911158118 - nodes in this community are weakly interconnected._
- **Should `client.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05995975855130785 - nodes in this community are weakly interconnected._
- **Should `DataRepo` be split into smaller, more focused modules?**
  _Cohesion score 0.04846938775510204 - nodes in this community are weakly interconnected._