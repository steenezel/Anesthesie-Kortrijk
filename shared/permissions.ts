import type { UserRole } from "./schema";

/** Staf mag CMS (protocols, blocks, journals, pocus) bewerken. */
export function canEditCms(role: UserRole | string | null | undefined): boolean {
  return role === "staff" || role === "supervisor" || role === "admin";
}

/** Iedereen behalve kiosk mag technieken in het logboek registreren. */
export function canWriteLogbook(role: UserRole | string | null | undefined): boolean {
  return Boolean(role) && role !== "kiosk";
}

/** Staf mag ASO-logboeken nakijken (niet die van andere staf). */
export function canReviewAsoLogbooks(role: UserRole | string | null | undefined): boolean {
  return role === "staff" || role === "supervisor" || role === "admin";
}

export function isAsoRole(role: UserRole | string | null | undefined): boolean {
  return role === "aso";
}
