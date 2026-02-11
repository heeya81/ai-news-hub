import Parser from 'rss-parser';
const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
    },
    timeout: 10000,
});
export const DEFAULT_NEWS_SOURCES = [
    { name: 'AI Trends', url: 'https://www.aitrends.com/feed/' },
    { name: 'OpenAI Blog', url: 'https://openai.com/news/rss.xml' },
    { name: 'ZDNet Korea', url: 'https://feeds.feedburner.com/zdkorea' },
    { name: 'Google News (AI)', url: 'https://news.google.com/rss/search?q=AI+Artificial+Intelligence&hl=ko&gl=KR&ceid=KR:ko' },
];
export async function fetchAINews(sources = DEFAULT_NEWS_SOURCES) {
    const allNews = [];
    for (const source of sources) {
        try {
            const feed = await parser.parseURL(source.url);
            if (!feed || !feed.items)
                continue;
            const items = feed.items.map((item) => {
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
                    fullSearchText: `${item.title} ${fullContent}`,
                    source: source.name,
                };
            });
            allNews.push(...items);
        }
        catch (error) {
            console.error(`Error fetching from ${source.name}:`, error);
        }
    }
    return allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}
export function filterNewsByKeywords(news, keywords) {
    if (!keywords || keywords.length === 0)
        return news;
    const normalizedKeywords = keywords.map(kw => kw.toLowerCase().replace(/\s+/g, ''));
    return news.filter((item) => {
        const searchText = (item.fullSearchText || `${item.title} ${item.content}`).toLowerCase();
        const normalizedSearchText = searchText.replace(/\s+/g, '');
        return normalizedKeywords.some((kw) => normalizedSearchText.includes(kw) || searchText.includes(kw));
    });
}
export function getRecentNews(news, hours = 168) {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);
    return news.filter((item) => new Date(item.pubDate) >= cutoffTime);
}
