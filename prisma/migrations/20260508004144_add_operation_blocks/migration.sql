-- CreateEnum
CREATE TYPE "OperationWeekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY');

-- CreateTable
CREATE TABLE "OperationBlock" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "weekday" "OperationWeekday" NOT NULL,
    "workspaceSlug" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OperationBlock_slug_key" ON "OperationBlock"("slug");

-- CreateIndex
CREATE INDEX "OperationBlock_workspaceSlug_weekday_idx" ON "OperationBlock"("workspaceSlug", "weekday");

-- CreateIndex
CREATE INDEX "OperationBlock_createdById_idx" ON "OperationBlock"("createdById");

-- AddForeignKey
ALTER TABLE "OperationBlock" ADD CONSTRAINT "OperationBlock_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
