# Graph Report - nightbeam-studio-website  (2026-08-04)

## Corpus Check
- 203 files · ~69,737 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1123 nodes · 2686 edges · 72 communities (53 shown, 19 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.69)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c139963a`
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
- permissions.ts
- ProjectSummary
- NightBeam Assistant (Chatbot)
- package.json
- allowScripts
- settings-form.tsx
- AnnouncementDto
- next-auth.d.ts
- NightBeam Studio Website — Agent Guide
- ProjectOverrideDto
- migration.sql
- opengraph-image.tsx
- Main Config
- eslint.config.mjs
- next.config.ts
- prisma
- @tailwindcss/postcss
- tsx
- @types/react
- postcss.config.mjs
- migration.sql
- migration.sql
- migration.sql
- installation.md
- README.md
- prisma.integration.test.ts
- { GET, POST }

## God Nodes (most connected - your core abstractions)
1. `getRepo()` - 141 edges
2. `MemoryDataStore` - 80 edges
3. `getServerEnv()` - 73 edges
4. `DataRepo` - 73 edges
5. `requireUser()` - 52 edges
6. `requirePermission()` - 38 edges
7. `withErrorHandling()` - 33 edges
8. `cn()` - 30 edges
9. `PixelHeading()` - 22 edges
10. `jsonError()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `getServerEnv()`  [EXTRACTED]
  prisma/seed.ts → src/lib/config/env.ts
- `main()` --calls--> `getRepo()`  [EXTRACTED]
  scripts/chatbot-kb-sync.ts → src/lib/db/repo.ts
- `buildCatalogIndex()` --indirect_call--> `doc()`  [INFERRED]
  src/lib/chatbot/knowledge.ts → tests/unit/chatbot-retrieval.test.ts
- `chunkAll()` --indirect_call--> `doc()`  [INFERRED]
  src/lib/chatbot/retrieval.ts → tests/unit/chatbot-retrieval.test.ts
- `main()` --calls--> `getServerEnv()`  [EXTRACTED]
  scripts/chatbot-kb-sync.ts → src/lib/config/env.ts

## Import Cycles
- None detected.

## Communities (72 total, 19 thin omitted)

### Community 0 - "retrieval.ts"
Cohesion: 0.06
Nodes (58): chatRequestSchema, jsonError(), apiKey(), DeepSeekChatOptions, deepSeekJson(), DeepSeekJsonOptions, DeepSeekMessage, streamDeepSeekChat() (+50 more)

### Community 1 - "MemoryDataStore"
Cohesion: 0.05
Nodes (7): cloneSeedProject(), defaultPrefs(), MemoryDataStore, uid(), AuditLogDto, LoginHistoryDto, NotificationType

### Community 2 - "client.ts"
Cohesion: 0.09
Nodes (33): cache, CurseForgeError, fetchJson(), getAuthorMods(), getModDetails(), getModFiles(), getModStats(), isCurseForgeConfigured() (+25 more)

### Community 3 - "DataRepo"
Cohesion: 0.06
Nodes (4): DataRepo, ProfileDto, SocialLinkDto, UserDto

### Community 4 - "auth-forms.tsx"
Cohesion: 0.13
Nodes (7): metadata, metadata, metadata, metadata, metadata, LoginForm(), PixelHeading()

### Community 5 - "compilerOptions"
Cohesion: 0.06
Nodes (33): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+25 more)

### Community 6 - "dependencies"
Cohesion: 0.06
Nodes (33): @auth/prisma-adapter, bcryptjs, client-only, ioredis, motion, next, next-auth, node-cron (+25 more)

### Community 7 - "migration.sql"
Cohesion: 0.12
Nodes (32): "Account", "AnalyticsEvent", "Announcement", "ApiErrorLog", "AuditLog", "Category", "ChangelogEntry", "CustomProject" (+24 more)

### Community 8 - "types.ts"
Cohesion: 0.09
Nodes (19): credentialsProvider, { handlers, auth, signIn, signOut }, resolveAdapter(), memoryAdapter, applyOverride(), mapDetail(), mapSummary(), mapVersion() (+11 more)

