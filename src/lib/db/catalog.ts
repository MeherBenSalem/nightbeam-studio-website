// Canonical seeded catalog for NightBeam Studio.
//
// Seeded from the actual mod repository facts: "The Birth of Steve",
// v0.4.0, Minecraft 26.1.2 / 26.2, NeoForge + Fabric, author Mahou.
// Everything else is realistic placeholder copy that is replaced when
// live CurseForge data arrives.

export const SEED_PROJECTS = [
  {
    id: "seed-the-birth-of-steve",
    slug: "the-birth-of-steve",
    name: "The Birth of Steve",
    summary:
      "A story-driven Minecraft mod by Mahou that explores the origin of Steve — new mechanics, quests, and a haunting journey through the world before the blocks.",
    description: [
      "## Where did Steve come from?",
      "",
      "*The Birth of Steve* is a narrative Minecraft mod that asks the question every player has wondered at least once. Built by Mahou under the NightBeam Studio banner, it turns the origin of the default survivor into an explorable story: a cold beginning, strange echoes in the Overworld, and mechanics that make each playthrough feel like the first.",
      "",
      "## Features",
      "",
      "- A story-driven progression layer that works alongside vanilla survival",
      "- Custom quests, dialogue, and environmental storytelling",
      "- New gameplay mechanics tied to the origin narrative",
      "- NeoForge and Fabric builds for Minecraft 26.1.2 and 26.2",
      "- Client and server side support with care for multiplayer",
      "",
      "> This description is seeded placeholder copy. It is replaced automatically when CurseForge sync is configured.",
    ].join("\n"),
    type: "MOD",
    authorName: "Mahou",
    studioName: "NightBeam Studio",
    curseforgeId: null,
    githubUrl: "https://github.com/MeherBenSalem",
    curseforgeUrl: null,
    iconUrl: null,
    bannerUrl: null,
    featured: true,
    status: "ACTIVE",
    downloads: 12840,
    followers: 916,
    views: 54320,
    rating: 4.8,
    minecraftVersions: ["26.1.2", "26.2"],
    loaders: ["NEOFORGE", "FABRIC"],
    categories: [
      { slug: "adventure", name: "Adventure" },
      { slug: "story", name: "Story & Lore" },
    ],
    tags: [
      { slug: "origins", name: "origins" },
      { slug: "steve", name: "steve" },
      { slug: "narrative", name: "narrative" },
      { slug: "quests", name: "quests" },
    ],
    versions: [
      {
        id: "seed-v-0-4-0",
        version: "0.4.0",
        minecraftVersions: ["26.1.2", "26.2"],
        loaders: ["NEOFORGE", "FABRIC"],
        changelog:
          "Seeded changelog for v0.4.0 — will be replaced by live CurseForge release notes.\n\n- NeoForge and Fabric builds\n- Minecraft 26.1.2 & 26.2 support\n- Story progression and quest fixes\n- Performance improvements",
        releaseDate: new Date("2026-01-12T00:00:00Z"),
        releaseType: "RELEASE",
        isLatest: true,
        files: [
          {
            id: "seed-file-neoforge",
            fileName: "the-birth-of-steve-0.4.0-neoforge.jar",
            fileSize: 4_812_000,
            downloads: 7042,
            downloadUrl: null,
            sha1: null,
            kind: "primary",
          },
          {
            id: "seed-file-fabric",
            fileName: "the-birth-of-steve-0.4.0-fabric.jar",
            fileSize: 4_655_000,
            downloads: 5798,
            downloadUrl: null,
            sha1: null,
            kind: "primary",
          },
        ],
      },
    ],
    screenshots: [],
    changelogs: [
      {
        id: "seed-cl-0-4-0",
        version: "0.4.0",
        title: "The Birth of Steve 0.4.0",
        content:
          "Seeded changelog entry — replaced by live CurseForge release notes once sync is configured.\n\n- NeoForge and Fabric builds for 26.1.2 / 26.2\n- Story progression and quest fixes\n- Performance improvements",
        publishedAt: new Date("2026-01-12T00:00:00Z"),
      },
    ],
    docs: [
      {
        id: "seed-doc-installation",
        slug: "installation",
        title: "Installation",
        sortOrder: 0,
        content: [
          "## Requirements",
          "",
          "- Minecraft 26.1.2 or 26.2",
          "- NeoForge (recommended) or Fabric for the matching Minecraft version",
          "- A dedicated server or single-player world",
          "",
          "## Steps",
          "",
          "1. Install the correct mod loader for your Minecraft version.",
          "2. Drop the mod jar into your `mods` folder.",
          "3. Launch the game once and let it generate its runtime data.",
          "4. Start a new world or load an existing one — the origin story begins when you wake up.",
          "",
          "> Seeded placeholder documentation; synced from the project once CurseForge data is live.",
        ].join("\n"),
      },
      {
        id: "seed-doc-getting-started",
        slug: "getting-started",
        title: "Getting Started",
        sortOrder: 1,
        content: [
          "## Beginning the story",
          "",
          "Spawn in a familiar world that feels slightly wrong. Follow the quest tracker and read the notes you find — the story is told through the world itself.",
          "",
          "> Seeded placeholder documentation; synced from the project once CurseForge data is live.",
        ].join("\n"),
      },
      {
        id: "seed-doc-configuration",
        slug: "configuration",
        title: "Configuration",
        sortOrder: 2,
        content: [
          "## Config file",
          "",
          "After first launch a config file is generated in `config/birth-of-steve/`. Options include story pacing, quest tracking, and server-side toggles for multiplayer.",
          "",
          "> Seeded placeholder documentation; synced from the project once CurseForge data is live.",
        ].join("\n"),
      },
    ],
    dependencies: [],
    comments: [],
  },
];

