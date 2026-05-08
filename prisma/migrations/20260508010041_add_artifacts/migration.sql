-- CreateTable
CREATE TABLE "Artifact" (
    "id" TEXT NOT NULL,
    "sourcePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "artifactType" TEXT NOT NULL,
    "preview" TEXT NOT NULL,
    "workspaceSlug" TEXT NOT NULL,
    "offerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artifact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Artifact_sourcePath_key" ON "Artifact"("sourcePath");

-- CreateIndex
CREATE INDEX "Artifact_workspaceSlug_updatedAt_idx" ON "Artifact"("workspaceSlug", "updatedAt");

-- CreateIndex
CREATE INDEX "Artifact_offerId_idx" ON "Artifact"("offerId");

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
