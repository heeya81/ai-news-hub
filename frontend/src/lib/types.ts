export type NewsItem = {
    title: string;
    link: string;
    pubDate: string;
    content: string;
    source: string;
    relevanceScore?: number;
    aiReason?: string;
};

export type NewsSource = {
    name: string;
    url: string;
};
