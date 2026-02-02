/**
 * Geolocation utilities for distance calculations
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

/**
 * Filter items by distance from a point
 * @param items Array of items with latitude and longitude
 * @param centerLat Center point latitude
 * @param centerLon Center point longitude
 * @param maxDistanceKm Maximum distance in kilometers
 * @returns Filtered and sorted items with distance property
 */
export function filterByDistance<T extends { latitude: string | null; longitude: string | null }>(
    items: T[],
    centerLat: number,
    centerLon: number,
    maxDistanceKm: number = 50
): Array<T & { distance: number }> {
    return items
        .map((item) => {
            if (!item.latitude || !item.longitude) {
                return null;
            }

            const distance = calculateDistance(
                centerLat,
                centerLon,
                parseFloat(item.latitude),
                parseFloat(item.longitude)
            );

            return {
                ...item,
                distance,
            };
        })
        .filter((item): item is T & { distance: number } => item !== null && item.distance <= maxDistanceKm)
        .sort((a, b) => a.distance - b.distance);
}
