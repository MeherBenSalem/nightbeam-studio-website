# Graph Report - nightbeam-studio-website  (2026-08-04)

## Corpus Check
- 202 files · ~69,131 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1116 nodes · 2672 edges · 85 communities (62 shown, 23 thin omitted)
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
- env.ts
- permissions.ts
- email.ts
- repo.ts
- ProjectSummary
- digest.ts
- auth.ts
- client.ts
- MemoryCacheAdapter
- NightBeam Assistant (Chatbot)
- package.json
- allowScripts
- route.ts
- settings-form.tsx
- navbar.tsx
- AnnouncementDto
- next-auth.d.ts
- NightBeam Studio Website — Agent Guide
- route.ts
- ProjectOverrideDto
- SyncStateDto
- migration.sql
- NotificationPreferenceDto
- opengraph-image.tsx
- Main Config
- eslint.config.mjs
- eslint-config-next
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
1. `getRepo()` - 139 edges
2. `MemoryDataStore` - 80 edges
3. `DataRepo` - 73 edges
4. `getServerEnv()` - 71 edges
5. `requireUser()` - 52 edges
6. `requirePermission()` - 38 edges
7. `withErrorHandling()` - 33 edges
8. `cn()` - 30 edges
9. `PixelHeading()` - 22 edges
10. `jsonError()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `getServerEnv()`  [EXTRACTED]
  prisma/seed.ts → src/lib/config/env.ts
- `buildCatalogIndex()` --indirect_call--> `doc()`  [INFERRED]
  src/lib/chatbot/knowledge.ts → tests/unit/chatbot-retrieval.test.ts
- `main()` --calls--> `getRepo()`  [EXTRACTED]
  scripts/chatbot-kb-sync.ts → src/lib/db/repo.ts
- `chunkAll()` --indirect_call--> `doc()`  [INFERRED]
  src/lib/chatbot/retrieval.ts → tests/unit/chatbot-retrieval.test.ts
- `main()` --calls--> `getServerEnv()`  [EXTRACTED]
  scripts/chatbot-kb-sync.ts → src/lib/config/env.ts

## Import Cycles
- None detected.

## Communities (85 total, 23 thin omitted)

### Community 0 - "retrieval.ts"
Cohesion: 0.06
Nodes (45): ChatPage(), metadata, Turnstile(), Window, ChatMarkdown(), inline(), renderBlock(), ChatMessage (+37 more)

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
Cohesion: 0.08
Nodes (16): metadata, VALUES, metadata, metadata, metadata, metadata, metadata, metadata (+8 more)

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
Nodes (20): applyOverride(), mapDetail(), mapSummary(), mapVersion(), ProjectDetailRow, ProjectSummaryRow, DEFAULT_PREFS, prismaRepo (+12 more)

### Community 9 - "getRepo"
Cohesion: 0.16
Nodes (25): AdminAnalyticsPage(), AdminAnnouncementsPage(), AdminErrorsPage(), AdminOverview(), AdminProjectsPage(), AdminSyncPage(), GET(), sitemap() (+17 more)

### Community 10 - "requireUser"
Cohesion: 0.19
Nodes (23): eventSchema, POST(), DELETE(), GET(), POST(), slugSchema, DELETE(), GET() (+15 more)

### Community 11 - "guards.ts"
Cohesion: 0.10
Nodes (18): DownloadsPage(), metadata, FavoritesPage(), metadata, FollowsPage(), metadata, HistoryPage(), metadata (+10 more)

### Community 12 - "route.ts"
Cohesion: 0.18
Nodes (20): GET(), GET(), GET(), chatRequestSchema, jsonError(), POST(), guestSecret(), makeGuestCookie() (+12 more)

### Community 13 - "card.tsx"
Cohesion: 0.14
Nodes (16): AdminUsersPage(), DashboardOverview(), DocsPage(), FAQ, metadata, AnnouncementForm(), DeleteAnnouncementButton(), BarChart() (+8 more)

### Community 14 - "cn"
Cohesion: 0.16
Nodes (15): AdminLayout(), LINKS, DashboardLayout(), LINKS, generateMetadata(), DownloadButton(), ProjectActions(), Badge() (+7 more)

### Community 15 - "data-repo.ts"
Cohesion: 0.10
Nodes (9): ApiErrorInput, AuditLogInput, AnalyticsRow, ChatbotKnowledgeDocDto, ChatConversationSummaryDto, ChatMessageDto, CommunityStatsDto, EventType (+1 more)

### Community 16 - "Deployment"
Cohesion: 0.10
Nodes (19): Backups, Deployment, Environment checklist, Health checks, Prerequisites, Quick start, Security notes, Stripe Pro membership (+11 more)

### Community 17 - "memory-store.ts"
Cohesion: 0.16
Nodes (14): main(), prisma, memoryAdapter, SEED_ANNOUNCEMENTS, SEED_CATEGORIES, SEED_PROJECTS, SEED_SECTIONS, SEED_SOCIALS (+6 more)

### Community 18 - "page.tsx"
Cohesion: 0.19
Nodes (12): HomePage(), ProjectPage(), AnnouncementBar(), YouTubeEmbed(), ProjectCard(), StatCounter(), formatBytes(), formatNumber() (+4 more)

### Community 19 - "RedisCache"
Cohesion: 0.10
Nodes (3): CacheAdapter, MemoryCache, RedisCache

### Community 20 - "section-forms.tsx"
Cohesion: 0.21
Nodes (14): AdminSectionsPage(), HomepageVideoForm(), SectionForm(), SocialForm(), Comment, Checkbox(), Input, Label() (+6 more)

### Community 21 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, devDependencies, eslint, @playwright/test, tailwindcss, @types/node, @types/node-cron, @types/nodemailer (+11 more)

### Community 22 - "getServerEnv"
Cohesion: 0.16
Nodes (14): collectDocs(), extractTitle(), main(), metadata, minecraft, RootLayout(), viewport, Footer() (+6 more)

### Community 23 - "schemas.ts"
Cohesion: 0.14
Nodes (16): PasswordStrengthMeter(), adminUserSchema, announcementSchema, commentSchema, forgotPasswordSchema, LoginInput, loginSchema, notificationPrefsSchema (+8 more)

### Community 24 - "icons.tsx"
Cohesion: 0.20
Nodes (18): ArrowRightIcon(), base(), BellIcon(), CheckIcon(), ChevronDownIcon(), ChevronLeftIcon(), ChevronRightIcon(), CloseIcon() (+10 more)

### Community 25 - "empty.ts"
Cohesion: 0.18
Nodes (14): revocationCache, buildCatalogIndex(), buildSiteProjectsIndex(), extractTitle(), firstParagraph(), getKnowledgeDocs(), knowledgeCache, loadDocsFromDisk() (+6 more)

### Community 26 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, cf:sync, db:deploy, db:generate, db:migrate, db:seed, db:studio (+9 more)

### Community 27 - "url-filters.ts"
Cohesion: 0.25
Nodes (13): metadata, ProjectsPage(), FilterBar(), ProjectType, LEGACY_SINGLE, LOADERS, MULTI, parseFilterParams() (+5 more)

### Community 28 - "repo-memory.ts"
Cohesion: 0.12
Nodes (7): SessionUser, UserPatch, MemoryUserRecord, memoryRepo, HomeSectionDto, NotificationDto, Role

### Community 29 - "deepseek.ts"
Cohesion: 0.18
Nodes (13): apiKey(), DeepSeekChatOptions, deepSeekJson(), DeepSeekJsonOptions, DeepSeekMessage, streamDeepSeekChat(), ALLOW_PATTERNS, BLOCK_PATTERNS (+5 more)

### Community 30 - "button.tsx"
Cohesion: 0.17
Nodes (10): FREE_BENEFITS, metadata, PRO_BENEFITS, CookieConsent(), getConsent(), MembershipActions(), Button, ButtonProps (+2 more)

### Community 31 - "actions.ts"
Cohesion: 0.23
Nodes (13): NavUser, UserMenu(), forgotPasswordAction(), loginAction(), logoutAction(), logoutAllAction(), randomToken(), resetPasswordAction() (+5 more)

### Community 32 - "search-modal.tsx"
Cohesion: 0.21
Nodes (8): SearchModal(), SearchResult, Screenshot, ScreenshotGallery(), ViewTracker(), Dialog(), hasConsent(), trackEventClient()

### Community 33 - "env.ts"
Cohesion: 0.20
Nodes (10): compactSchema, POST(), registerAction(), TurnstileResponse, verifyTurnstile(), isOAuthConfigured(), isTurnstileConfigured(), ServerEnv (+2 more)

### Community 34 - "permissions.ts"
Cohesion: 0.21
Nodes (9): authConfig, hasPermission(), MATRIX, Permission, PERMISSIONS, permissionsFor(), ROLE_LABELS, { auth } (+1 more)

### Community 35 - "email.ts"
Cohesion: 0.33
Nodes (10): emailShell(), EmailShellInput, escapeHtml(), getTransporter(), MailInput, sendDigestEmail(), sendMail(), sendPasswordResetEmail() (+2 more)

### Community 36 - "repo.ts"
Cohesion: 0.18
Nodes (6): GET(), GET(), POST(), metadata, SettingsPage(), getDataBackendLabel()

### Community 38 - "digest.ts"
Cohesion: 0.31
Nodes (6): buildDigest(), DigestItem, runDigestJob(), guard(), main(), now

### Community 39 - "auth.ts"
Cohesion: 0.36
Nodes (6): credentialsProvider, { handlers, auth, signIn, signOut }, resolveAdapter(), isSessionRevoked(), getPrisma(), isDatabaseReachable()

### Community 40 - "client.ts"
Cohesion: 0.56
Nodes (5): POST(), isProStatus(), applySubscriptionByCustomerId(), applySubscriptionToUser(), mapSubscriptionToPro()

### Community 42 - "NightBeam Assistant (Chatbot)"
Cohesion: 0.25
Nodes (7): Environment variables, How it works, Knowledge base, NightBeam Assistant (Chatbot), Operations, Security model (jailbreak defense), UI

### Community 43 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, prisma, seed, private, version

### Community 44 - "allowScripts"
Cohesion: 0.29
Nodes (7): allowScripts, esbuild@0.28.1, prisma@6.19.3, @prisma/client@6.19.3, @prisma/engines@6.19.3, sharp@0.34.5, unrs-resolver@1.12.2

### Community 45 - "route.ts"
Cohesion: 0.57
Nodes (5): POST(), POST(), CommunityPage(), isStripeConfigured(), getStripe()

### Community 46 - "settings-form.tsx"
Cohesion: 0.62
Nodes (5): SettingsForm(), deleteAccountAction(), updatePrefsAction(), updateProfileAction(), MC_VERSIONS

### Community 47 - "navbar.tsx"
Cohesion: 0.43
Nodes (5): LINKS, Navbar(), openChatWidget(), applyTheme(), ThemeToggle()

### Community 49 - "next-auth.d.ts"
Cohesion: 0.33
Nodes (5): JWT, next-auth, next-auth/jwt, Session, User

### Community 50 - "NightBeam Studio Website — Agent Guide"
Cohesion: 0.40
Nodes (4): Conventions, Data & auth, NightBeam Studio Website — Agent Guide, Quality gates (run before committing)

### Community 51 - "route.ts"
Cohesion: 0.60
Nodes (4): DELETE(), identityFrom(), PATCH(), pinSchema

### Community 55 - "migration.sql"
Cohesion: 0.67
Nodes (3): "ChatbotKnowledgeDoc", "ChatMessage", "User"

## Knowledge Gaps
- **244 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+239 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getRepo()` connect `getRepo` to `client.ts`, `auth-forms.tsx`, `requireUser`, `guards.ts`, `route.ts`, `card.tsx`, `cn`, `page.tsx`, `section-forms.tsx`, `getServerEnv`, `empty.ts`, `url-filters.ts`, `button.tsx`, `actions.ts`, `env.ts`, `repo.ts`, `digest.ts`, `auth.ts`, `client.ts`, `route.ts`, `settings-form.tsx`, `route.ts`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Why does `DataRepo` connect `DataRepo` to `MemoryDataStore`, `repo.ts`, `ProjectSummary`, `types.ts`, `data-repo.ts`, `AnnouncementDto`, `ProjectOverrideDto`, `SyncStateDto`, `NotificationPreferenceDto`, `repo-memory.ts`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `getServerEnv()` connect `getServerEnv` to `env.ts`, `client.ts`, `email.ts`, `MemoryDataStore`, `repo.ts`, `digest.ts`, `client.ts`, `getRepo`, `requireUser`, `guards.ts`, `route.ts`, `route.ts`, `memory-store.ts`, `page.tsx`, `empty.ts`, `deepseek.ts`, `actions.ts`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _244 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `retrieval.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06271186440677966 - nodes in this community are weakly interconnected._
- **Should `MemoryDataStore` be split into smaller, more focused modules?**
  _Cohesion score 0.04558737580362361 - nodes in this community are weakly interconnected._
- **Should `client.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09291521486643438 - nodes in this community are weakly interconnected._