### Community 9 - "getRepo"
Cohesion: 0.19
Nodes (10): AdminAnalyticsPage(), AdminAnnouncementsPage(), AdminOverview(), AdminUsersPage(), BarChart(), Notification, NotificationCenter(), CommentsSection() (+2 more)

### Community 10 - "requireUser"
Cohesion: 0.05
Nodes (88): AdminErrorsPage(), AdminProjectsPage(), AdminSectionsPage(), AdminSyncPage(), eventSchema, POST(), compactSchema, POST() (+80 more)

### Community 11 - "guards.ts"
Cohesion: 0.16
Nodes (8): metadata, MarkAllReadButton(), SearchResult, Screenshot, ScreenshotGallery(), Dialog(), EmptyState(), Skeleton()

### Community 12 - "route.ts"
Cohesion: 0.16
Nodes (9): metadata, metadata, ForgotForm(), RegisterForm(), ResetForm(), VerifyForm(), resetPasswordAction(), verifyEmailAction() (+1 more)

### Community 13 - "card.tsx"
Cohesion: 0.18
Nodes (12): metadata, VALUES, DocsPage(), FAQ, metadata, UserRowActions(), Card(), CardBody() (+4 more)

### Community 14 - "cn"
Cohesion: 0.27
Nodes (8): DashboardLayout(), LINKS, PasswordStrengthMeter(), TabItem, Tabs(), passwordStrength, ClassValue, cn()

### Community 15 - "data-repo.ts"
Cohesion: 0.08
Nodes (20): trackEvent(), SessionUser, ApiErrorInput, AuditLogInput, UserPatch, MemoryUserRecord, AnalyticsRow, CategoryDto (+12 more)

### Community 16 - "Deployment"
Cohesion: 0.09
Nodes (21): Backups, Deployment, Environment checklist, Google Search Console, Health checks, Prerequisites, Production on this VPS (`nightbeam.dev`), Quick start (+13 more)

### Community 17 - "memory-store.ts"
Cohesion: 0.17
Nodes (14): main(), prisma, SEED_ANNOUNCEMENTS, SEED_CATEGORIES, SEED_PROJECTS, SEED_SECTIONS, SEED_SOCIALS, SEED_TAGS (+6 more)

### Community 18 - "page.tsx"
Cohesion: 0.24
Nodes (9): HomePage(), metadata, AnnouncementBar(), YouTubeEmbed(), ProjectCard(), StatCounter(), formatNumber(), cache (+1 more)

### Community 19 - "RedisCache"
Cohesion: 0.07
Nodes (10): isSessionRevoked(), revocationCache, CacheAdapter, CacheStats, createCache(), getCacheStats(), instances, MemoryCache (+2 more)

### Community 20 - "section-forms.tsx"
Cohesion: 0.23
Nodes (11): Comment, Button, ButtonProps, sizes, variants, Checkbox(), Input, Label() (+3 more)

### Community 21 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @types/node, @types/node-cron (+11 more)

### Community 22 - "getServerEnv"
Cohesion: 0.06
Nodes (50): collectDocs(), extractTitle(), main(), POST(), POST(), POST(), CommunityPage(), FREE_BENEFITS (+42 more)

### Community 23 - "schemas.ts"
Cohesion: 0.18
Nodes (12): adminUserSchema, announcementSchema, commentSchema, forgotPasswordSchema, LoginInput, loginSchema, passwordSchema, projectOverrideSchema (+4 more)

### Community 24 - "icons.tsx"
Cohesion: 0.08
Nodes (43): metadata, ProjectsPage(), ArrowRightIcon(), base(), BellIcon(), CheckIcon(), ChevronDownIcon(), ChevronLeftIcon() (+35 more)

### Community 25 - "empty.ts"
Cohesion: 0.24
Nodes (8): generateMetadata(), ProjectPage(), DownloadButton(), ProjectActions(), Badge(), BadgeTone, tones, formatBytes()

### Community 26 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, cf:sync, db:deploy, db:generate, db:migrate, db:seed, db:studio (+9 more)

