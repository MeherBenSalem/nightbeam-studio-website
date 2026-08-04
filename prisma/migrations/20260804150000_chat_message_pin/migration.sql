-- Pinned messages in chat conversations.
ALTER TABLE "ChatMessage" ADD COLUMN "pinned" BOOLEAN NOT NULL DEFAULT false;
