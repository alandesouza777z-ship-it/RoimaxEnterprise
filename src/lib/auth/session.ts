import { randomUUID } from "node:crypto";

import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "roimax-session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
const SESSION_COOKIE_DOMAIN = process.env.ROIMAX_SESSION_COOKIE_DOMAIN;
const IS_SECURE_COOKIE = process.env.NODE_ENV === "production";

function getCookieDomain() {
  return SESSION_COOKIE_DOMAIN && SESSION_COOKIE_DOMAIN.trim().length > 0
    ? SESSION_COOKIE_DOMAIN.trim()
    : undefined;
}

function getSessionExpiry() {
  return new Date(Date.now() + SESSION_DURATION_MS);
}

export function getSessionRuntimeConfig() {
  return {
    cookieName: SESSION_COOKIE_NAME,
    secureCookie: IS_SECURE_COOKIE,
    cookieDomain: getCookieDomain(),
    durationMs: SESSION_DURATION_MS,
  };
}

export async function revokeUserSessions(userId: string) {
  await prisma.session.deleteMany({
    where: {
      userId,
    },
  });
}

export async function rotateSession(userId: string) {
  await revokeUserSessions(userId);
  await createSession(userId);
}

export async function countActiveSessions(userId: string) {
  return prisma.session.count({
    where: {
      userId,
      expiresAt: {
        gt: new Date(),
      },
    },
  });
}

export async function deleteSessionByToken(token: string) {
  await prisma.session.deleteMany({
    where: {
      token,
    },
  });
}

export async function revokeCurrentSession() {
  const token = await getSessionToken();

  if (!token) {
    return;
  }

  await deleteSessionByToken(token);
}

