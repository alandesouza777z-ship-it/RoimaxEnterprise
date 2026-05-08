import { NextResponse } from "next/server";

import { ingestRemoteArtifact } from "@/lib/queries/agents-lab-artifacts";

const INGEST_TOKEN = process.env.ARTIFACT_INGEST_TOKEN;

type ArtifactPayload = {
  sourcePath?: string;
  sourceSystem?: string;
  fileName?: string;
  title?: string;
  fileType?: string;
  artifactType?: string;
  preview?: string;
  workspaceSlug?: string;
  offerSlug?: string | null;
  storageKey?: string | null;
  publicUrl?: string | null;
  generatedAt?: string | null;
  metadata?: unknown;
};

function isAuthorized(request: Request) {
  if (!INGEST_TOKEN) {
    return false;
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }

  return authHeader.slice("Bearer ".length) === INGEST_TOKEN;
}

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function serverMisconfiguredResponse() {
  return NextResponse.json({ error: "ARTIFACT_INGEST_TOKEN not configured." }, { status: 500 });
}

function badRequestResponse(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isOptionalString(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || typeof value === "string";
}

function isValidIsoDate(value: string | null | undefined) {
  if (!value) {
    return true;
  }

  return !Number.isNaN(new Date(value).getTime());
}

function getPayloadError(payload: ArtifactPayload) {
  if (
    !isNonEmptyString(payload.sourcePath) ||
    !isNonEmptyString(payload.fileName) ||
    !isNonEmptyString(payload.title) ||
    !isNonEmptyString(payload.fileType) ||
    !isNonEmptyString(payload.artifactType) ||
    !isNonEmptyString(payload.workspaceSlug)
  ) {
    return "Campos obrigatórios ausentes para ingestão de artifact.";
  }

  if (!isOptionalString(payload.sourceSystem) || !isOptionalString(payload.offerSlug)) {
    return "Campos opcionais de texto inválidos.";
  }

  if (!isOptionalString(payload.storageKey) || !isOptionalString(payload.publicUrl)) {
    return "storageKey/publicUrl devem ser string, null ou ausentes.";
  }

  if (!isValidIsoDate(payload.generatedAt)) {
    return "generatedAt deve ser uma data ISO válida.";
  }

  return null;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/artifacts/ingest",
    auth: "bearer",
    requiredEnv: ["ARTIFACT_INGEST_TOKEN"],
    requiredFields: ["sourcePath", "fileName", "title", "fileType", "artifactType", "workspaceSlug"],
    optionalFields: ["sourceSystem", "offerSlug", "storageKey", "publicUrl", "generatedAt", "metadata", "preview"],
  });
}

export async function POST(request: Request) {
  if (!INGEST_TOKEN) {
    return serverMisconfiguredResponse();
  }

  if (!isAuthorized(request)) {
    return unauthorizedResponse();
  }

  let payload: ArtifactPayload;

  try {
    payload = (await request.json()) as ArtifactPayload;
  } catch {
    return badRequestResponse("Body JSON inválido para ingestão de artifact.");
  }

  const payloadError = getPayloadError(payload);

  if (payloadError) {
    return badRequestResponse(payloadError);
  }

  await ingestRemoteArtifact({
    sourcePath: payload.sourcePath!.trim(),
    sourceSystem: payload.sourceSystem?.trim() || undefined,
    fileName: payload.fileName!.trim(),
    title: payload.title!.trim(),
    fileType: payload.fileType!.trim(),
    artifactType: payload.artifactType!.trim(),
    preview: typeof payload.preview === "string" ? payload.preview : undefined,
    workspaceSlug: payload.workspaceSlug!.trim(),
    offerSlug: typeof payload.offerSlug === "string" ? payload.offerSlug.trim() || null : payload.offerSlug,
    storageKey: typeof payload.storageKey === "string" ? payload.storageKey.trim() || null : payload.storageKey,
    publicUrl: typeof payload.publicUrl === "string" ? payload.publicUrl.trim() || null : payload.publicUrl,
    generatedAt: payload.generatedAt ?? undefined,
    metadata: payload.metadata,
  });

  return NextResponse.json({ ok: true });
}
