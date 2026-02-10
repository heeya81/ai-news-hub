import Parser from 'rss-parser';

export type NewsItem = {
    title: string;
    link: string;
    pubDate: string;
    content: string;
    source: string;
};

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
    },
    timeout: 10000, // 10 seconds timeout
    customFields: {
        item: ['content:encoded', 'description'],
    },
    // Adding custom request options if supported by rss-parser version, 
    // but usually rss-parser doesn't expose underlying request options easily in constructors.
    // However, some versions/forks might. 
});

// Since rss-parser uses Node's http/https under the hood without easy access to the agent in some versions,
// we can set this environment variable for the server process.
if (process.env.NODE_ENV === 'development') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// AI News RSS Feeds
export const DEFAULT_NEWS_SOURCES = [
    { name: 'AI Trends', url: 'https://www.aitrends.com/feed/' },
    { name: 'OpenAI Blog', url: 'https://openai.com/news/rss.xml' },
    { name: 'ZDNet Korea', url: 'https://feeds.feedburner.com/zdkorea' },
    { name: 'Google News (AI)', url: 'https://news.google.com/rss/search?q=AI+Artificial+Intelligence&hl=ko&gl=KR&ceid=KR:ko' },
];

export type NewsSource = {
    name: string;
    url: string;
};

/**
 * Fetch AI news from multiple RSS sources
 */
export async function fetchAINews(sources: NewsSource[] = DEFAULT_NEWS_SOURCES): Promise<NewsItem[]> {
    console.log(`[NewsFetcher] Starting fetchAINews with ${sources.length} sources...`);
    const allNews: NewsItem[] = [];

    for (const source of sources) {
        try {
            console.log(`[NewsFetcher] Fetching from: ${source.name} (${source.url})`);
            const feed = await parser.parseURL(source.url);

            if (!feed || !feed.items) {
                console.warn(`[NewsFetcher] WARNING: Empty feed returned from ${source.name}`);
                continue;
            }

            console.log(`[NewsFetcher] Successfully fetched ${feed.items.length} items from ${source.name}`);

            const items = feed.items.map((item: any) => {
                // Combine multiple content fields for better keyword matching
                const fullContent = [
                    item.contentSnippet,
                    item.content,
                    item['content:encoded'],
                    item.description
                ].filter(Boolean).join(' ');

                return {
                    title: item.title || 'No Title',
                    link: item.link || '#',
                    pubDate: item.pubDate || new Date().toISOString(),
                    content: (item.contentSnippet || item.description || item.content || '').substring(0, 500),
                    fullSearchText: `${item.title} ${fullContent}`, // Hidden field for better matching
                    source: source.name,
                };
            });
            allNews.push(...items as any);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[NewsFetcher] ERROR fetching from ${source.name}: ${errorMessage}`);
        }
    }

    console.log(`[NewsFetcher] Total news items fetched: ${allNews.length}`);

    // Sort by date (newest first)
    return allNews.sort((a, b) =>
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
}

/**
 * Filter news by keywords
 */
export function filterNewsByKeywords(
    news: any[],
    keywords: string[]
): NewsItem[] {
    if (!keywords || keywords.length === 0) return news;

    // Normalize keywords: lowercase and remove spaces
    const normalizedKeywords = keywords.map(kw => kw.toLowerCase().replace(/\s+/g, ''));

    return news.filter((item) => {
        // Normalize search text: lowercase and remove spaces
        const searchText = (item.fullSearchText || `${item.title} ${item.content}`).toLowerCase();
        const normalizedSearchText = searchText.replace(/\s+/g, '');

        return normalizedKeywords.some((kw) =>
            normalizedSearchText.includes(kw) || searchText.includes(kw)
        );
    });
}

/**
 * Get news from the last N hours
 */
export function getRecentNews(news: NewsItem[], hours: number = 168): NewsItem[] {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);

    return news.filter((item) => new Date(item.pubDate) >= cutoffTime);
}
