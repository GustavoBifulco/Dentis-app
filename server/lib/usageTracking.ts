import { db } from '../db';
import { aiUsage, whatsappUsage } from '../db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

/**
 * Usage Quotas (Free Tier Defaults)
 * Can be overridden per organization via subscriptions table
 */
export const DEFAULT_QUOTAS = {
    // AI Assistant
    AI_TOKENS_PER_MONTH: 100_000, // ~$0.20 with GPT-3.5-turbo
    AI_REQUESTS_PER_DAY: 100,

    // WhatsApp
    WHATSAPP_MESSAGES_PER_DAY: 50,
    WHATSAPP_MESSAGES_PER_MONTH: 1000,
};

/**
 * Cost Estimates (USD)
 */
const COST_PER_1K_TOKENS = 0.002; // GPT-3.5-turbo average
const COST_PER_WHATSAPP_MESSAGE = 0.005; // Approximate

/**
 * Check if organization has exceeded AI quota
 * @throws Error if quota exceeded
 */
export async function checkAIQuota(organizationId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split('T')[0];

    // Check daily request limit
    const dailyUsage = await db
        .select({
            totalRequests: sql<number>`SUM(${aiUsage.requestCount})`,
        })
        .from(aiUsage)
        .where(
            and(
                eq(aiUsage.organizationId, organizationId),
                eq(aiUsage.date, today)
            )
        );

    const dailyRequests = Number(dailyUsage[0]?.totalRequests || 0);
    if (dailyRequests >= DEFAULT_QUOTAS.AI_REQUESTS_PER_DAY) {
        throw new Error(
            `Limite diário de requisições ao assistente de IA atingido (${DEFAULT_QUOTAS.AI_REQUESTS_PER_DAY}/dia). Tente novamente amanhã.`
        );
    }

    // Check monthly token limit
    const monthlyUsage = await db
        .select({
            totalTokens: sql<number>`SUM(${aiUsage.tokensUsed})`,
        })
        .from(aiUsage)
        .where(
            and(
                eq(aiUsage.organizationId, organizationId),
                gte(aiUsage.date, firstDayOfMonth)
            )
        );

    const monthlyTokens = Number(monthlyUsage[0]?.totalTokens || 0);
    if (monthlyTokens >= DEFAULT_QUOTAS.AI_TOKENS_PER_MONTH) {
        throw new Error(
            `Limite mensal de tokens do assistente de IA atingido (${DEFAULT_QUOTAS.AI_TOKENS_PER_MONTH.toLocaleString()} tokens/mês). Atualize seu plano para continuar.`
        );
    }
}

/**
 * Log AI usage after successful request
 */
export async function logAIUsage(
    organizationId: string,
    userId: string,
    tokensUsed: number,
    model: string = 'gpt-3.5-turbo'
): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const estimatedCost = (tokensUsed / 1000) * COST_PER_1K_TOKENS;

    // Upsert: increment if record exists for today, otherwise create
    await db
        .insert(aiUsage)
        .values({
            organizationId,
            userId,
            date: today,
            tokensUsed,
            requestCount: 1,
            estimatedCost: estimatedCost.toString(),
            model,
        })
        .onConflictDoUpdate({
            target: [aiUsage.organizationId, aiUsage.userId, aiUsage.date],
            set: {
                tokensUsed: sql`${aiUsage.tokensUsed} + ${tokensUsed}`,
                requestCount: sql`${aiUsage.requestCount} + 1`,
                estimatedCost: sql`${aiUsage.estimatedCost} + ${estimatedCost}`,
            },
        });
}

/**
 * Check if organization has exceeded WhatsApp quota
 * @throws Error if quota exceeded
 */
