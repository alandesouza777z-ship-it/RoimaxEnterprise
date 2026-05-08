import {
  DelegationPriority,
  DelegationStatus,
  OfferPriority,
  OfferStatus,
  OperationWeekday,
  PrismaClient,
  UserRole,
} from "@prisma/client";

import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

const USERS = [
  {
    username: "alan",
    displayName: "Alan",
    role: UserRole.ADMIN,
    workspaceSlug: "alan",
  },
  {
    username: "pedro",
    displayName: "Pedro",
    role: UserRole.EXECUTIVE,
    workspaceSlug: "pedro",
  },
  {
    username: "lucas",
    displayName: "Lucas",
    role: UserRole.OPERATOR,
    workspaceSlug: "lucas",
  },
];

const OFFERS = [
  {
    slug: "protocolo-5-em-30",
    title: "Protocolo 5 em 30",
    status: OfferStatus.ACTIVE,
    priority: OfferPriority.HIGH,
    dueDate: new Date("2026-05-12T12:00:00.000Z"),
    ownerUsername: "pedro",
  },
  {
    slug: "roimax-vsl-core",
    title: "RoiMax VSL Core",
    status: OfferStatus.DRAFT,
    priority: OfferPriority.MEDIUM,
    dueDate: new Date("2026-05-18T12:00:00.000Z"),
    ownerUsername: "alan",
  },
  {
    slug: "proof-stack-estrutura",
    title: "Estrutura de Proof Stack",
    status: OfferStatus.ACTIVE,
    priority: OfferPriority.CRITICAL,
    dueDate: new Date("2026-05-10T12:00:00.000Z"),
    ownerUsername: "lucas",
  },
];

const DELEGATIONS = [
  {
    slug: "revisar-vsl-principal",
    title: "Revisar VSL principal",
    status: DelegationStatus.OPEN,
    priority: DelegationPriority.HIGH,
    dueDate: new Date("2026-05-09T12:00:00.000Z"),
    assigneeUsername: "lucas",
    createdByUsername: "alan",
    offerSlug: "roimax-vsl-core",
  },
  {
    slug: "priorizar-provas-oferta",
    title: "Priorizar provas da oferta",
    status: DelegationStatus.IN_PROGRESS,
    priority: DelegationPriority.CRITICAL,
    dueDate: new Date("2026-05-08T18:00:00.000Z"),
    assigneeUsername: "pedro",
    createdByUsername: "alan",
    offerSlug: "protocolo-5-em-30",
  },
  {
    slug: "aprovar-estrutura-semanal",
    title: "Aprovar estrutura semanal",
    status: DelegationStatus.OPEN,
    priority: DelegationPriority.MEDIUM,
    dueDate: new Date("2026-05-11T12:00:00.000Z"),
    assigneeUsername: "alan",
    createdByUsername: "pedro",
    offerSlug: null,
  },
  {
    slug: "organizar-proof-stack",
    title: "Organizar proof stack final",
    status: DelegationStatus.IN_PROGRESS,
    priority: DelegationPriority.HIGH,
    dueDate: new Date("2026-05-10T15:00:00.000Z"),
    assigneeUsername: "lucas",
    createdByUsername: "pedro",
    offerSlug: "proof-stack-estrutura",
  },
];

const OPERATION_BLOCKS = [
  {
    slug: "alan-revisao-executiva-segunda",
    title: "Revisão executiva da semana",
    weekday: OperationWeekday.MONDAY,
    workspaceSlug: "alan",
    createdByUsername: "alan",
  },
  {
    slug: "pedro-kickoff-oferta-terca",
    title: "Kickoff da oferta principal",
    weekday: OperationWeekday.TUESDAY,
    workspaceSlug: "pedro",
    createdByUsername: "pedro",
  },
  {
    slug: "lucas-revisao-operacional-quarta",
    title: "Revisão operacional prioritária",
    weekday: OperationWeekday.WEDNESDAY,
    workspaceSlug: "lucas",
    createdByUsername: "lucas",
  },
];

