# Graph Report - nightbeam-studio-website  (2026-08-05)

## Corpus Check
- 223 files · ~84,182 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1241 nodes · 3007 edges · 87 communities (63 shown, 24 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.69)
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
- installation.md
- README.md
- prisma.integration.test.ts
- { GET, POST }
- migration.sql
- vps-oauth-debug.sh

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
10. `jsonError()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `getServerEnv()`  [EXTRACTED]
  prisma/seed.ts → src/lib/config/env.ts
- `main()` --calls--> `getServerEnv()`  [EXTRACTED]
  scripts/chatbot-kb-sync.ts → src/lib/config/env.ts
- `main()` --calls--> `getRepo()`  [EXTRACTED]
  scripts/chatbot-kb-sync.ts → src/lib/db/repo.ts
- `buildCatalogIndex()` --indirect_call--> `doc()`  [INFERRED]
  src/lib/chatbot/knowledge.ts → tests/unit/chatbot-retrieval.test.ts
- `chunkAll()` --indirect_call--> `doc()`  [INFERRED]
  src/lib/chatbot/retrieval.ts → tests/unit/chatbot-retrieval.test.ts

## Import Cycles
- None detected.

## Communities (87 total, 24 thin omitted)

### Community 0 - "retrieval.ts"
Cohesion: 0.06
Nodes (58): chatRequestSchema, jsonError(), apiKey(), DeepSeekChatOptions, deepSeekJson(), DeepSeekJsonOptions, DeepSeekMessage, streamDeepSeekChat() (+50 more)

### Community 1 - "MemoryDataStore"
Cohesion: 0.04
Nodes (7): cloneSeedProject(), defaultPrefs(), MemoryDataStore, uid(), AuditLogDto, LoginHistoryDto, NotificationType

### Community 2 - "client.ts"
Cohesion: 0.09
Nodes (33): cache, CurseForgeError, fetchJson(), getAuthorMods(), getModDetails(), getModFiles(), getModStats(), isCurseForgeConfigured() (+25 more)

### Community 3 - "DataRepo"
Cohesion: 0.06
Nodes (3): DataRepo, SocialLinkDto, UserDto

### Community 4 - "auth-forms.tsx"
Cohesion: 0.19
Nodes (5): metadata, VALUES, metadata, metadata, PixelHeading()

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
Cohesion: 0.11
Nodes (15): applyOverride(), mapDetail(), mapSummary(), mapVersion(), ProjectDetailRow, ProjectSummaryRow, DEFAULT_PREFS, mapStoreDetail() (+7 more)

### Community 9 - "getRepo"
Cohesion: 0.21
Nodes (9): AdminAnalyticsPage(), AdminAnnouncementsPage(), AdminOverview(), BarChart(), Notification, NotificationCenter(), Comment, CommentsSection() (+1 more)

### Community 10 - "requireUser"
Cohesion: 0.07
Nodes (67): AdminProjectsPage(), eventSchema, POST(), compactSchema, POST(), DELETE(), identityFrom(), PATCH() (+59 more)

### Community 11 - "guards.ts"
Cohesion: 0.08
Nodes (39): BuiltByBitError, cache, extractList(), fetchJson(), getCreatorLicenses(), getCreatorResources(), getCreatorStores(), getCreatorVersions() (+31 more)

### Community 12 - "route.ts"
Cohesion: 0.10
Nodes (18): metadata, metadata, metadata, metadata, ForgotForm(), LoginForm(), RegisterForm(), ResetForm() (+10 more)

### Community 13 - "card.tsx"
Cohesion: 0.28
Nodes (9): DocsPage(), FAQ, metadata, Card(), CardBody(), CardHeader(), CardTitle(), inline() (+1 more)

### Community 14 - "cn"
Cohesion: 0.25
Nodes (9): DashboardLayout(), LINKS, generateMetadata(), DownloadButton(), ProjectActions(), TabItem, Tabs(), ClassValue (+1 more)

### Community 15 - "data-repo.ts"
Cohesion: 0.07
Nodes (22): SessionUser, ApiErrorInput, AuditLogInput, UserPatch, MemoryUserRecord, memoryRepo, ApiErrorDto, CategoryDto (+14 more)

### Community 16 - "Deployment"
Cohesion: 0.09
Nodes (21): Backups, Deployment, Environment checklist, Google Search Console, Health checks, Prerequisites, Production on this VPS (`nightbeam.dev`), Quick start (+13 more)

### Community 17 - "memory-store.ts"
Cohesion: 0.14
Nodes (15): main(), prisma, SEED_ANNOUNCEMENTS, SEED_CATEGORIES, SEED_PROJECTS, SEED_SECTIONS, SEED_SOCIALS, SEED_TAGS (+7 more)

### Community 18 - "page.tsx"
Cohesion: 0.29
Nodes (6): HomePage(), metadata, AnnouncementBar(), YouTubeEmbed(), cache, getLatestVideoId()

### Community 19 - "RedisCache"
Cohesion: 0.07
Nodes (10): limiterCache, RateLimitResult, CacheAdapter, CacheStats, createCache(), getCacheStats(), instances, MemoryCache (+2 more)

### Community 20 - "section-forms.tsx"
Cohesion: 0.27
Nodes (10): AnnouncementForm(), DeleteAnnouncementButton(), ProjectOverrideForm(), Checkbox(), Input, Label(), Select, Textarea (+2 more)

### Community 21 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @types/node, @types/node-cron (+11 more)

### Community 22 - "getServerEnv"
Cohesion: 0.21
Nodes (14): POST(), POST(), CommunityPage(), trackEvent(), isProduction(), TurnstileResponse, verifyTurnstile(), getServerEnv() (+6 more)

### Community 23 - "schemas.ts"
Cohesion: 0.13
Nodes (20): PasswordStrengthMeter(), SettingsForm(), adminUserSchema, announcementSchema, commentSchema, forgotPasswordSchema, LoginInput, loginSchema (+12 more)

### Community 24 - "icons.tsx"
Cohesion: 0.06
Nodes (48): metadata, ProjectsPage(), ArrowRightIcon(), base(), BellIcon(), CheckIcon(), ChevronDownIcon(), ChevronLeftIcon() (+40 more)

### Community 25 - "empty.ts"
Cohesion: 0.20
Nodes (14): ProjectPage(), generateMetadata(), StoreProductPage(), ProjectCard(), StoreCard(), StoreCta(), Badge(), BadgeTone (+6 more)

### Community 26 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, cf:sync, db:deploy, db:generate, db:migrate, db:seed, db:studio (+9 more)

### Community 29 - "deepseek.ts"
Cohesion: 0.80
Nodes (3): normalizeYouTubeVideoId(), selectHomepageVideoId(), YOUTUBE_HOSTS

### Community 31 - "actions.ts"
Cohesion: 0.16
Nodes (19): AdminErrorsPage(), AdminSyncPage(), AdminUsersPage(), SyncPanel(), ConfirmKind, ROLES, UserRowActions(), clearApiErrorsAction() (+11 more)

### Community 32 - "search-modal.tsx"
Cohesion: 0.11
Nodes (18): ChatPage(), metadata, Turnstile(), Window, ChatMarkdown(), inline(), renderBlock(), ChatMessage (+10 more)

### Community 33 - "page.tsx"
Cohesion: 0.17
Nodes (12): LoginPage(), metadata, oauthErrorMessage(), metadata, SettingsPage(), BuiltByBitIcon(), LoginOAuthButtons(), OAuthButtons() (+4 more)

### Community 34 - "permissions.ts"
Cohesion: 0.26
Nodes (8): AdminLayout(), LINKS, hasPermission(), MATRIX, Permission, PERMISSIONS, permissionsFor(), ROLE_LABELS

### Community 35 - "auth.ts"
Cohesion: 0.22
Nodes (9): credentialsProvider, { handlers, auth, signIn, signOut }, resolveAdapter(), memoryAdapter, isSessionRevoked(), revocationCache, memoryStore, getPrisma() (+1 more)

### Community 36 - "button.tsx"
Cohesion: 0.19
Nodes (8): FREE_BENEFITS, metadata, PRO_BENEFITS, MembershipActions(), Button, ButtonProps, sizes, variants

### Community 38 - "layout.tsx"
Cohesion: 0.23
Nodes (8): metadata, minecraft, viewport, CookieConsent(), getConsent(), Footer(), Navbar(), Providers()

### Community 39 - "auth.config.ts"
Cohesion: 0.24
Nodes (9): authConfig, asHeaders(), builtByBitFetch(), BuiltByBitProfile, BuiltByBitProvider(), normalizeBuiltByBitResponse(), unwrapMemberProfile(), { auth } (+1 more)

### Community 40 - "email.ts"
Cohesion: 0.33
Nodes (10): emailShell(), EmailShellInput, escapeHtml(), getTransporter(), MailInput, sendDigestEmail(), sendMail(), sendPasswordResetEmail() (+2 more)

### Community 41 - "page.tsx"
Cohesion: 0.25
Nodes (9): buildHref(), metadata, parseStoreFilters(), StorePage(), CATEGORIES, SORTS, StoreFilterBar(), Pagination() (+1 more)

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
Cohesion: 0.22
Nodes (4): StoreFilters, StoreListResult, StoreProductDetail, StoreProductSummary

### Community 46 - "settings-form.tsx"
Cohesion: 0.49
Nodes (5): POST(), isProStatus(), applySubscriptionByCustomerId(), applySubscriptionToUser(), mapSubscriptionToPro()

### Community 47 - "digest.ts"
Cohesion: 0.31
Nodes (6): buildDigest(), DigestItem, runDigestJob(), guard(), main(), now

### Community 49 - "next-auth.d.ts"
Cohesion: 0.33
Nodes (5): JWT, next-auth, next-auth/jwt, Session, User

### Community 50 - "NightBeam Studio Website — Agent Guide"
Cohesion: 0.40
Nodes (4): Conventions, Data & auth, NightBeam Studio Website — Agent Guide, Quality gates (run before committing)

### Community 51 - "section-forms.tsx"
Cohesion: 0.39
Nodes (7): AdminSectionsPage(), HomepageVideoForm(), SectionForm(), SocialForm(), saveHomepageVideoAction(), upsertSectionAction(), upsertSocialAction()

### Community 55 - "migration.sql"
Cohesion: 0.67
Nodes (3): "ChatbotKnowledgeDoc", "ChatMessage", "User"

### Community 56 - "patch-auth-callbacks.js"
Cohesion: 0.40
Nodes (4): end, fs, s, start

### Community 60 - "chatbot-kb-sync.ts"
Cohesion: 0.83
Nodes (3): collectDocs(), extractTitle(), main()

### Community 61 - "next.config.ts"
Cohesion: 0.50
Nodes (3): contentSecurityPolicy, nextConfig, securityHeaders

## Knowledge Gaps
- **270 isolated node(s):** `eslintConfig`, `contentSecurityPolicy`, `securityHeaders`, `nextConfig`, `name` (+265 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getRepo()` connect `requireUser` to `retrieval.ts`, `client.ts`, `getRepo`, `guards.ts`, `route.ts`, `card.tsx`, `cn`, `page.tsx`, `section-forms.tsx`, `getServerEnv`, `schemas.ts`, `icons.tsx`, `empty.ts`, `actions.ts`, `page.tsx`, `auth.ts`, `button.tsx`, `layout.tsx`, `page.tsx`, `settings-form.tsx`, `digest.ts`, `section-forms.tsx`, `chatbot-kb-sync.ts`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Why does `getServerEnv()` connect `getServerEnv` to `retrieval.ts`, `page.tsx`, `client.ts`, `MemoryDataStore`, `layout.tsx`, `email.ts`, `requireUser`, `guards.ts`, `route.ts`, `settings-form.tsx`, `digest.ts`, `memory-store.ts`, `page.tsx`, `schemas.ts`, `chatbot-kb-sync.ts`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `DataRepo` connect `DataRepo` to `MemoryDataStore`, `ProjectSummary`, `types.ts`, `requireUser`, `StoreProductDetail`, `data-repo.ts`, `AnnouncementDto`, `memory-store.ts`, `ProjectOverrideDto`, `EventType`, `url-filters.ts`, `repo-memory.ts`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `contentSecurityPolicy`, `securityHeaders` to the rest of the system?**
  _270 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `retrieval.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.060362173038229376 - nodes in this community are weakly interconnected._
- **Should `MemoryDataStore` be split into smaller, more focused modules?**
  _Cohesion score 0.04283447911158118 - nodes in this community are weakly interconnected._
- **Should `client.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09291521486643438 - nodes in this community are weakly interconnected._