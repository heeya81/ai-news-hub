'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Save, Plus, X, ArrowLeft, Rss, Bell } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/components/LanguageProvider';

export default function Settings() {
    const { t } = useLanguage();
    const router = useRouter();
    const [keywords, setKeywords] = useState<string[]>([]);
    const [newKeyword, setNewKeyword] = useState('');
    const [sources, setSources] = useState<{ name: string, url: string }[]>([]);
    const [newSourceName, setNewSourceName] = useState('');
    const [newSourceUrl, setNewSourceUrl] = useState('');
    const [notificationTime, setNotificationTime] = useState(9);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    function loadSettings() {
        if (typeof window !== 'undefined') {
            const savedKeywords = localStorage.getItem('ainews_keywords');
            const savedTime = localStorage.getItem('ainews_notification_time');
            const savedSources = localStorage.getItem('ainews_sources');

            if (savedKeywords) {
                try {
                    setKeywords(JSON.parse(savedKeywords));
                } catch (e) {
                    setKeywords([]);
                }
            }

            if (savedSources) {
                try {
                    setSources(JSON.parse(savedSources));
                } catch (e) {
                    setSources([]);
                }
            } else {
                setSources([
                    { name: 'AI Trends', url: 'https://www.aitrends.com/feed/' },
                    { name: 'OpenAI Blog', url: 'https://openai.com/news/rss.xml' },
                    { name: 'ZDNet Korea', url: 'https://feeds.feedburner.com/zdkorea' },
                    { name: 'Google News (AI)', url: 'https://news.google.com/rss/search?q=AI+Artificial+Intelligence&hl=ko&gl=KR&ceid=KR:ko' },
                ]);
            }

            if (savedTime) {
                setNotificationTime(parseInt(savedTime) || 9);
            }
        }
    }

    function addKeyword() {
        if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
            setKeywords([...keywords, newKeyword.trim()]);
            setNewKeyword('');
        }
    }

    function removeKeyword(keyword: string) {
        setKeywords(keywords.filter((k) => k !== keyword));
    }

    function addSource() {
        if (newSourceName.trim() && newSourceUrl.trim()) {
            setSources([...sources, { name: newSourceName.trim(), url: newSourceUrl.trim() }]);
            setNewSourceName('');
            setNewSourceUrl('');
        }
    }

    function removeSource(index: number) {
        setSources(sources.filter((_, i) => i !== index));
    }

    async function saveSettings() {
        setSaving(true);

        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem('ainews_keywords', JSON.stringify(keywords));
                localStorage.setItem('ainews_notification_time', notificationTime.toString());
                localStorage.setItem('ainews_sources', JSON.stringify(sources));
            }

            alert(t.settings.saved);
            router.push('/dashboard');
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert(t.settings.saveFailed);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden transition-colors duration-500">
            {/* Ethereal Background Blobs */}
            <div className="ethereal-blob top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10" />
            <div className="ethereal-blob bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10" />

            {/* Top Navigation */}
            <nav className="border-b border-border/30 px-8 py-6 backdrop-blur-xl relative z-20 sticky top-0 bg-background/50">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-4 group">
                        <div className="p-2 hover:bg-muted rounded-xl transition-all group-hover:-translate-x-1">
                            <ArrowLeft className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Rss className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tight uppercase">Settings</span>
                        </div>
                    </Link>
                    <div className="flex items-center gap-4">
                        <LanguageToggle />
                        <ThemeToggle />
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-8 py-16 relative z-10">
                <header className="mb-16 animate-fadeIn">
                    <h1 className="text-5xl font-black mb-4 tracking-tighter text-gemini">{t.settings.title}</h1>
                    <p className="text-muted-foreground text-lg font-bold leading-relaxed">
                        {t.settings.desc}
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-10">
                    {/* Keywords Section */}
                    <section className="glass-card rounded-[2.5rem] p-12 animate-fadeIn delay-100">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                                <Sparkles className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">{t.settings.focusKeywords}</h2>
                                <p className="text-muted-foreground text-sm font-bold">
                                    {t.settings.keywordsDesc}
                                </p>
                            </div>
                        </div>

                        {/* Add Keyword Input */}
                        <div className="flex gap-4 mb-10">
                            <input
                                type="text"
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                                placeholder={t.settings.keywordPlaceholder}
                                className="flex-1 px-8 py-5 glass border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-foreground placeholder-muted-foreground font-bold"
                            />
                            <button
                                onClick={addKeyword}
                                className="px-10 py-5 bg-foreground text-background dark:bg-foreground dark:text-background font-black rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group shadow-xl"
                            >
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                {t.common.add}
                            </button>
                        </div>

                        {/* Keywords List */}
                        {keywords.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                                {keywords.map((keyword) => (
                                    <div
                                        key={keyword}
                                        className="flex items-center gap-3 px-6 py-3 glass border border-primary/20 rounded-full group hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                                    >
                                        <span className="font-black text-primary">{keyword}</span>
                                        <button
                                            onClick={() => removeKeyword(keyword)}
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 rounded-[2rem] border-2 border-dashed border-border bg-muted/20">
                                <Sparkles className="w-10 h-10 mx-auto mb-4 text-muted-foreground opacity-30" />
                                <p className="text-muted-foreground font-black">{t.settings.noKeywords}</p>
                            </div>
                        )}
                    </section>

                    {/* News Sources Section */}
                    <section className="glass-card rounded-[2.5rem] p-12 animate-fadeIn delay-200">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 border border-purple-500/20">
                                <Rss className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">{t.settings.curatedSources}</h2>
                                <p className="text-muted-foreground text-sm font-bold">
                                    {t.settings.sourcesDesc}
                                </p>
                            </div>
                        </div>

                        {/* Add Source Input */}
                        <div className="flex flex-col md:flex-row gap-4 mb-10">
                            <input
                                type="text"
                                value={newSourceName}
                                onChange={(e) => setNewSourceName(e.target.value)}
                                placeholder={t.settings.sourceName}
                                className="flex-1 px-8 py-5 glass border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all font-bold"
                            />
                            <input
                                type="text"
                                value={newSourceUrl}
                                onChange={(e) => setNewSourceUrl(e.target.value)}
                                placeholder={t.settings.sourceUrl}
                                className="flex-[2] px-8 py-5 glass border border-border focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all font-bold"
                            />
                            <button
                                onClick={addSource}
                                className="px-10 py-5 bg-purple-600 text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group shadow-xl shadow-purple-500/20"
                            >
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                {t.common.add}
                            </button>
                        </div>

                        {/* Sources List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sources.map((source, index) => (
                                <div
                                    key={`${source.name}-${index}`}
                                    className="flex items-center justify-between p-6 glass border border-border rounded-3xl group hover:border-purple-500/30 transition-all"
                                >
                                    <div className="flex flex-col gap-1 overflow-hidden">
                                        <span className="font-black text-sm text-foreground">{source.name}</span>
                                        <span className="text-xs text-muted-foreground truncate font-bold">{source.url}</span>
                                    </div>
                                    <button
                                        onClick={() => removeSource(index)}
                                        className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}

                            {sources.length === 0 && (
                                <div className="col-span-full text-center py-10 text-muted-foreground font-bold italic">
                                    {t.settings.defaultSources}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Notification Time Section */}
                    <section className="glass-card rounded-[2.5rem] p-12 animate-fadeIn delay-300">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                                <Bell className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">{t.settings.dailySummary}</h2>
                                <p className="text-muted-foreground text-sm font-bold">
                                    {t.settings.summaryDesc}
                                </p>
                            </div>
                        </div>

                        <div className="glass rounded-[2rem] p-10 border border-border">
                            <div className="flex items-center justify-between mb-12">
                                <span className="text-lg font-black text-foreground">{t.settings.deliveryWindow}</span>
                                <div className="text-5xl font-black text-gemini">
                                    {notificationTime.toString().padStart(2, '0')}:00
                                </div>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max="23"
                                value={notificationTime}
                                onChange={(e) => setNotificationTime(Number(e.target.value))}
                                className="w-full h-4 bg-muted rounded-full appearance-none cursor-pointer accent-blue-600"
                                style={{
                                    backgroundImage: `linear-gradient(to right, #2563eb 0%, #9333ea ${(notificationTime / 23) * 100}%, transparent ${(notificationTime / 23) * 100}%)`,
                                }}
                            />
                            <div className="flex justify-between mt-6 text-xs text-muted-foreground font-black tracking-widest uppercase">
                                <span>{t.settings.midnight}</span>
                                <span>{t.settings.noon}</span>
                                <span>11:00 PM</span>
                            </div>
                        </div>
                    </section>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-6 animate-fadeIn delay-400">
                        <button
                            onClick={saveSettings}
                            disabled={saving}
                            className="flex-1 py-6 bg-foreground text-background dark:bg-foreground dark:text-background font-black text-xl rounded-[2.5rem] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="w-6 h-6 border-4 border-background border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-6 h-6" />
                                    {t.settings.pushChanges}
                                </>
                            )}
                        </button>
                        <Link
                            href="/dashboard"
                            className="px-10 py-6 glass border border-border rounded-[2.5rem] font-black text-xl hover:bg-muted transition-all active:scale-95"
                        >
                            {t.settings.discardChanges}
                        </Link>
                    </div>

                    <p className="text-center text-muted-foreground text-sm font-bold animate-fadeIn delay-500">
                        Settings are persisted locally in your browser workspace.
                    </p>
                </div>
            </main>
        </div>
    );
}
