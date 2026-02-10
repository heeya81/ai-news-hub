import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { NewsItem, NewsSource, DEFAULT_NEWS_SOURCES } from '@/lib/news';

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
    },
    timeout: 10000, // 10 seconds timeout
});

/**
 * Fetch AI news from multiple RSS sources
 */
export async function fetchAINews(sources: NewsSource[] = DEFAULT_NEWS_SOURCES): Promise<NewsItem[]> {
    const logPath = path.join(process.cwd(), 'news-debug.log');
    const log = (msg: string) => {
        try {
            const timestamp = new Date().toISOString();
            fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
            console.log(`[NewsFetcher] ${msg}`);
        } catch (e) {
            console.error('Failed to write to log file:', e);
        }
    };

    log(`Starting fetchAINews with ${sources.length} sources...`);
    const allNews: NewsItem[] = [];

    for (const source of sources) {
        try {
            log(`Fetching from: ${source.name} (${source.url})`);
            const feed = await parser.parseURL(source.url);

            if (!feed || !feed.items) {
                log(`WARNING: Empty feed returned from ${source.name}`);
                continue;
            }

            log(`Successfully fetched ${feed.items.length} items from ${source.name}`);

            const items = feed.items.map((item) => ({
                title: item.title || 'No Title',
                link: item.link || '#',
                pubDate: item.pubDate || new Date().toISOString(),
                content: item.contentSnippet || item.content || '',
                source: source.name,
            }));
            allNews.push(...items);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            log(`ERROR fetching from ${source.name}: ${errorMessage}`);
        }
    }

    log(`Total news items fetched: ${allNews.length}`);

    // Sort by date (newest first)
    return allNews.sort((a, b) =>
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
}
