import { compare, hash } from "bcryptjs";

const SALT_ROUNDS = 10;

export function hashPassword(value: string) {
  return hash(value, SALT_ROUNDS);
}

export function verifyPassword(value: string, passwordHash: string) {
  return compare(value, passwordHash);
}
