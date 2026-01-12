-- CreateTable
CREATE TABLE "Memo" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Memo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "color" VARCHAR(7) DEFAULT '#6B7280',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemoTag" (
    "memoId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemoTag_pkey" PRIMARY KEY ("memoId","tagId")
);

-- CreateIndex
CREATE INDEX "Memo_createdAt_idx" ON "Memo"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Memo_updatedAt_idx" ON "Memo"("updatedAt" DESC);

-- CreateIndex
CREATE INDEX "Memo_isPinned_idx" ON "Memo"("isPinned");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "MemoTag_memoId_idx" ON "MemoTag"("memoId");

-- CreateIndex
CREATE INDEX "MemoTag_tagId_idx" ON "MemoTag"("tagId");

-- AddForeignKey
ALTER TABLE "MemoTag" ADD CONSTRAINT "MemoTag_memoId_fkey" FOREIGN KEY ("memoId") REFERENCES "Memo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoTag" ADD CONSTRAINT "MemoTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