export async function checkWhatsAppQuota(organizationId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split('T')[0];

    // Check daily limit
    const dailyUsage = await db
        .select({
            totalMessages: sql<number>`SUM(${whatsappUsage.messagesSent})`,
        })
        .from(whatsappUsage)
        .where(
            and(
                eq(whatsappUsage.organizationId, organizationId),
                eq(whatsappUsage.date, today)
            )
        );

    const dailyMessages = Number(dailyUsage[0]?.totalMessages || 0);
    if (dailyMessages >= DEFAULT_QUOTAS.WHATSAPP_MESSAGES_PER_DAY) {
        throw new Error(
            `Limite diário de mensagens WhatsApp atingido (${DEFAULT_QUOTAS.WHATSAPP_MESSAGES_PER_DAY}/dia). Tente novamente amanhã.`
        );
    }

    // Check monthly limit
    const monthlyUsage = await db
        .select({
            totalMessages: sql<number>`SUM(${whatsappUsage.messagesSent})`,
        })
        .from(whatsappUsage)
        .where(
            and(
                eq(whatsappUsage.organizationId, organizationId),
                gte(whatsappUsage.date, firstDayOfMonth)
            )
        );

    const monthlyMessages = Number(monthlyUsage[0]?.totalMessages || 0);
    if (monthlyMessages >= DEFAULT_QUOTAS.WHATSAPP_MESSAGES_PER_MONTH) {
        throw new Error(
            `Limite mensal de mensagens WhatsApp atingido (${DEFAULT_QUOTAS.WHATSAPP_MESSAGES_PER_MONTH}/mês). Atualize seu plano para continuar.`
        );
    }
}

/**
 * Log WhatsApp usage after sending message
 */
export async function logWhatsAppUsage(
    organizationId: string,
    userId: string,
    messageCount: number = 1,
    campaignId?: number
): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const estimatedCost = messageCount * COST_PER_WHATSAPP_MESSAGE;

    await db
        .insert(whatsappUsage)
        .values({
            organizationId,
            userId,
            date: today,
            messagesSent: messageCount,
            estimatedCost: estimatedCost.toString(),
            campaignId,
        })
        .onConflictDoUpdate({
            target: [whatsappUsage.organizationId, whatsappUsage.userId, whatsappUsage.date],
            set: {
                messagesSent: sql`${whatsappUsage.messagesSent} + ${messageCount}`,
                estimatedCost: sql`${whatsappUsage.estimatedCost} + ${estimatedCost}`,
            },
        });
}

/**
 * Get current month usage stats for organization
 */
export async function getUsageStats(organizationId: string) {
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split('T')[0];

    const [aiStats] = await db
        .select({
            totalTokens: sql<number>`COALESCE(SUM(${aiUsage.tokensUsed}), 0)`,
            totalRequests: sql<number>`COALESCE(SUM(${aiUsage.requestCount}), 0)`,
            totalCost: sql<number>`COALESCE(SUM(${aiUsage.estimatedCost}), 0)`,
        })
        .from(aiUsage)
        .where(
            and(
                eq(aiUsage.organizationId, organizationId),
                gte(aiUsage.date, firstDayOfMonth)
            )
        );

    const [whatsappStats] = await db
        .select({
            totalMessages: sql<number>`COALESCE(SUM(${whatsappUsage.messagesSent}), 0)`,
            totalCost: sql<number>`COALESCE(SUM(${whatsappUsage.estimatedCost}), 0)`,
        })
        .from(whatsappUsage)
        .where(
            and(
                eq(whatsappUsage.organizationId, organizationId),
                gte(whatsappUsage.date, firstDayOfMonth)
            )
        );

    return {
        ai: {
            tokensUsed: Number(aiStats?.totalTokens || 0),
            tokensLimit: DEFAULT_QUOTAS.AI_TOKENS_PER_MONTH,
            tokensRemaining: DEFAULT_QUOTAS.AI_TOKENS_PER_MONTH - Number(aiStats?.totalTokens || 0),
            requestsUsed: Number(aiStats?.totalRequests || 0),
            estimatedCost: Number(aiStats?.totalCost || 0),
        },
        whatsapp: {
            messagesUsed: Number(whatsappStats?.totalMessages || 0),
            messagesLimit: DEFAULT_QUOTAS.WHATSAPP_MESSAGES_PER_MONTH,
            messagesRemaining: DEFAULT_QUOTAS.WHATSAPP_MESSAGES_PER_MONTH - Number(whatsappStats?.totalMessages || 0),
            estimatedCost: Number(whatsappStats?.totalCost || 0),
        },
        totalEstimatedCost: Number(aiStats?.totalCost || 0) + Number(whatsappStats?.totalCost || 0),
    };
}
