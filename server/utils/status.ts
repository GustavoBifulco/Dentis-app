export type LockableEntity = {
    status?: string | null;
    signedAt?: Date | string | null;
    lockedAt?: Date | string | null;
};

/**
 * P1. Status/Lock Pillar
 * Determines if an entity can be edited based on its status.
 * Returns true if editable, false if locked.
 */
export const canEdit = (entity: LockableEntity): boolean => {
    if (!entity.status) return true; // No status, assume editable (legacy)

    const lockedStatuses = ['signed', 'locked', 'void', 'canceled'];
    if (lockedStatuses.includes(entity.status.toLowerCase())) {
        return false;
    }

    return true;
};

/**
 * Returns a user-friendly reason why the entity is locked.
 */
export const getLockReason = (entity: LockableEntity): string | null => {
    if (canEdit(entity)) return null;
    return `Record is ${entity.status} and cannot be modified. Use Addendum instead.`;
};