export const SEED_CATEGORIES = [
  { slug: "adventure", name: "Adventure", type: "MOD" },
  { slug: "story", name: "Story & Lore", type: "MOD" },
  { slug: "utility", name: "Utility", type: "MOD" },
  { slug: "magic", name: "Magic", type: "MOD" },
  { slug: "technology", name: "Technology", type: "MOD" },
  { slug: "decoration", name: "Decoration", type: "MODPACK" },
] as const;

export const SEED_TAGS = [
  { slug: "origins", name: "origins" },
  { slug: "steve", name: "steve" },
  { slug: "narrative", name: "narrative" },
  { slug: "quests", name: "quests" },
] as const;

export const SEED_ANNOUNCEMENTS = [
  {
    slug: "birth-of-steve-v040",
    title: "The Birth of Steve v0.4.0 is out now",
    body: "Available for Minecraft 26.1.2 and 26.2 on NeoForge and Fabric. Follow the origin story from the very first block.",
    active: true,
    dismissible: true,
  },
] as const;

export const SEED_SECTIONS = [
  { key: "hero", title: "Featured release", subtitle: "The Birth of Steve — v0.4.0", enabled: true, sortOrder: 0, content: null },
  { key: "featured-projects", title: "Featured projects", subtitle: null, enabled: true, sortOrder: 1, content: null },
  { key: "stats", title: "Community numbers", subtitle: null, enabled: true, sortOrder: 2, content: null },
  { key: "community", title: "Join the community", subtitle: null, enabled: true, sortOrder: 3, content: null },
] as const;

export const SEED_SOCIALS = [
  { platform: "GITHUB", label: "GitHub", url: "https://github.com/MeherBenSalem?tab=repositories", sortOrder: 0 },
  { platform: "YOUTUBE", label: "YouTube", url: "https://www.youtube.com/@nightbeamstudio", sortOrder: 1 },
  { platform: "DISCORD", label: "Discord", url: "https://discord.gg/e4hRcaZM8G", sortOrder: 2 },
] as const;
