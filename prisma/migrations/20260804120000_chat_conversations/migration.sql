-- Multiple chat conversations: messages belong to a conversation.
ALTER TABLE "ChatMessage" ADD COLUMN "conversationId" TEXT;

CREATE INDEX "ChatMessage_userId_conversationId_createdAt_idx" ON "ChatMessage"("userId", "conversationId", "createdAt");
CREATE INDEX "ChatMessage_guestId_conversationId_createdAt_idx" ON "ChatMessage"("guestId", "conversationId", "createdAt");
