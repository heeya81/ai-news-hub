export type NewsItem = {
    title: string;
    link: string;
    pubDate: string;
    content: string;
    fullSearchText?: string;
    source: string;
};
export type NewsSource = {
    name: string;
    url: string;
};
export declare const DEFAULT_NEWS_SOURCES: NewsSource[];
export declare function fetchAINews(sources?: NewsSource[]): Promise<NewsItem[]>;
export declare function filterNewsByKeywords(news: any[], keywords: string[]): NewsItem[];
export declare function getRecentNews(news: NewsItem[], hours?: number): NewsItem[];
//# sourceMappingURL=newsService.d.ts.map