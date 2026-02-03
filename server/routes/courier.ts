import { Hono } from 'hono';
import { db } from '../db';
import { orders, courierProfiles, organizations } from '../db/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { filterByDistance } from '../utils/geolocation';
import type { UserSession } from '../../types';

const courierRoute = new Hono<{ Variables: { userId: string; clerkId: string; session?: UserSession } }>();

// Apply auth middleware to all routes
courierRoute.use('*', authMiddleware);

/**
 * GET /api/courier/jobs
 * Fetch available delivery jobs near the courier's location
 */
courierRoute.get('/jobs', async (c) => {
    const userId = Number(c.get('userId'));

    // TODO: Get capabilities from session once auth middleware is updated
    // For now, assume user with courier profile can access
    // if (!session?.capabilities.isCourier) {
    //     return c.json({ error: 'Unauthorized: Courier profile required' }, 403);
    // }

    // Get courier's current location
    const [courierProfile] = await db
        .select()
        .from(courierProfiles)
        .where(eq(courierProfiles.userId, userId));

    if (!courierProfile || !courierProfile.latitude || !courierProfile.longitude) {
        return c.json({
            error: 'Location required. Please enable location services.',
            jobs: []
        }, 400);
    }

    const courierLat = parseFloat(courierProfile.latitude);
    const courierLon = parseFloat(courierProfile.longitude);

    // Fetch available jobs (ready for pickup, no courier assigned)
    const availableOrders = await db
        .select({
            id: orders.id,
            description: orders.description,
            status: orders.status,
            pickupAddress: organizations.address,
            pickupLat: organizations.latitude,
            pickupLon: organizations.longitude,
            pickupOrgName: organizations.name,
            deliveryFee: orders.deliveryFee,
            createdAt: orders.createdAt,
        })
        .from(orders)
        .leftJoin(organizations, eq(orders.labId, organizations.id))
        .where(
            and(
                eq(orders.status, 'READY_FOR_PICKUP'),
                isNull(orders.courierId)
            )
        );

    // Filter by distance (within 50km)
    const nearbyJobs = filterByDistance(
        availableOrders.map(order => ({
            ...order,
            latitude: order.pickupLat,
            longitude: order.pickupLon,
        })),
        courierLat,
        courierLon,
        50 // 50km radius
    );

    return c.json({
        jobs: nearbyJobs.map(job => ({
            id: job.id,
            description: job.description,
            pickupLocation: {
                name: job.pickupOrgName,
                address: job.pickupAddress,
                latitude: job.pickupLat,
                longitude: job.pickupLon,
            },
            deliveryFee: job.deliveryFee,
            distance: job.distance,
            createdAt: job.createdAt,
        })),
        courierLocation: {
            latitude: courierLat,
            longitude: courierLon,
        }
    });
});

/**
 * POST /api/courier/accept
 * Accept a delivery job
 */
courierRoute.post('/accept', async (c) => {
    const userId = c.get('userId');
    const { orderId } = await c.req.json();

    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 403);
    }

    if (!orderId) {
        return c.json({ error: 'Order ID required' }, 400);
    }

    // Check if order is still available
    const [order] = await db
        .select()
        .from(orders)
        .where(
            and(
                eq(orders.id, orderId),
                eq(orders.status, 'READY_FOR_PICKUP'),
                isNull(orders.courierId)
            )
        );

    if (!order) {
        return c.json({ error: 'Order not available or already assigned' }, 404);
    }

    // Generate pickup and delivery codes
    const pickupCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const deliveryCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Assign courier to order
    const [updatedOrder] = await db
        .update(orders)
        .set({
            courierId: parseInt(userId),
            status: 'DRIVER_ASSIGNED',
            pickupCode,
            deliveryCode,
        })
        .where(eq(orders.id, orderId))
        .returning();

    return c.json({
        success: true,
        order: {
            id: updatedOrder.id,
            status: updatedOrder.status,
            pickupCode,
            deliveryCode,
        },
        message: 'Corrida aceita com sucesso!'
    });
});

/**
 * POST /api/courier/update-location
 * Update courier's real-time location
 */
courierRoute.post('/update-location', async (c) => {
    const userId = c.get('userId');
    const { latitude, longitude } = await c.req.json();

    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 403);
    }

    if (!latitude || !longitude) {
        return c.json({ error: 'Latitude and longitude required' }, 400);
    }

    // Update courier location
    await db
        .update(courierProfiles)
        .set({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            lastLocationUpdate: new Date(),
        })
        .where(eq(courierProfiles.userId, parseInt(userId)));

    return c.json({ success: true });
});

/**
 * POST /api/courier/toggle-online
 * Toggle courier online/offline status
 */
courierRoute.post('/toggle-online', async (c) => {
    const userId = c.get('userId');

    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 403);
    }

    const [profile] = await db
        .select()
        .from(courierProfiles)
        .where(eq(courierProfiles.userId, parseInt(userId)));

    if (!profile) {
        return c.json({ error: 'Courier profile not found' }, 404);
    }

    const [updated] = await db
        .update(courierProfiles)
        .set({ isOnline: !profile.isOnline })
        .where(eq(courierProfiles.userId, parseInt(userId)))
        .returning();

    return c.json({
        success: true,
        isOnline: updated.isOnline,
    });
});

export default courierRoute;