### Community 28 - "repo-memory.ts"
Cohesion: 0.15
Nodes (4): memoryRepo, ApiErrorDto, NotificationDto, SyncStateDto

### Community 29 - "deepseek.ts"
Cohesion: 0.80
Nodes (3): normalizeYouTubeVideoId(), selectHomepageVideoId(), YOUTUBE_HOSTS

### Community 31 - "actions.ts"
Cohesion: 0.38
Nodes (9): forgotPasswordAction(), loginAction(), randomToken(), registerAction(), checkRateLimit(), limiterCache, RateLimitResult, resetRateLimit() (+1 more)

### Community 32 - "search-modal.tsx"
Cohesion: 0.10
Nodes (21): ChatPage(), metadata, Turnstile(), Window, ChatMarkdown(), inline(), renderBlock(), ChatMessage (+13 more)

### Community 34 - "permissions.ts"
Cohesion: 0.18
Nodes (11): AdminLayout(), LINKS, authConfig, hasPermission(), MATRIX, Permission, PERMISSIONS, permissionsFor() (+3 more)

### Community 37 - "ProjectSummary"
Cohesion: 0.17
Nodes (3): toProjectSummary(), ProjectListResult, ProjectSummary

### Community 42 - "NightBeam Assistant (Chatbot)"
Cohesion: 0.25
Nodes (7): Environment variables, How it works, Knowledge base, NightBeam Assistant (Chatbot), Operations, Security model (jailbreak defense), UI

### Community 43 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, prisma, seed, private, version

### Community 44 - "allowScripts"
Cohesion: 0.29
Nodes (7): allowScripts, esbuild@0.28.1, prisma@6.19.3, @prisma/client@6.19.3, @prisma/engines@6.19.3, sharp@0.34.5, unrs-resolver@1.12.2

### Community 46 - "settings-form.tsx"
Cohesion: 0.46
Nodes (6): SettingsForm(), notificationPrefsSchema, profileSchema, deleteAccountAction(), updatePrefsAction(), updateProfileAction()

### Community 49 - "next-auth.d.ts"
Cohesion: 0.33
Nodes (5): JWT, next-auth, next-auth/jwt, Session, User

### Community 50 - "NightBeam Studio Website — Agent Guide"
Cohesion: 0.40
Nodes (4): Conventions, Data & auth, NightBeam Studio Website — Agent Guide, Quality gates (run before committing)

### Community 55 - "migration.sql"
Cohesion: 0.67
Nodes (3): "ChatbotKnowledgeDoc", "ChatMessage", "User"

### Community 61 - "next.config.ts"
Cohesion: 0.50
Nodes (3): contentSecurityPolicy, nextConfig, securityHeaders

## Knowledge Gaps
- **249 isolated node(s):** `eslintConfig`, `contentSecurityPolicy`, `securityHeaders`, `nextConfig`, `name` (+244 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getRepo()` connect `requireUser` to `retrieval.ts`, `client.ts`, `types.ts`, `getRepo`, `guards.ts`, `route.ts`, `card.tsx`, `settings-form.tsx`, `data-repo.ts`, `page.tsx`, `getServerEnv`, `icons.tsx`, `empty.ts`, `actions.ts`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Why does `DataRepo` connect `DataRepo` to `MemoryDataStore`, `ProjectSummary`, `types.ts`, `requireUser`, `data-repo.ts`, `AnnouncementDto`, `ProjectOverrideDto`, `url-filters.ts`, `repo-memory.ts`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Why does `getServerEnv()` connect `getServerEnv` to `retrieval.ts`, `MemoryDataStore`, `client.ts`, `requireUser`, `data-repo.ts`, `memory-store.ts`, `page.tsx`, `actions.ts`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `contentSecurityPolicy`, `securityHeaders` to the rest of the system?**
  _249 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `retrieval.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.060362173038229376 - nodes in this community are weakly interconnected._
- **Should `MemoryDataStore` be split into smaller, more focused modules?**
  _Cohesion score 0.04558737580362361 - nodes in this community are weakly interconnected._
- **Should `client.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09291521486643438 - nodes in this community are weakly interconnected._