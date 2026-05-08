import type { Dirent } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@/lib/prisma";

export type PersistedArtifact = {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  artifactType: string;
  offerSlug: string | null;
  offerTitle: string | null;
  preview: string;
  sourcePath: string;
  sourceSystem: string;
  publicUrl: string | null;
  storageKey: string | null;
  generatedAt: Date | null;
  updatedAt: Date;
};

type ArtifactUpsertInput = {
  sourcePath: string;
  sourceSystem: string;
  fileName: string;
  title: string;
  fileType: string;
  artifactType: string;
  preview: string;
  updatedAt: Date;
  workspaceSlug: string;
  offerId: string | null;
  storageKey: string | null;
  publicUrl: string | null;
  generatedAt: Date | null;
  metadataJson: string | null;
};

type RemoteArtifactPayload = {
  sourcePath: string;
  sourceSystem?: string;
  fileName: string;
  title: string;
  fileType: string;
  artifactType: string;
  preview?: string;
  workspaceSlug: string;
  offerSlug?: string | null;
  storageKey?: string | null;
  publicUrl?: string | null;
  generatedAt?: string | null;
  metadata?: unknown;
};

const OUTPUTS_DIR = path.resolve(process.cwd(), "..", "agents-lab", "outputs");
const TEXT_FILE_EXTENSIONS = new Set([".md", ".json", ".txt"]);
const ALLOW_LOCAL_ARTIFACT_SYNC =
  process.env.ALLOW_LOCAL_ARTIFACT_SYNC === "true" && process.env.NODE_ENV !== "production";

function humanizeSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeSourcePath(value: string) {
  return value.replace(/\\/g, "/");
}

function buildSourceIdentity(sourceSystem: string, sourcePath: string) {
  return `${sourceSystem}::${normalizeSourcePath(sourcePath)}`;
}

function parseArtifactOrigin(sourceSystem: string, sourcePath: string) {
  if (!sourcePath.includes("::")) {
    return {
      sourceSystem,
      sourcePath,
    };
  }

  const [originSystem, originPath] = sourcePath.split("::", 2);

  return {
    sourceSystem: originSystem,
    sourcePath: originPath,
  };
}

function formatPersistedArtifact(artifact: {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  artifactType: string;
  preview: string;
  sourcePath: string;
  sourceSystem: string;
  publicUrl: string | null;
  storageKey: string | null;
  generatedAt: Date | null;
  updatedAt: Date;
  offer: { slug: string; title: string } | null;
}): PersistedArtifact {
  const origin = parseArtifactOrigin(artifact.sourceSystem, artifact.sourcePath);

  return {
    id: artifact.id,
    title: artifact.title,
    fileName: artifact.fileName,
    fileType: artifact.fileType,
    artifactType: artifact.artifactType,
    offerSlug: artifact.offer?.slug ?? null,
    offerTitle: artifact.offer?.title ?? null,
    preview: artifact.preview,
    sourcePath: origin.sourcePath,
    sourceSystem: origin.sourceSystem,
    publicUrl: artifact.publicUrl,
    storageKey: artifact.storageKey,
    generatedAt: artifact.generatedAt,
    updatedAt: artifact.updatedAt,
  };
}

async function extractMetadata(filePath: string, extension: string) {
  if (!TEXT_FILE_EXTENSIONS.has(extension)) {
    return {
      title: "",
      preview: "",
    };
  }

  const raw = await readFile(filePath, "utf8");

  if (extension === ".json") {
    try {
      const parsed = JSON.parse(raw) as {
        title?: string;
        source?: string;
        data?: { promise?: string };
      };

      return {
        title: parsed.title ?? "",
        preview: parsed.data?.promise ?? parsed.source ?? "",
      };
    } catch {
      return {
        title: "",
        preview: "JSON inválido ou não legível.",
      };
    }
  }

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const heading = lines.find((line) => line.startsWith("#"))?.replace(/^#+\s*/, "") ?? "";
  const preview = lines.find((line) => !line.startsWith("#")) ?? "";

  return {
    title: heading,
    preview,
  };
}

async function discoverLocalArtifacts(): Promise<ArtifactUpsertInput[]> {
  const offers = await prisma.offer.findMany({
    select: {
      id: true,
      slug: true,
      owner: {
        select: {
          workspaceSlug: true,
        },
      },
    },
  });

  if (!offers.length) {
    return [];
  }

  let entries: Dirent<string>[];

  try {
    entries = await readdir(OUTPUTS_DIR, { encoding: "utf8", withFileTypes: true });
  } catch {
    return [];
  }

  const offersBySpecificity = [...offers].sort((a, b) => b.slug.length - a.slug.length);
  const artifacts: Array<ArtifactUpsertInput | null> = await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map(async (entry): Promise<ArtifactUpsertInput | null> => {
        const parsedPath = path.parse(entry.name);
        const matchedOffer = offersBySpecificity.find(
          (offer) => parsedPath.name === offer.slug || parsedPath.name.startsWith(`${offer.slug}-`),
        );

        if (!matchedOffer) {
          return null;
        }

        const filePath = path.join(OUTPUTS_DIR, entry.name);
        const fileStats = await stat(filePath);
        const metadata = await extractMetadata(filePath, parsedPath.ext.toLowerCase());
        const artifactSlug = parsedPath.name
          .replace(new RegExp(`^${matchedOffer.slug}-?`), "")
          .replace(/^-/, "");

        return {
          sourcePath: buildSourceIdentity("agents-lab-local", path.posix.join("agents-lab", "outputs", entry.name)),
          sourceSystem: "agents-lab-local",
          fileName: entry.name,
          title: metadata.title || humanizeSlug(artifactSlug || matchedOffer.slug),
          fileType: parsedPath.ext.replace(".", "") || "file",
          artifactType: humanizeSlug(artifactSlug || "artifact"),
          preview: metadata.preview,
          updatedAt: fileStats.mtime,
          workspaceSlug: matchedOffer.owner.workspaceSlug,
          offerId: matchedOffer.id,
          storageKey: null,
          publicUrl: null,
          generatedAt: fileStats.mtime,
          metadataJson: null,
        } satisfies ArtifactUpsertInput;
      }),
  );

  return artifacts.filter((artifact): artifact is ArtifactUpsertInput => artifact !== null);
}

