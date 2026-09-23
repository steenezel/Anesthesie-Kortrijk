/** Client-safe content types (avoid importing Drizzle schema into the browser bundle). */

export const bookmarkItemTypes = ["protocol", "block", "pocus", "calculator"] as const;
export type BookmarkItemType = (typeof bookmarkItemTypes)[number];

export const noteTargetTypes = ["protocol", "block", "general"] as const;
export type NoteTargetType = (typeof noteTargetTypes)[number];

export const auditActions = ["created", "updated", "published", "deleted"] as const;
export type AuditAction = (typeof auditActions)[number];

export const auditResourceTypes = ["protocol", "block", "pocus", "journal_club"] as const;
export type AuditResourceType = (typeof auditResourceTypes)[number];
