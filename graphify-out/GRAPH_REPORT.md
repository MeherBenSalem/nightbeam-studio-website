# Graph Report - nightbeam-studio-website  (2026-08-07)

## Corpus Check
- 253 files · ~97,419 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1549 nodes · 3528 edges · 109 communities (81 shown, 28 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.68)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2a642a1d`
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
- knowledge.ts
- webhook.ts
- StoreProductDetail
- page.tsx
- chat-markdown.tsx
- settings-form.tsx
- HomeSectionDto
- page.tsx
- @playwright/test
- @types/node-cron
- vitest

## God Nodes (most connected - your core abstractions)
1. `getRepo()` - 155 edges
2. `MemoryDataStore` - 88 edges
3. `DataRepo` - 80 edges
4. `getServerEnv()` - 79 edges
5. `requireUser()` - 57 edges
6. `requirePermission()` - 38 edges
7. `cn()` - 36 edges
8. `withErrorHandling()` - 33 edges
9. `PixelHeading()` - 24 edges
10. `ProjectSummary` - 20 edges

## Surprising Connections (you probably didn't know these)
- `chunkDoc()` --indirect_call--> `text()`  [INFERRED]
  src/lib/chatbot/retrieval.ts → tools/nightbeam-ops/src/mcp/server.ts
- `main()` --calls--> `getServerEnv()`  [EXTRACTED]
  prisma/seed.ts → src/lib/config/env.ts
- `main()` --calls--> `getRepo()`  [EXTRACTED]
  scripts/upsert-project-docs.ts → src/lib/db/repo.ts
- `buildCatalogIndex()` --indirect_call--> `doc()`  [INFERRED]
  src/lib/chatbot/knowledge.ts → tests/unit/chatbot-retrieval.test.ts
- `main()` --calls--> `getRepo()`  [EXTRACTED]
  scripts/chatbot-kb-sync.ts → src/lib/db/repo.ts

## Import Cycles
- None detected.

## Communities (109 total, 28 thin omitted)

### Community 0 - "retrieval.ts"
Cohesion: 0.19
Nodes (19): ALIASES, buildRetrievalQuery(), buildStats(), chunkAll(), chunkDoc(), CorpusStats, CROSS_MOD_HINTS, CROSS_MOD_TERMS (+11 more)

### Community 1 - "MemoryDataStore"
Cohesion: 0.04
Nodes (7): cloneSeedProject(), defaultPrefs(), MemoryDataStore, uid(), AuditLogDto, LoginHistoryDto, NotificationType

### Community 2 - "client.ts"
Cohesion: 0.09
Nodes (34): cache, CurseForgeError, fetchJson(), getAuthorMods(), getModDetails(), getModFiles(), getModStats(), isCurseForgeConfigured() (+26 more)

### Community 3 - "DataRepo"
Cohesion: 0.04
Nodes (5): DataRepo, AnnouncementDto, ProfileDto, SocialLinkDto, UserDto

### Community 4 - "auth-forms.tsx"
Cohesion: 0.13
Nodes (12): DownloadsPage(), metadata, metadata, metadata, metadata, NotificationsPage(), metadata, MarkAllReadButton() (+4 more)

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
Cohesion: 0.14
Nodes (13): applyOverride(), mapDetail(), mapSummary(), mapVersion(), ProjectDetailRow, ProjectSummaryRow, DEFAULT_PREFS, mapStoreDetail() (+5 more)

### Community 9 - "getRepo"
Cohesion: 0.09
Nodes (53): createTray(), createWindow(), __dirname, pollReminders(), registerIpc(), main(), server, text() (+45 more)

### Community 10 - "requireUser"
Cohesion: 0.12
Nodes (41): AdminProjectsPage(), DELETE(), identityFrom(), PATCH(), pinSchema, DELETE(), identityFrom(), PATCH() (+33 more)

### Community 11 - "guards.ts"
Cohesion: 0.08
Nodes (39): BuiltByBitError, cache, extractList(), fetchJson(), getCreatorLicenses(), getCreatorResources(), getCreatorStores(), getCreatorVersions() (+31 more)

### Community 12 - "route.ts"
Cohesion: 0.10
Nodes (22): metadata, metadata, metadata, metadata, ForgotForm(), LoginForm(), RegisterForm(), ResetForm() (+14 more)

### Community 13 - "card.tsx"
Cohesion: 0.18
Nodes (15): AdminAnalyticsPage(), AdminAnnouncementsPage(), AdminErrorsPage(), AdminOverview(), AdminUsersPage(), StoreProductPage(), BarChart(), Notification (+7 more)

### Community 14 - "cn"
Cohesion: 0.07
Nodes (49): electron, node, src/mcp, src/seed, src/store, addNote(), buildSeedDatabase(), completeTask() (+41 more)

### Community 15 - "data-repo.ts"
Cohesion: 0.12
Nodes (8): SessionUser, UserPatch, MemoryUserRecord, memoryRepo, ApiErrorDto, NotificationPreferenceDto, ProjectOverrideDto, Role

### Community 16 - "Deployment"
Cohesion: 0.09
Nodes (21): Backups, Deployment, Environment checklist, Google Search Console, Health checks, Prerequisites, Production on this VPS (`nightbeam.dev`), Quick start (+13 more)

### Community 17 - "memory-store.ts"
Cohesion: 0.17
Nodes (14): main(), prisma, SEED_ANNOUNCEMENTS, SEED_CATEGORIES, SEED_PROJECTS, SEED_SECTIONS, SEED_SOCIALS, SEED_TAGS (+6 more)

### Community 18 - "page.tsx"
Cohesion: 0.14
Nodes (22): collectDocs(), extractTitle(), main(), eventSchema, POST(), GET(), POST(), POST() (+14 more)

### Community 19 - "RedisCache"
Cohesion: 0.07
Nodes (8): CacheAdapter, CacheStats, createCache(), getCacheStats(), instances, MemoryCache, RedisCache, MemoryCacheAdapter

### Community 20 - "section-forms.tsx"
Cohesion: 0.25
Nodes (12): AnnouncementForm(), DeleteAnnouncementButton(), ProjectOverrideForm(), Checkbox(), Input, Label(), Select, Textarea (+4 more)

### Community 21 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, prisma, @tailwindcss/postcss, tsx (+11 more)

### Community 22 - "getServerEnv"
Cohesion: 0.10
Nodes (20): Can I use it in my own mod / modpack?, Community & Support, Compatibility, Configuration, Do I need to install Jauml as a player?, Does it hurt performance?, Does it replace Cloth Config / other config UIs?, Features (+12 more)

### Community 23 - "schemas.ts"
Cohesion: 0.16
Nodes (14): PasswordStrengthMeter(), adminUserSchema, announcementSchema, commentSchema, LoginInput, loginSchema, notificationPrefsSchema, passwordSchema (+6 more)

### Community 24 - "icons.tsx"
Cohesion: 0.07
Nodes (42): HomePage(), metadata, AnnouncementBar(), YouTubeEmbed(), ArrowRightIcon(), base(), BellIcon(), CheckIcon() (+34 more)

### Community 25 - "empty.ts"
Cohesion: 0.25
Nodes (9): ProjectPage(), ProjectActions(), Screenshot, ScreenshotGallery(), StoreCard(), softwareApplicationJsonLd(), formatBytes(), formatNumber() (+1 more)

### Community 26 - "scripts"
Cohesion: 0.11
Nodes (18): scripts, build, cf:sync, db:deploy, db:generate, db:migrate, db:seed, db:studio (+10 more)

### Community 27 - "url-filters.ts"
Cohesion: 0.10
Nodes (19): src/ui, src/vite-env.d.ts, vite/client, compilerOptions, isolatedModules, jsx, lib, module (+11 more)

### Community 29 - "deepseek.ts"
Cohesion: 0.11
Nodes (18): metadata, VALUES, metadata, metadata, metadata, RootLayout(), generateMetadata(), robots() (+10 more)

### Community 30 - "button.tsx"
Cohesion: 0.11
Nodes (19): concurrently, electron, electron-builder, esbuild, devDependencies, concurrently, electron, electron-builder (+11 more)

### Community 31 - "actions.ts"
Cohesion: 0.15
Nodes (22): AdminSectionsPage(), AdminSyncPage(), HomepageVideoForm(), SectionForm(), SocialForm(), SyncPanel(), ConfirmKind, ROLES (+14 more)

### Community 32 - "search-modal.tsx"
Cohesion: 0.16
Nodes (14): ChatPage(), metadata, Turnstile(), Window, ChatMessage, ChatPanel(), ChatQuotaStatus, ConversationSummary (+6 more)

### Community 33 - "page.tsx"
Cohesion: 0.22
Nodes (15): metadata, ProjectsPage(), FilterBar(), ProjectFilters, ProjectType, LEGACY_SINGLE, LOADERS, MC_VERSIONS (+7 more)

### Community 34 - "permissions.ts"
Cohesion: 0.08
Nodes (28): AdminLayout(), LINKS, metadata, authConfig, credentialsProvider, { handlers, auth, signIn, signOut }, resolveAdapter(), memoryAdapter (+20 more)

### Community 35 - "auth.ts"
Cohesion: 0.12
Nodes (15): electron/**/*.ts, compilerOptions, declaration, esModuleInterop, lib, module, moduleResolution, outDir (+7 more)

### Community 36 - "button.tsx"
Cohesion: 0.18
Nodes (20): GET(), GET(), GET(), chatRequestSchema, jsonError(), POST(), guestSecret(), makeGuestCookie() (+12 more)

### Community 37 - "ProjectSummary"
Cohesion: 0.17
Nodes (3): toProjectSummary(), ProjectListResult, ProjectSummary

### Community 38 - "layout.tsx"
Cohesion: 0.17
Nodes (10): metadata, minecraft, siteUrl, viewport, ChatWidget(), CookieConsent(), getConsent(), Navbar() (+2 more)

### Community 39 - "auth.config.ts"
Cohesion: 0.17
Nodes (11): @modelcontextprotocol/sdk, dependencies, @modelcontextprotocol/sdk, zod, description, zod, main, name (+3 more)

### Community 40 - "email.ts"
Cohesion: 0.17
Nodes (11): dir, dist/**/*, dist-electron/**/*, build, appId, directories, files, productName (+3 more)

### Community 41 - "page.tsx"
Cohesion: 0.12
Nodes (20): DashboardLayout(), LINKS, metadata, buildHref(), metadata, parseStoreFilters(), StorePage(), StoreCta() (+12 more)

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
Cohesion: 0.07
Nodes (18): ApiErrorInput, AuditLogInput, AnalyticsRow, CategoryDto, ChatbotKnowledgeDocDto, ChatConversationSummaryDto, ChatMessageDto, CommunityStatsDto (+10 more)

### Community 46 - "settings-form.tsx"
Cohesion: 0.18
Nodes (11): scripts, build, build:electron, build:ui, dev, dev:app, dist, mcp (+3 more)

### Community 47 - "digest.ts"
Cohesion: 0.17
Nodes (16): emailShell(), EmailShellInput, escapeHtml(), getTransporter(), MailInput, sendDigestEmail(), sendMail(), sendPasswordResetEmail() (+8 more)

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

### Community 52 - "ProjectOverrideDto"
Cohesion: 0.17
Nodes (14): compactSchema, POST(), apiKey(), DeepSeekChatOptions, deepSeekJson(), DeepSeekJsonOptions, DeepSeekMessage, streamDeepSeekChat() (+6 more)

### Community 53 - "EventType"
Cohesion: 0.23
Nodes (6): main(), bySlug, PROJECT_CONTENT_PACKS, JAUML_CONTENT, ProjectContentPack, ProjectDocSeed

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

### Community 64 - "tsx"
Cohesion: 0.29
Nodes (9): buildChatMessages(), buildKnowledgeBlock(), buildSystemPrompt(), estimateTokens(), ChatHistoryItem, ChatQuotaResult, KnowledgeChunk, KnowledgeDoc (+1 more)

### Community 65 - "@types/react"
Cohesion: 0.25
Nodes (7): LoginPage(), metadata, oauthErrorMessage(), BuiltByBitIcon(), LoginOAuthButtons(), OAuthButtons(), PROVIDERS

### Community 88 - "eslint-config-next"
Cohesion: 0.24
Nodes (6): Comment, CommentsSection(), Button, ButtonProps, sizes, variants

### Community 91 - "typescript"
Cohesion: 0.36
Nodes (6): DocsPage(), FAQ, metadata, faqPageJsonLd(), inline(), renderMarkdown()

### Community 98 - "knowledge.ts"
Cohesion: 0.39
Nodes (8): buildCatalogIndex(), buildSiteProjectsIndex(), extractTitle(), firstParagraph(), getKnowledgeDocs(), knowledgeCache, loadDocsFromDisk(), loadDocsFromRepo()

### Community 99 - "webhook.ts"
Cohesion: 0.57
Nodes (5): POST(), isProStatus(), applySubscriptionByCustomerId(), applySubscriptionToUser(), mapSubscriptionToPro()

### Community 101 - "page.tsx"
Cohesion: 0.40
Nodes (4): FREE_BENEFITS, metadata, PRO_BENEFITS, MembershipActions()

### Community 102 - "chat-markdown.tsx"
Cohesion: 0.53
Nodes (3): ChatMarkdown(), inline(), renderBlock()

### Community 103 - "settings-form.tsx"
Cohesion: 0.73
Nodes (4): SettingsForm(), deleteAccountAction(), updatePrefsAction(), updateProfileAction()

### Community 105 - "page.tsx"
Cohesion: 0.50
Nodes (4): metadata, SettingsPage(), LinkedAccountsCard(), isBuiltByBitOAuthConfigured()

## Knowledge Gaps
- **396 isolated node(s):** `npx`, `NIGHTBEAM_OPS_DATA`, `eslintConfig`, `contentSecurityPolicy`, `securityHeaders` (+391 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `chunkDoc()` connect `retrieval.ts` to `getRepo`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Why does `text()` connect `getRepo` to `retrieval.ts`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Why does `getRepo()` connect `requireUser` to `client.ts`, `auth-forms.tsx`, `guards.ts`, `route.ts`, `card.tsx`, `page.tsx`, `section-forms.tsx`, `icons.tsx`, `empty.ts`, `deepseek.ts`, `actions.ts`, `page.tsx`, `permissions.ts`, `button.tsx`, `layout.tsx`, `page.tsx`, `digest.ts`, `ProjectOverrideDto`, `EventType`, `typescript`, `knowledge.ts`, `webhook.ts`, `page.tsx`, `settings-form.tsx`, `page.tsx`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **What connects `npx`, `NIGHTBEAM_OPS_DATA`, `eslintConfig` to the rest of the system?**
  _396 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `MemoryDataStore` be split into smaller, more focused modules?**
  _Cohesion score 0.04198668714797747 - nodes in this community are weakly interconnected._
- **Should `client.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08970099667774087 - nodes in this community are weakly interconnected._
- **Should `DataRepo` be split into smaller, more focused modules?**
  _Cohesion score 0.04499274310595065 - nodes in this community are weakly interconnected._