async function persistArtifacts(artifacts: ArtifactUpsertInput[]) {
  await Promise.all(
    artifacts.map((artifact) =>
      prisma.artifact.upsert({
        where: {
          sourcePath: artifact.sourcePath,
        },
        update: {
          sourceSystem: artifact.sourceSystem,
          fileName: artifact.fileName,
          title: artifact.title,
          fileType: artifact.fileType,
          artifactType: artifact.artifactType,
          preview: artifact.preview,
          workspaceSlug: artifact.workspaceSlug,
          offerId: artifact.offerId,
          storageKey: artifact.storageKey,
          publicUrl: artifact.publicUrl,
          generatedAt: artifact.generatedAt,
          metadataJson: artifact.metadataJson,
          updatedAt: artifact.updatedAt,
        },
        create: artifact,
      }),
    ),
  );
}

export async function syncLocalArtifactsForDevelopment() {
  if (!ALLOW_LOCAL_ARTIFACT_SYNC) {
    return;
  }

  const artifacts = await discoverLocalArtifacts();
  await persistArtifacts(artifacts);
}

export async function syncAgentsLabArtifacts() {
  await syncLocalArtifactsForDevelopment();
}

export async function ingestRemoteArtifact(payload: RemoteArtifactPayload) {
  const offer = payload.offerSlug
    ? await prisma.offer.findFirst({
        where: {
          slug: payload.offerSlug,
          owner: {
            workspaceSlug: payload.workspaceSlug,
          },
        },
        select: {
          id: true,
        },
      })
    : null;

  const sourceSystem = payload.sourceSystem ?? "agents-lab";
  const hasSharedLocator = Boolean(payload.publicUrl || payload.storageKey || sourceSystem !== "agents-lab");

  const artifact: ArtifactUpsertInput = {
    sourcePath: hasSharedLocator
      ? buildSourceIdentity(sourceSystem, payload.sourcePath)
      : normalizeSourcePath(payload.sourcePath),
    sourceSystem,
    fileName: payload.fileName,
    title: payload.title,
    fileType: payload.fileType,
    artifactType: payload.artifactType,
    preview: payload.preview ?? "",
    workspaceSlug: payload.workspaceSlug,
    offerId: offer?.id ?? null,
    storageKey: payload.storageKey ?? null,
    publicUrl: payload.publicUrl ?? null,
    generatedAt: payload.generatedAt ? new Date(payload.generatedAt) : null,
    metadataJson: payload.metadata ? JSON.stringify(payload.metadata) : null,
    updatedAt: payload.generatedAt ? new Date(payload.generatedAt) : new Date(),
  };

  await persistArtifacts([artifact]);
}

export async function listPersistedArtifacts(workspaceSlug: string): Promise<PersistedArtifact[]> {
  const artifacts = await prisma.artifact.findMany({
    where: {
      workspaceSlug,
    },
    include: {
      offer: {
        select: {
          slug: true,
          title: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return artifacts.map((artifact) => formatPersistedArtifact(artifact));
}

export async function listRecentPersistedArtifacts(workspaceSlug: string, take = 3) {
  const artifacts = await listPersistedArtifacts(workspaceSlug);
  return artifacts.slice(0, take);
}

export async function listArtifactsForWorkspace(workspaceSlug: string) {
  await syncLocalArtifactsForDevelopment();
  return listPersistedArtifacts(workspaceSlug);
}

export async function listRecentArtifactsForWorkspace(workspaceSlug: string, take = 3) {
  const artifacts = await listArtifactsForWorkspace(workspaceSlug);
  return artifacts.slice(0, take);
}

export function getArtifactNoticeForWorkspace(artifacts: PersistedArtifact[]) {
  if (!ALLOW_LOCAL_ARTIFACT_SYNC) {
    return null;
  }

  if (!artifacts.length) {
    return "Modo híbrido de desenvolvimento: fallback local do agents-lab habilitado apenas para bootstrap local.";
  }

  if (artifacts.some((artifact) => artifact.sourceSystem === "agents-lab-local")) {
    return "Parte dos artifacts exibidos vem do fallback local de desenvolvimento.";
  }

  return null;
}
