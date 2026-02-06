import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { db } from '../db';
import { users, sessions } from '../db/schema';
import { eq } from 'drizzle-orm';

const SALT_ROUNDS = 10;
const SESSION_EXPIRY_DAYS = 30;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
    return randomBytes(32).toString('base64url');
}

/**
 * Generate a secure verification token
 */
export function generateVerificationToken(): string {
    return randomBytes(32).toString('base64url');
}

/**
 * Create a new patient user account
 */
export async function createPatientUser(data: {
    email: string;
    password: string;
    name: string;
    cpf?: string;
    phone?: string;
}): Promise<{ userId: string; sessionToken: string }> {
    // Hash password
    const passwordHash = await hashPassword(data.password);
    const verificationToken = generateVerificationToken();

    // Create user
    const [user] = await db.insert(users).values({
        email: data.email,
        name: data.name,
        cpf: data.cpf,
        phone: data.phone,
        role: 'patient',
        passwordHash,
        emailVerified: false,
        verificationToken,
        clerkId: `patient_${randomBytes(16).toString('hex')}`, // Placeholder for compatibility
    }).returning();

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

    await db.insert(sessions).values({
        userId: user.clerkId,
        token: sessionToken,
        expiresAt,
    });

    return {
        userId: user.clerkId,
        sessionToken,
    };
}

/**
 * Validate a session token and return user
 */
export async function validateSession(token: string) {
    const session = await db.query.sessions.findFirst({
        where: eq(sessions.token, token),
        with: {
            user: true,
        },
    });

    if (!session) {
        return null;
    }

    // Check if expired
    if (new Date() > new Date(session.expiresAt)) {
        // Delete expired session
        await db.delete(sessions).where(eq(sessions.token, token));
        return null;
    }

    return session.user;
}

/**
 * Invalidate a session (logout)
 */
export async function invalidateSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(email: string, password: string): Promise<{ user: any; sessionToken: string } | null> {
    // Find user by email
    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!user || !user.passwordHash) {
        return null;
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
        return null;
    }

    // Create new session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

    await db.insert(sessions).values({
        userId: user.clerkId,
        token: sessionToken,
        expiresAt,
    });

    return {
        user: {
            id: user.id,
            clerkId: user.clerkId,
            email: user.email,
            name: user.name,
            role: user.role,
        },
        sessionToken,
    };
}

/**
 * Generate password reset token
 */
export async function generatePasswordResetToken(email: string): Promise<string | null> {
    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!user) {
        return null;
    }

    const resetToken = generateVerificationToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    await db.update(users)
        .set({
            resetPasswordToken: resetToken,
            resetPasswordExpires: expiresAt,
        })
        .where(eq(users.id, user.id));

    return resetToken;
}

/**
 * Reset password using token
 */
export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await db.query.users.findFirst({
        where: eq(users.resetPasswordToken, token),
    });

    if (!user || !user.resetPasswordExpires) {
        return false;
    }

    // Check if token expired
    if (new Date() > new Date(user.resetPasswordExpires)) {
        return false;
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password and clear reset token
    await db.update(users)
        .set({
            passwordHash,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        })
        .where(eq(users.id, user.id));

    return true;
}
