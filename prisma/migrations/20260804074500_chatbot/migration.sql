-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isPro" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "guestId" TEXT,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "topic" TEXT,
    "model" TEXT NOT NULL DEFAULT 'deepseek-chat',
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotKnowledgeDoc" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "projectId" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "filePath" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatbotKnowledgeDoc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatMessage_userId_createdAt_idx" ON "ChatMessage"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_guestId_createdAt_idx" ON "ChatMessage"("guestId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatbotKnowledgeDoc_source_idx" ON "ChatbotKnowledgeDoc"("source");

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotKnowledgeDoc_source_slug_key" ON "ChatbotKnowledgeDoc"("source", "slug");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotKnowledgeDoc" ADD CONSTRAINT "ChatbotKnowledgeDoc_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
