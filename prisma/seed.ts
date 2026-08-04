import { FileType, PrismaClient, ProjectType } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  SEED_ANNOUNCEMENTS,
  SEED_CATEGORIES,
  SEED_PROJECTS,
  SEED_SECTIONS,
  SEED_SOCIALS,
  SEED_TAGS,
} from "../src/lib/db/catalog";
import { getServerEnv } from "../src/lib/config/env";

const prisma = new PrismaClient();

async function main() {
  const env = getServerEnv();

  for (const category of SEED_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: { slug: category.slug, name: category.name, type: category.type },
      update: { name: category.name },
    });
  }
  for (const tag of SEED_TAGS) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      create: { slug: tag.slug, name: tag.name },
      update: { name: tag.name },
    });
  }

  for (const seed of SEED_PROJECTS) {
    const projectId = seed.id;
    await prisma.project.upsert({
      where: { id: projectId },
      create: {
        id: projectId,
        slug: seed.slug,
        name: seed.name,
        summary: seed.summary,
        description: seed.description,
        type: seed.type as ProjectType,
        authorName: seed.authorName,
        studioName: seed.studioName,
        curseforgeId: seed.curseforgeId,
        githubUrl: seed.githubUrl,
        curseforgeUrl: seed.curseforgeUrl,
        iconUrl: seed.iconUrl,
        bannerUrl: seed.bannerUrl,
        featured: seed.featured,
        status: seed.status,
        downloads: seed.downloads,
        followers: seed.followers,
        views: seed.views,
        rating: seed.rating,
      },
      update: {
        slug: seed.slug,
        name: seed.name,
        summary: seed.summary,
        description: seed.description,
        type: seed.type as ProjectType,
        authorName: seed.authorName,
        featured: seed.featured,
        status: seed.status,
      },
    });

    await prisma.projectCategory.deleteMany({ where: { projectId } });
    for (const category of seed.categories) {
      const row = await prisma.category.upsert({
        where: { slug: category.slug },
        create: { slug: category.slug, name: category.name },
        update: { name: category.name },
      });
      await prisma.projectCategory.create({ data: { projectId, categoryId: row.id } });
    }
    await prisma.projectTag.deleteMany({ where: { projectId } });
    for (const tag of seed.tags) {
      const row = await prisma.tag.upsert({
        where: { slug: tag.slug },
        create: { slug: tag.slug, name: tag.name },
        update: { name: tag.name },
      });
      await prisma.projectTag.create({ data: { projectId, tagId: row.id } });
    }

    await prisma.projectVersion.deleteMany({ where: { projectId } });
    for (const version of seed.versions) {
      await prisma.projectVersion.create({
        data: {
          projectId,
          version: version.version,
          minecraftVersions: version.minecraftVersions,
          loaders: version.loaders,
          changelog: version.changelog,
          releaseDate: version.releaseDate,
          releaseType: version.releaseType as FileType,
          isLatest: version.isLatest,
          files: {
            create: version.files.map((file) => ({
              fileName: file.fileName,
              fileSize: file.fileSize,
              downloads: file.downloads,
              downloadUrl: file.downloadUrl,
              sha1: file.sha1,
              kind: file.kind,
            })),
          },
        },
      });
    }
    await prisma.changelogEntry.deleteMany({ where: { projectId } });
    for (const changelog of seed.changelogs) {
      await prisma.changelogEntry.create({
        data: { projectId, version: changelog.version, title: changelog.title, content: changelog.content, publishedAt: changelog.publishedAt },
      });
    }
    await prisma.documentationPage.deleteMany({ where: { projectId } });
    for (const doc of seed.docs) {
      await prisma.documentationPage.create({
        data: { projectId, slug: doc.slug, title: doc.title, content: doc.content, sortOrder: doc.sortOrder },
      });
    }
  }

  for (const announcement of SEED_ANNOUNCEMENTS) {
    await prisma.announcement.upsert({
      where: { slug: announcement.slug },
      create: { ...announcement, startsAt: null, endsAt: null },
      update: { title: announcement.title, body: announcement.body, active: announcement.active },
    });
  }

  for (const section of SEED_SECTIONS) {
    await prisma.homeSection.upsert({
      where: { key: section.key },
      create: { key: section.key, title: section.title, subtitle: section.subtitle, enabled: section.enabled, sortOrder: section.sortOrder },
      update: { title: section.title, subtitle: section.subtitle, enabled: section.enabled, sortOrder: section.sortOrder },
    });
  }

  for (const social of SEED_SOCIALS) {
    const existing = await prisma.socialLink.findFirst({ where: { platform: social.platform } });
    if (existing) {
      await prisma.socialLink.update({ where: { id: existing.id }, data: { label: social.label, url: social.url, sortOrder: social.sortOrder } });
    } else {
      await prisma.socialLink.create({ data: { platform: social.platform, label: social.label, url: social.url, sortOrder: social.sortOrder } });
    }
  }

  const adminEmail = env.AUTH_ADMIN_EMAIL.toLowerCase();
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(env.AUTH_ADMIN_PASSWORD, 10);
    await prisma.user.create({
      data: {
        name: "NightBeam Admin",
        email: adminEmail,
        displayName: "NightBeam Admin",
        passwordHash,
        emailVerified: new Date(),
        role: "SUPER_ADMIN",
        isPro: true,
      },
    });
    console.log(`Seeded super admin: ${adminEmail}`);
  }

  console.log("Seed complete: catalog, announcements, sections, socials, admin.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
