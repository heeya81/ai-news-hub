'use client';

import { useEffect, useState } from 'react';
import { Rss, Plus, Settings as SettingsIcon, ChevronRight, Home, Bell, Menu, Sparkles, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { filterNewsByKeywords, getRecentNews, type NewsItem } from '@/lib/news';
import { formatDistanceToNow } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/components/LanguageProvider';

export default function Dashboard() {
    const { t, language } = useLanguage();
    const dateLocale = language === 'ko' ? ko : enUS;

    const [news, setNews] = useState<NewsItem[]>([]);
    const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
    const [keywords, setKeywords] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        // Load keywords from localStorage
        if (typeof window !== 'undefined') {
            const savedKeywords = localStorage.getItem('ainews_keywords');
            if (savedKeywords) {
                try {
                    setKeywords(JSON.parse(savedKeywords));
                } catch (e) {
                    setKeywords([]);
                }
            }
        }

        // Load news
        loadNews();
    }, []);

    useEffect(() => {
        // Filter news when keywords change
        if (keywords.length > 0) {
            setFilteredNews(filterNewsByKeywords(news, keywords));
        } else {
            setFilteredNews(news);
        }
    }, [keywords, news]);

    async function loadNews() {
        setLoading(true);
        try {
            // Check for custom sources
            let customSources = null;
            if (typeof window !== 'undefined') {
                const savedSources = localStorage.getItem('ainews_sources');
                if (savedSources) {
                    try {
                        customSources = JSON.parse(savedSources);
                    } catch (e) {
                        // ignore
                    }
                }
            }

            let response;
            if (customSources && customSources.length > 0) {
                response = await fetch('/api/news', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sources: customSources }),
                });
            } else {
                response = await fetch('/api/news');
            }

            const data = await response.json();

            if (data.success && data.news) {
                const allNews = data.news;
                const recentNews = getRecentNews(allNews, 48);
                setNews(recentNews); // 상태 업데이트 (비동기)

                // 2. localStorage에서 키워드 읽어 즉시 필터링 적용 (깜빡임 방지)
                const savedKeywords = localStorage.getItem('ainews_keywords');
                let currentKeywords: string[] = [];
                if (savedKeywords) {
                    try {
                        currentKeywords = JSON.parse(savedKeywords);
                    } catch (e) {
                        // ignore
                    }
                }

                if (currentKeywords.length > 0) {
                    setFilteredNews(filterNewsByKeywords(recentNews, currentKeywords));
                } else {
                    setFilteredNews(recentNews);
                }
            } else {
                setNews([]);
                setFilteredNews([]);
            }
        } catch (error) {
            console.error('Failed to load news:', error);
            setNews([]);
            setFilteredNews([]);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }

    const handleRefresh = () => {
        setIsRefreshing(true);
        loadNews();
    };

    // Count by source (calculate from all fetched news to show total active channels)
    const newsBySource = news.reduce((acc, item) => {
        acc[item.source] = (acc[item.source] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans transition-colors duration-500">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-500 bg-card border-r border-border/40 flex flex-col overflow-hidden relative z-50`}>
                <div className="p-10 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Rss className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-black tracking-tight text-foreground/90 uppercase">
                        Scrap Feed
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-primary/10 text-primary border border-primary/10 group transition-all font-bold">
                        <Rss className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>{t.dashboard.newsStream}</span>
                    </Link>
                    <Link href="/settings" className="flex items-center gap-3 px-5 py-4 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all group border border-transparent hover:border-border/50 font-bold">
                        <SettingsIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        <span>{t.common.settings}</span>
                    </Link>
                </nav>

                <div className="p-8 border-t border-border/40">
                    <div className="bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-[1.5rem] p-6 border border-border/50">
                        <div className="flex items-center gap-2 mb-3 text-primary">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-black uppercase tracking-widest">Pro Tip</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed font-bold">
                            {t.dashboard.proTip}
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Ethereal Background Blobs */}
                <div className="ethereal-blob top-[10%] left-[10%] w-96 h-96 bg-blue-500/10" />
                <div className="ethereal-blob bottom-[10%] right-[10%] w-[500px] h-[500px] bg-purple-500/10" />

                {/* Top Bar */}
                <div className="h-24 border-b border-border/30 px-10 flex items-center justify-between backdrop-blur-xl z-20 sticky top-0 bg-background/50">
                    <div className="flex items-center gap-8">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-all active:scale-95">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-10 text-sm">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-1">{t.dashboard.sourceChannels}</span>
                                <strong className="text-foreground text-xl font-black">{Object.keys(newsBySource).length}</strong>
                            </div>
                            <div className="w-[1px] h-10 bg-border/50" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-1">{t.dashboard.tailoredNews}</span>
                                <strong className="text-primary text-xl font-black">{filteredNews.length}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <LanguageToggle />
                        <ThemeToggle />
                        <Link href="/settings" className="px-6 py-3 bg-foreground text-background dark:bg-foreground dark:text-background rounded-full font-black text-sm hover:scale-105 transition-all shadow-xl flex items-center gap-2 active:scale-95">
                            <Plus className="w-4 h-4" />
                            {t.dashboard.manageKeywords}
                        </Link>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                    <div className="max-w-[1400px] mx-auto px-10 py-12">

                        {/* News Feed Header */}
                        <div className="flex items-center justify-between mb-12 animate-fadeIn">
                            <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4">
                                <span className="w-3 h-12 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full" />
                                <span className="text-gemini">{t.dashboard.title}</span>
                            </h2>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className={`p-3 bg-card border border-border/50 rounded-2xl text-muted-foreground hover:text-primary transition-all shadow-sm ${isRefreshing ? 'animate-spin text-primary' : ''}`}
                                    title={t.dashboard.refresh}
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                                <div className="hidden lg:block px-6 py-3 glass rounded-2xl text-sm font-bold text-foreground/80">
                                    {new Date().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>
                        </div>

                        {/* News Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="glass-card rounded-[2.5rem] h-80 animate-pulse bg-muted/50" />
                                ))}
                            </div>
                        ) : filteredNews.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-40 rounded-[3rem] border-2 border-dashed border-border/50 bg-card/30 animat-fadeIn">
                                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-10 shadow-inner">
                                    <Sparkles className="w-10 h-10 text-primary opacity-60" />
                                </div>
                                <h3 className="text-3xl font-black mb-4 tracking-tight">
                                    {news.length > 0 ? t.dashboard.noMatchesTitle : t.dashboard.noNewsTitle}
                                </h3>
                                <p className="text-muted-foreground text-lg mb-12 max-w-sm text-center font-bold leading-relaxed">
                                    {news.length > 0
                                        ? t.dashboard.noMatchesDesc
                                        : t.dashboard.noNewsDesc}
                                </p>
                                {news.length > 0 && (
                                    <div className="flex items-center gap-6">
                                        <button
                                            onClick={() => setFilteredNews(news)}
                                            className="px-8 py-4 glass border border-border/50 hover:bg-background rounded-2xl text-md font-black transition-all active:scale-95"
                                        >
                                            {t.dashboard.showAllNews}
                                        </button>
                                        <Link href="/settings" className="px-8 py-4 bg-primary text-white rounded-2xl text-md font-black hover:scale-105 transition-all glow-primary active:scale-95">
                                            {t.dashboard.editKeywords}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filteredNews.map((item, index) => (
                                    <div className={`animate-fadeIn delay-${(index % 6) * 100}`} key={`${item.link}-${index}`}>
                                        <NewsCard item={item} locale={dateLocale} badgeText={t.dashboard.newBadge} readMoreText={t.dashboard.readStory} />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="h-32" />
                    </div>
                </div>
            </main>
        </div>
    );
}

function NewsCard({ item, locale, badgeText, readMoreText }: { item: NewsItem, locale: any, badgeText: string, readMoreText: string }) {
    const isNew = new Date().getTime() - new Date(item.pubDate).getTime() < 24 * 60 * 60 * 1000;

    return (
        <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group block h-full glass-card rounded-[2.5rem] p-10 relative overflow-hidden"
        >
            {/* Source Badge */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-[12px] font-black text-primary border border-primary/20">
                        {item.source[0]}
                    </div>
                    <span className="text-sm font-black text-muted-foreground group-hover:text-primary transition-colors">
                        {item.source}
                    </span>
                </div>
                {isNew && (
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-[10px] font-black rounded-full shadow-lg shadow-blue-500/20 uppercase tracking-widest">
                        {badgeText}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="mb-10 flex-1 flex flex-col">
                <h3 className="font-black text-2xl mb-4 leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 tracking-tight">
                    {item.title}
                </h3>
                <p className="text-md text-muted-foreground line-clamp-3 leading-relaxed font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                    {item.content}
                </p>
            </div>

            {/* Footer */}
            <div className="pt-8 border-t border-border/30 mt-auto flex items-center justify-between">
                <time className="text-xs font-black text-muted-foreground/60 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-border group-hover:bg-primary transition-colors" />
                    {formatDistanceToNow(new Date(item.pubDate), { addSuffix: true, locale: locale })}
                </time>
                <div className="opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 duration-500 text-primary font-black text-sm flex items-center gap-2">
                    {readMoreText} <ChevronRight className="w-4 h-4" />
                </div>
            </div>

            {/* Hover Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </a>
    );
}
