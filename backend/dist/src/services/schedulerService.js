import cron from 'node-cron';
import prisma from '../lib/prisma.js';
import { fetchAINews, getRecentNews, filterNewsByKeywords } from './newsService.js';
import { analyzeNewsRelevance } from './aiService.js';
import { sendPushNotification } from './notificationService.js';
import { generateDailyReports } from './reportService.js';
export function initScheduler() {
    // 1. Hourly news check & push notifications
    // Run at minute 0 of every hour
    cron.schedule('0 * * * *', async () => {
        console.log('⏰ Running Hourly Notification Task:', new Date().toLocaleString());
        await processNotifications();
    });
    // 2. Daily AI Report generation
    // Run at 05:00 AM every day
    cron.schedule('0 5 * * *', async () => {
        console.log('🌅 Running Daily AI Report Generation:', new Date().toLocaleString());
        await generateDailyReports();
    });
    console.log('🚀 Scheduler initialized (Hourly Notifications + Daily AI Reports)');
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
        for (const user of usersToNotify) {
            if (!user.profile)
                continue;
            const keywords = user.profile.keywords ? (JSON.parse(user.profile.keywords)) : [];
            const sources = user.profile.sources ? (JSON.parse(user.profile.sources)) : null;
            // Fetch and filter news
            const rawNews = await fetchAINews(sources || undefined);
            const recentNews = getRecentNews(rawNews, 24); // 24-hour window
            let filteredNews = filterNewsByKeywords(recentNews, keywords);
            if (keywords.length > 0 && filteredNews.length > 0) {
                // AI Analysis for the top candidates
                try {
                    const aiResults = await analyzeNewsRelevance(filteredNews.slice(0, 5).map(i => ({ title: i.title, content: i.content })), keywords);
                    if (aiResults && aiResults.length > 0) {
                        const topResult = aiResults.sort((a, b) => b.relevanceScore - a.relevanceScore)[0];
                        if (topResult && topResult.relevanceScore >= 70) {
                            const item = filteredNews[topResult.index];
                            if (item) {
                                await sendPushNotification(user.id, `💎 AI 추천: ${item.title}`, `${item.source}: ${topResult.reason}`, '/dashboard');
                                await prisma.profile.update({
                                    where: { userId: user.id },
                                    data: { lastNotifiedAt: new Date() }
                                });
                                continue;
                            }
                        }
                    }
                }
                catch (e) {
                    console.error('AI Analysis failed in scheduler:', e);
                }
            }
            // Fallback
            if (filteredNews.length > 0) {
                const item = filteredNews[0];
                await sendPushNotification(user.id, `📰 오늘 필수 AI 뉴스: ${item?.title}`, `${item?.source}에서 전해드리는 소식입니다.`, '/dashboard');
                await prisma.profile.update({
                    where: { userId: user.id },
                    data: { lastNotifiedAt: new Date() }
                });
            }
        }
    }
    catch (error) {
        console.error('Scheduler Error:', error);
    }
}
