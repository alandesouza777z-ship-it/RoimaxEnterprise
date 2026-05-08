-- AlterTable
ALTER TABLE "Artifact"
ADD COLUMN     "generatedAt" TIMESTAMP(3),
ADD COLUMN     "metadataJson" TEXT,
ADD COLUMN     "publicUrl" TEXT,
ADD COLUMN     "sourceSystem" TEXT NOT NULL DEFAULT 'agents-lab',
ADD COLUMN     "storageKey" TEXT;

-- CreateIndex
CREATE INDEX "Artifact_sourceSystem_idx" ON "Artifact"("sourceSystem");
