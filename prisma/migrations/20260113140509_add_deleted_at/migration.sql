-- AlterTable
ALTER TABLE "Memo" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Memo_deletedAt_idx" ON "Memo"("deletedAt");
