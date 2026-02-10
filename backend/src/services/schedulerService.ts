import cron from 'node-cron';
import prisma from '../lib/prisma.js';
import { fetchAINews, getRecentNews, filterNewsByKeywords } from './newsService.js';
import { analyzeNewsRelevance } from './aiService.js';
import { sendPushNotification } from './notificationService.js';

export function initScheduler() {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
        console.log('⏰ Running Scheduled Notification Task:', new Date().toLocaleString());
        await processNotifications();
    });
}

async function processNotifications() {
    try {
        const currentHour = new Date().getHours();

        // 1. Find users who should be notified this hour
        const usersToNotify = await prisma.user.findMany({
            where: {
                profile: {
                    notificationTime: currentHour
                }
            },
            include: {
                profile: true
            }
        });

        if (usersToNotify.length === 0) {
            console.log('No users to notify for this hour.');
            return;
        }

        console.log(`Processing notifications for ${usersToNotify.length} users...`);

        // To optimize, we could fetch news once per unique set of sources, 
        // but for now, we'll process each user (or group them).

        for (const user of usersToNotify) {
            if (!user.profile) continue;

            const keywords = user.profile.keywords ? (user.profile.keywords as string[]) : [];
            const sources = user.profile.sources ? (user.profile.sources as any[]) : null;

            // Fetch and filter news
            // We use a 24-hour window for the daily digest
            const rawNews = await fetchAINews(sources || undefined);
            const recentNews = getRecentNews(rawNews, 24);

            let filteredNews = filteredNewsByKeywords(recentNews, keywords);

            if (keywords.length > 0 && filteredNews.length > 0) {
                // Optional: AI Analysis for the top candidates
                try {
                    const aiResults = await analyzeNewsRelevance(
                        filteredNews.slice(0, 5).map(i => ({ title: i.title, content: i.content })),
                        keywords
                    );

                    if (aiResults && aiResults.length > 0) {
                        const topResult = aiResults.sort((a, b) => b.relevanceScore - a.relevanceScore)[0];
                        if (topResult && topResult.relevanceScore >= 70) {
                            const item = filteredNews[topResult.index];
                            if (item) {
                                await sendPushNotification(
                                    user.id,
                                    `💎 AI 추천: ${item.title}`,
                                    `${item.source}: ${topResult.reason}`,
                                    '/dashboard'
                                );

                                // Update lastNotifiedAt
                                await prisma.profile.update({
                                    where: { userId: user.id },
                                    data: { lastNotifiedAt: new Date() }
                                });
                                continue;
                            }
                        }
                    }
                } catch (e) {
                    console.error('AI Analysis failed in scheduler:', e);
                }
            }

            // Fallback: If no AI match or AI failed, send the top recent news
            if (filteredNews.length > 0) {
                const item = filteredNews[0];
                await sendPushNotification(
                    user.id,
                    `📰 오늘 필수 AI 뉴스: ${item?.title}`,
                    `${item?.source}에서 전해드리는 소식입니다.`,
                    '/dashboard'
                );

                await prisma.profile.update({
                    where: { userId: user.id },
                    data: { lastNotifiedAt: new Date() }
                });
            }
        }

    } catch (error) {
        console.error('Scheduler Error:', error);
    }
}

// Typo fix helper from current newsService
function filteredNewsByKeywords(news: any[], keywords: string[]) {
    if (!keywords || keywords.length === 0) return news.slice(0, 5);
    return news.filter(item =>
        keywords.some(k =>
            item.title.toLowerCase().includes(k.toLowerCase()) ||
            item.content.toLowerCase().includes(k.toLowerCase())
        )
    );
}