function getBootstrapPassword(username: string) {
  return (
    process.env[`ROIMAX_BOOTSTRAP_PASSWORD_${username.toUpperCase()}`] ??
    process.env.ROIMAX_BOOTSTRAP_PASSWORD_DEFAULT ??
    null
  );
}

function getBootstrapPasswordError(username: string) {
  return [
    `Missing bootstrap password for user \"${username}\".`,
    "Set ROIMAX_BOOTSTRAP_PASSWORD_<USERNAME> or ROIMAX_BOOTSTRAP_PASSWORD_DEFAULT before seeding a fresh shared environment.",
  ].join(" ");
}

async function upsertUsers() {
  for (const user of USERS) {
    const existingUser = await prisma.user.findUnique({
      where: { username: user.username },
      select: {
        passwordHash: true,
      },
    });

    const bootstrapPassword = getBootstrapPassword(user.username);
    const passwordHash = bootstrapPassword
      ? await hashPassword(bootstrapPassword)
      : existingUser?.passwordHash ?? null;

    if (!passwordHash) {
      throw new Error(getBootstrapPasswordError(user.username));
    }

    await prisma.user.upsert({
      where: { username: user.username },
      update: {
        displayName: user.displayName,
        role: user.role,
        workspaceSlug: user.workspaceSlug,
        ...(bootstrapPassword ? { passwordHash } : {}),
      },
      create: {
        username: user.username,
        displayName: user.displayName,
        passwordHash,
        role: user.role,
        workspaceSlug: user.workspaceSlug,
      },
    });
  }
}

async function main() {
  await upsertUsers();

  const users = await prisma.user.findMany();
  const usersByUsername = new Map(users.map((user) => [user.username, user]));

  for (const offer of OFFERS) {
    const owner = usersByUsername.get(offer.ownerUsername);

    if (!owner) {
      throw new Error(`Owner not found for offer ${offer.slug}`);
    }

    await prisma.offer.upsert({
      where: { slug: offer.slug },
      update: {
        title: offer.title,
        status: offer.status,
        priority: offer.priority,
        dueDate: offer.dueDate,
        ownerId: owner.id,
      },
      create: {
        slug: offer.slug,
        title: offer.title,
        status: offer.status,
        priority: offer.priority,
        dueDate: offer.dueDate,
        ownerId: owner.id,
      },
    });
  }

  const offers = await prisma.offer.findMany();
  const offersBySlug = new Map(offers.map((offer) => [offer.slug, offer]));

  for (const delegation of DELEGATIONS) {
    const assignee = usersByUsername.get(delegation.assigneeUsername);
    const creator = usersByUsername.get(delegation.createdByUsername);
    const offer = delegation.offerSlug ? offersBySlug.get(delegation.offerSlug) : null;

    if (!assignee || !creator) {
      throw new Error(`User not found for delegation ${delegation.slug}`);
    }

    await prisma.delegation.upsert({
      where: { slug: delegation.slug },
      update: {
        title: delegation.title,
        status: delegation.status,
        priority: delegation.priority,
        dueDate: delegation.dueDate,
        assigneeId: assignee.id,
        createdById: creator.id,
        offerId: offer?.id ?? null,
      },
      create: {
        slug: delegation.slug,
        title: delegation.title,
        status: delegation.status,
        priority: delegation.priority,
        dueDate: delegation.dueDate,
        assigneeId: assignee.id,
        createdById: creator.id,
        offerId: offer?.id ?? null,
      },
    });
  }

  for (const block of OPERATION_BLOCKS) {
    const creator = usersByUsername.get(block.createdByUsername);

    if (!creator) {
      throw new Error(`User not found for operation block ${block.slug}`);
    }

    await prisma.operationBlock.upsert({
      where: { slug: block.slug },
      update: {
        title: block.title,
        weekday: block.weekday,
        workspaceSlug: block.workspaceSlug,
        createdById: creator.id,
      },
      create: {
        slug: block.slug,
        title: block.title,
        weekday: block.weekday,
        workspaceSlug: block.workspaceSlug,
        createdById: creator.id,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
