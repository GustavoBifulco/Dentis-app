import { Hono } from 'hono';
import { authRateLimit } from '../middleware/rateLimit';
import { authenticateUser, invalidateSession, generatePasswordResetToken, resetPassword } from '../services/auth-service';

const app = new Hono();

// POST /api/patient-auth/login
// Authenticate patient with email and password
app.post('/login', authRateLimit, async (c) => {
    try {
        const { email, password } = await c.req.json();

        if (!email || !password) {
            return c.json({ error: 'Email and password required' }, 400);
        }

        const result = await authenticateUser(email, password);

        if (!result) {
            return c.json({ error: 'Invalid email or password' }, 401);
        }

        return c.json({
            success: true,
            user: result.user,
            sessionToken: result.sessionToken,
        });

    } catch (error: any) {
        console.error('Login error:', error);
        return c.json({ error: 'Login failed' }, 500);
    }
});

// POST /api/patient-auth/logout
// Invalidate session token
app.post('/logout', async (c) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader) {
            return c.json({ error: 'No authorization header' }, 401);
        }

        const token = authHeader.replace('Bearer ', '');
        await invalidateSession(token);

        return c.json({ success: true });

    } catch (error: any) {
        console.error('Logout error:', error);
        return c.json({ error: 'Logout failed' }, 500);
    }
});

// GET /api/patient-auth/me
// Get current user from session token
app.get('/me', async (c) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader) {
            return c.json({ error: 'Not authenticated' }, 401);
        }

        const token = authHeader.replace('Bearer ', '');
        const { validateSession } = await import('../services/auth-service');
        const user = await validateSession(token);

        if (!user) {
            return c.json({ error: 'Invalid or expired session' }, 401);
        }

        return c.json({
            user: {
                id: user.id,
                clerkId: user.clerkId,
                email: user.email,
                name: user.name,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
        });

    } catch (error: any) {
        console.error('Get user error:', error);
        return c.json({ error: 'Failed to get user' }, 500);
    }
});

// POST /api/patient-auth/forgot-password
// Generate password reset token
app.post('/forgot-password', authRateLimit, async (c) => {
    try {
        const { email } = await c.req.json();

        if (!email) {
            return c.json({ error: 'Email required' }, 400);
        }

        const resetToken = await generatePasswordResetToken(email);

        if (!resetToken) {
            // Don't reveal if email exists or not (security)
            return c.json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent.',
            });
        }

        // TODO: Send email with reset link
        const resetLink = `${process.env.VITE_APP_URL}/reset-password/${resetToken}`;
        console.log('Password reset link:', resetLink);

        return c.json({
            success: true,
            message: 'Password reset link sent to your email',
            // Remove this in production:
            resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined,
        });

    } catch (error: any) {
        console.error('Forgot password error:', error);
        return c.json({ error: 'Failed to process request' }, 500);
    }
});

// POST /api/patient-auth/reset-password
// Reset password using token
app.post('/reset-password', authRateLimit, async (c) => {
    try {
        const { token, password } = await c.req.json();

        if (!token || !password) {
            return c.json({ error: 'Token and password required' }, 400);
        }

        // Validate password strength
        if (password.length < 8) {
            return c.json({ error: 'Password must be at least 8 characters' }, 400);
        }

        const success = await resetPassword(token, password);

        if (!success) {
            return c.json({ error: 'Invalid or expired reset token' }, 400);
        }

        return c.json({
            success: true,
            message: 'Password reset successfully',
        });

    } catch (error: any) {
        console.error('Reset password error:', error);
        return c.json({ error: 'Failed to reset password' }, 500);
    }
});

export default app;
