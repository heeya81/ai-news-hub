import prisma from '../lib/prisma.js';
import { fetchAINews, filterNewsByKeywords, DEFAULT_NEWS_SOURCES } from './newsService.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateDailyReports() {
    console.log('🌅 Starting daily AI report generation...');

    // 1. Get all active users
    const users = await prisma.user.findMany({
        include: { profile: true }
    });

    for (const user of users) {
        if (!user.profile) continue;

        try {
            const keywords = JSON.parse(user.profile.keywords as string || '[]');
            const sources = JSON.parse(user.profile.sources as string || '[]');

            // 2. Fetch news
            const rawNews = await fetchAINews(sources.length > 0 ? sources : DEFAULT_NEWS_SOURCES);

            // 3. Filter by keywords
            const relevantNews = filterNewsByKeywords(rawNews, keywords).slice(0, 10);

            if (relevantNews.length === 0) {
                console.log(`Skipping user ${user.email}: No relevant news found.`);
                continue;
            }

            // 4. Generate AI Summary using Gemini
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                You are a premium AI news curation assistant. 
                Below is a list of news items relevant to the user's interests: ${keywords.join(', ')}.
                
                Please write a "Daily AI Intelligence Report" for this user.
                The report should:
                1. Have a catchy, professional title.
                2. Provide a cohesive summary of the most important trends found in these articles.
                3. Briefly explain why these articles matter for the user's specific interests.
                4. Be written in a premium, insightful tone.
                5. Use Markdown formatting.
                6. Translate the final report into ${user.profile.notificationTime === 9 ? 'Korean' : 'English'} (Default to Korean if unsure).
                
                Articles:
                ${relevantNews.map((n, i) => `[${i + 1}] ${n.title}: ${n.content}`).join('\n\n')}
            `;

            const result = await model.generateContent(prompt);
            const reportText = result.response.text();

            // 5. Store in DB
            await (prisma as any).dailyReport.create({
                data: {
                    userId: user.id,
                    title: `Intelligence Report: ${new Date().toLocaleDateString()}`,
                    content: reportText,
                    date: new Date()
                }
            });

            console.log(`✅ Generated daily report for ${user.email}`);

        } catch (error) {
            console.error(`Failed to generate report for ${user.email}:`, error);
        }
    }

    console.log('✨ Daily report generation completed.');
}
