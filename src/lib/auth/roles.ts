import { UserRole } from "@prisma/client";

export const OPERATIONAL_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.EXECUTIVE,
  UserRole.OPERATOR,
];

export function isAdminRole(role: UserRole) {
  return role === UserRole.ADMIN;
}

export function isOperationalRole(role: UserRole) {
  return OPERATIONAL_ROLES.includes(role);
}