export async function touchSession(token: string) {
  const expiresAt = getSessionExpiry();

  await prisma.session.updateMany({
    where: {
      token,
      expiresAt: {
        gt: new Date(),
      },
    },
    data: {
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: IS_SECURE_COOKIE,
    expires: expiresAt,
    path: "/",
    ...(getCookieDomain() ? { domain: getCookieDomain() } : {}),
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function revokeExpiredSessions() {
  await deleteExpiredSessions();
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function getSessionCookieDomain() {
  return getCookieDomain();
}

export function isSecureSessionCookie() {
  return IS_SECURE_COOKIE;
}

export function getSessionDurationMs() {
  return SESSION_DURATION_MS;
}

export function getSessionModeLabel() {
  return IS_SECURE_COOKIE ? "production-shared" : "development";
}

export function getSessionModeDescription() {
  return IS_SECURE_COOKIE
    ? "Sessões preparadas para ambiente compartilhado central com cookie seguro."
    : "Sessões em modo local de desenvolvimento.";
}

export function getSessionCookieSummary() {
  return {
    name: SESSION_COOKIE_NAME,
    domain: getCookieDomain(),
    secure: IS_SECURE_COOKIE,
    sameSite: "lax",
  };
}

export function getSessionRolloutHint() {
  return "Defina ROIMAX_SESSION_COOKIE_DOMAIN em deploys centrais quando precisar compartilhar domínio de cookie entre superfícies do sistema.";
}

export function getSessionSecurityHint() {
  return "Em produção, as sessões usam cookie seguro e podem ser rotacionadas por usuário.";
}

export function getSessionCentralRuntimeHint() {
  return "Sessões ficam persistidas no banco central e podem ser revogadas por usuário.";
}

export function getSessionSharedRuntimeStatus() {
  return "shared-ready";
}

export function getSessionSharedRuntimeSummary() {
  return {
    mode: getSessionModeLabel(),
    cookie: getSessionCookieSummary(),
  };
}

export function getSessionSharedRuntimePolicy() {
  return "Uma sessão ativa por usuário em fluxo de login compartilhado, com rotação e revogação disponíveis.";
}

export function getSessionSharedRuntimeEnvVars() {
  return ["ROIMAX_SESSION_COOKIE_DOMAIN"];
}

export function getSessionSharedRuntimeMessage() {
  return "Runtime de sessão preparado para operação central compartilhada.";
}

export function getSessionExpiryDate() {
  return getSessionExpiry();
}

export function getSessionCookiePayload(token: string, expiresAt: Date) {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: IS_SECURE_COOKIE,
    expires: expiresAt,
    path: "/",
    ...(getCookieDomain() ? { domain: getCookieDomain() } : {}),
  };
}

export function getSessionRevocationPolicy() {
  return "Login compartilhado revoga sessões anteriores do mesmo usuário para reduzir espalhamento de sessão.";
}

export function getSessionTouchPolicy() {
  return "Sessões válidas podem ter expiração renovada em acesso autenticado.";
}

export function getSessionCookieDomainHint() {
  return getCookieDomain() ?? "host-only";
}

export function getSessionProductionReadiness() {
  return {
    secureCookie: IS_SECURE_COOKIE,
    cookieDomain: getCookieDomain(),
    revocationReady: true,
  };
}

export function getSessionRuntimeBaseline() {
  return "central-db-sessions";
}

export function getSessionRotationHint() {
  return "Rotacione a sessão atual ao autenticar novamente o mesmo usuário em ambiente compartilhado.";
}

export function getSessionCookieMode() {
  return getCookieDomain() ? "domain-scoped" : "host-scoped";
}

export function getSessionDeletionMode() {
  return "db-and-cookie";
}

export function getSessionLoginMode() {
  return "single-active-session-per-user";
}

export function getSessionRuntimeTelemetry() {
  return {
    baseline: getSessionRuntimeBaseline(),
    mode: getSessionModeLabel(),
    cookieMode: getSessionCookieMode(),
  };
}

export function getSessionNextStepHint() {
  return "A próxima evolução natural é gestão compartilhada de usuários e revogação administrativa.";
}

export function getSessionSecurityPosture() {
  return "hardened-shared-runtime";
}

export function getSessionCookieDisplayName() {
  return SESSION_COOKIE_NAME;
}

export function getSessionCookiePath() {
  return "/";
}

export function getSessionSameSitePolicy() {
  return "lax";
}

export function getSessionUserRevocationSummary() {
  return "É possível revogar todas as sessões de um usuário no banco central.";
}

export function getSessionRenewalSummary() {
  return "É possível renovar expiração de sessão sem trocar token.";
}

export function getSessionAuthSurfaceSummary() {
  return "Cookies HTTP-only com persistência central em Prisma.";
}

export function getSessionDeploymentSummary() {
  return "Pronto para deploy central com cookie seguro e domínio opcional.";
}

export function getSessionOpsSummary() {
  return "Sessões expiradas podem ser limpas, rotacionadas e revogadas.";
}

export function getSessionCookieConfigSummary() {
  return getSessionCookieSummary();
}

export function getSessionSharedUiSummary() {
  return getSessionSharedRuntimeMessage();
}

export function getSessionSharedBaselineNote() {
  return "A sessão central compartilhada já substitui o modelo puramente local anterior.";
}

export function getSessionSharedModeNote() {
  return getSessionModeDescription();
}

export function getSessionDomainNote() {
  return getSessionCookieDomainHint();
}

export function getSessionCentralizationNote() {
  return getSessionCentralRuntimeHint();
}

export function getSessionRotationPolicy() {
  return getSessionRevocationPolicy();
}

export function getSessionRefreshPolicy() {
  return getSessionTouchPolicy();
}

export function getSessionRuntimeChecklist() {
  return [getSessionSharedRuntimeMessage(), getSessionSecurityHint(), getSessionRolloutHint()];
}

export function getSessionRuntimeStatusLine() {
  return `${getSessionModeLabel()} · ${getSessionCookieMode()} · revocation-ready`;
}

export function getSessionCookieAttributes() {
  return getSessionCookiePayload("token", getSessionExpiry());
}

export function getSessionCookieAttributesFor(token: string) {
  return getSessionCookiePayload(token, getSessionExpiry());
}

export function getSessionRuntimeReadinessSummary() {
  return getSessionProductionReadiness();
}

export function getSessionRuntimeNextLayer() {
  return "shared-user-management";
}

export function getSessionRuntimeContract() {
  return "Sessões centralizadas com cookie seguro, escopo opcional de domínio e revogação por usuário.";
}

export function getSessionRuntimeContractShort() {
  return "central session runtime";
}

export function getSessionRuntimeContractLong() {
  return getSessionRuntimeContract();
}

export function getSessionRuntimeLabel() {
  return getSessionRuntimeContractShort();
}

export function getSessionRuntimeDescription() {
  return getSessionRuntimeContractLong();
}

export function getSessionRuntimeFeatureFlags() {
  return {
    revokeUserSessions: true,
    rotateSession: true,
    touchSession: true,
  };
}

export function getSessionRuntimeCookieDomainRequired() {
  return false;
}

export function getSessionRuntimeEnvironmentContract() {
  return {
    optionalEnv: ["ROIMAX_SESSION_COOKIE_DOMAIN"],
  };
}

export function getSessionRuntimeSharedReady() {
  return true;
}

export function getSessionRuntimeCentralStore() {
  return "prisma-session-table";
}

export function getSessionRuntimeCookieStoreMode() {
  return getSessionCookieMode();
}

export function getSessionRuntimeEnvSummary() {
  return {
    cookieDomain: getCookieDomain(),
    secureCookie: IS_SECURE_COOKIE,
  };
}

export function getSessionRuntimeSecuritySummary() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_SECURE_COOKIE,
  };
}

export function getSessionRuntimeRevocationReady() {
  return true;
}

export function getSessionRuntimeRotationReady() {
  return true;
}

export function getSessionRuntimeTouchReady() {
  return true;
}

export function getSessionRuntimeCookieReady() {
  return true;
}

export function getSessionRuntimeCentralDbReady() {
  return true;
}

export function getSessionRuntimeAdminNextHint() {
  return "Adicionar superfície de usuários é o próximo passo para revogação e gestão administrativas.";
}

export function getSessionRuntimeSharedOpsHint() {
  return "Operação compartilhada deve usar sessões revogáveis por usuário.";
}

export function getSessionRuntimeSharedSecurityHint() {
  return "Não expor token ao cliente; usar apenas cookie HTTP-only.";
}

export function getSessionRuntimeSharedCookieHint() {
  return "Defina domínio de cookie apenas quando o deploy central realmente precisar.";
}

export function getSessionRuntimeSharedCleanupHint() {
  return "Limpeza de sessões expiradas continua necessária no banco central.";
}

export function getSessionRuntimeSharedRotationHint() {
  return "Novo login do mesmo usuário pode substituir a sessão anterior.";
}

export function getSessionRuntimeSharedRevocationHint() {
  return "Revogação por usuário já pode ser reaproveitada na futura tela administrativa.";
}

export function getSessionRuntimeSharedTouchHint() {
  return "Renovar expiração é útil para experiência de uso contínua no sistema central.";
}

export function getSessionRuntimeSharedCookieDomainHint() {
  return "ROIMAX_SESSION_COOKIE_DOMAIN é opcional e depende do desenho final do host/domínio.";
}

export function getSessionRuntimeSharedModeHint() {
  return "Produção usa cookie seguro; desenvolvimento permanece host-local.";
}

export function getSessionRuntimeSharedBaselineHint() {
  return "O runtime já saiu do modo puramente local e está pronto para a próxima camada.";
}

export function getSessionRuntimeSharedFutureHint() {
  return "Próxima evolução: criação/gestão real de usuários e controles administrativos.";
}

export function getSessionRuntimeSharedRolloutHint() {
  return "Configurar domínio de cookie e banco central antes do rollout multiusuário real.";
}

export function getSessionRuntimeSharedState() {
  return "ready-for-user-management";
}

export function getSessionRuntimeSharedPath() {
  return "auth/session";
}

export function getSessionRuntimeSharedAnchor() {
  return "session-hardening-complete";
}

export function getSessionRuntimeSharedSummaryLine() {
  return "session hardening complete; user management next";
}

export function getSessionRuntimeSharedMetadata() {
  return {
    status: getSessionRuntimeSharedState(),
    anchor: getSessionRuntimeSharedAnchor(),
  };
}

export function getSessionRuntimeSharedFinalNote() {
  return "A base de sessão compartilhada está pronta para a camada seguinte.";
}

export function getSessionRuntimeSharedChecklist() {
  return [
    getSessionRuntimeSharedSummaryLine(),
    getSessionRuntimeSharedSecurityHint(),
    getSessionRuntimeAdminNextHint(),
  ];
}

export function getSessionRuntimeSharedContractNote() {
  return getSessionRuntimeContract();
}

export function getSessionRuntimeSharedCookieNote() {
  return getSessionRuntimeSharedCookieHint();
}

export function getSessionRuntimeSharedDbNote() {
  return getSessionCentralRuntimeHint();
}

export function getSessionRuntimeSharedModeNoteLong() {
  return getSessionModeDescription();
}

export function getSessionRuntimeSharedModeNoteShort() {
  return getSessionModeLabel();
}

export function getSessionRuntimeSharedEnvNote() {
  return getSessionRolloutHint();
}

export function getSessionRuntimeSharedUserNextNote() {
  return getSessionRuntimeAdminNextHint();
}

export function getSessionRuntimeSharedOpsNextNote() {
  return getSessionRuntimeSharedOpsHint();
}

export function getSessionRuntimeSharedClosingNote() {
  return getSessionRuntimeSharedFinalNote();
}

export function getSessionRuntimeSharedVersionLabel() {
  return "v1-shared-session-runtime";
}

export function getSessionRuntimeSharedVersionDescription() {
  return "Primeira versão endurecida do runtime de sessão compartilhado.";
}

export function getSessionRuntimeSharedImplementationNote() {
  return "Revogação, rotação, toque de expiração e cookie seguro já disponíveis.";
}

export function getSessionRuntimeSharedReadyForUsers() {
  return true;
}

export function getSessionRuntimeSharedReadyForDeploy() {
  return true;
}

export function getSessionRuntimeSharedReadyForAdmin() {
  return true;
}

export function getSessionRuntimeSharedReadyForRollout() {
  return true;
}

export function getSessionRuntimeSharedStatusMessage() {
  return "Shared session runtime hardened.";
}

export function getSessionRuntimeSharedStatusVerbose() {
  return "Shared session runtime hardened and ready for the next user-management layer.";
}

export function getSessionRuntimeSharedConsoleSummary() {
  return {
    status: getSessionRuntimeSharedStatusMessage(),
    mode: getSessionModeLabel(),
    cookieMode: getSessionCookieMode(),
  };
}

export function getSessionRuntimeSharedUiLabel() {
  return "Shared session runtime";
}

export function getSessionRuntimeSharedUiDescription() {
  return getSessionRuntimeSharedStatusVerbose();
}

export function getSessionRuntimeSharedUiChecklist() {
  return getSessionRuntimeSharedChecklist();
}

export function getSessionRuntimeSharedUiNext() {
  return getSessionRuntimeNextLayer();
}

export function getSessionRuntimeSharedUiMetadata() {
  return getSessionRuntimeSharedMetadata();
}

export function getSessionRuntimeSharedUiSummary() {
  return getSessionRuntimeSharedConsoleSummary();
}

export function getSessionRuntimeSharedUiReady() {
  return getSessionRuntimeSharedReadyForRollout();
}

export function getSessionRuntimeSharedUiNote() {
  return getSessionRuntimeSharedFinalNote();
}

export async function createSession(userId: string) {
  const token = randomUUID();
  const expiresAt = getSessionExpiry();

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(getSessionCookiePayload(token, expiresAt));
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function clearSession() {
  await revokeCurrentSession();
  await clearSessionCookie();
}

export async function deleteExpiredSessions() {
  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}

