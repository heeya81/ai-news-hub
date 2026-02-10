'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Save, Plus, X, ArrowLeft, Rss, Bell, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/components/LanguageProvider';
import { useAuth } from '@/components/AuthProvider';
import { userApi, authApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function Settings() {
    const { t } = useLanguage();
    const router = useRouter();
    const { logout: authLogout } = useAuth();

    const [keywords, setKeywords] = useState<string[]>([]);
    const [newKeyword, setNewKeyword] = useState('');
    const [sources, setSources] = useState<{ name: string, url: string }[]>([]);
    const [newSourceName, setNewSourceName] = useState('');
    const [newSourceUrl, setNewSourceUrl] = useState('');
    const [notificationTime, setNotificationTime] = useState(9);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('ainews_token');
        if (!token) {
            router.push('/auth');
            return;
        }
        loadSettings();
    }, []);

    async function loadSettings() {
        try {
            const data = await userApi.getProfile();
            if (data.success && data.profile) {
                setKeywords(data.profile.keywords || []);
                setSources(data.profile.sources || []);
                setNotificationTime(data.profile.notificationTime || 9);
            }
        } catch (error) {
            console.error('Failed to load settings from API, falling back to local:', error);
            const savedKeywords = localStorage.getItem('ainews_keywords');
            const savedTime = localStorage.getItem('ainews_notification_time');
            const savedSources = localStorage.getItem('ainews_sources');

            if (savedKeywords) setKeywords(JSON.parse(savedKeywords));
            if (savedSources) setSources(JSON.parse(savedSources));
            if (savedTime) setNotificationTime(parseInt(savedTime) || 9);
        } finally {
            setLoading(false);
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
            await userApi.updateProfile({
                keywords,
                sources,
                notificationTime
            });

            localStorage.setItem('ainews_keywords', JSON.stringify(keywords));
            localStorage.setItem('ainews_notification_time', notificationTime.toString());
            localStorage.setItem('ainews_sources', JSON.stringify(sources));

            toast.success(t.settings?.saved || 'Settings saved successfully!');
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Failed to save settings:', error);
            toast.error((t.settings?.saveFailed || 'Failed to save settings: ') + (error.message || ''));
        } finally {
            setSaving(false);
        }
    }

    const handleLogout = () => {
        authLogout();
        toast.success(t.common?.logoutSuccess || 'Logged out successfully');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden transition-colors duration-500">
            <div className="ethereal-blob top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10" />
            <div className="ethereal-blob bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10" />

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
                        <button onClick={handleLogout} className="p-2 hover:text-destructive transition-colors" title="Logout">
                            <LogOut className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-8 py-16 relative z-10">
                <header className="mb-16 animate-fadeIn">
                    <h1 className="text-5xl font-black mb-4 tracking-tighter text-gemini">{t.settings?.title || 'Settings'}</h1>
                    <p className="text-muted-foreground text-lg font-bold leading-relaxed">
                        {t.settings?.desc || 'Customize your AI news experience'}
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-10">
                    {/* Keywords */}
                    <section className="glass-card rounded-[2.5rem] p-12 animate-fadeIn delay-100">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                                <Sparkles className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">{t.settings?.focusKeywords || 'Focus Keywords'}</h2>
                                <p className="text-muted-foreground text-sm font-bold">AI analysis will prioritize these topics</p>
                            </div>
                        </div>

                        <div className="flex gap-4 mb-10">
                            <input
                                type="text"
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                                placeholder="Enter keyword (e.g. LLM, GPT-5)"
                                className="flex-1 px-8 py-5 glass border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-2xl font-bold"
                            />
                            <button onClick={addKeyword} className="px-10 py-5 bg-foreground text-background dark:bg-foreground dark:text-background font-black rounded-2xl hover:scale-105 transition-all flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                Add
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {keywords.map((keyword) => (
                                <div key={keyword} className="flex items-center gap-3 px-6 py-3 glass border border-primary/20 rounded-full group">
                                    <span className="font-black text-primary">{keyword}</span>
                                    <button onClick={() => removeKeyword(keyword)} className="text-muted-foreground hover:text-destructive">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Notification Time */}
                    <section className="glass-card rounded-[2.5rem] p-12 animate-fadeIn delay-300">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                                <Bell className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">Daily Summary</h2>
                                <p className="text-muted-foreground text-sm font-bold">When should we send your AI digest?</p>
                            </div>
                        </div>

                        <div className="glass rounded-[2rem] p-10 border border-border">
                            <div className="flex items-center justify-between mb-12">
                                <span className="text-lg font-black text-foreground">Delivery Window</span>
                                <div className="text-5xl font-black text-gemini">{notificationTime.toString().padStart(2, '0')}:00</div>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max="23"
                                value={notificationTime}
                                onChange={(e) => setNotificationTime(Number(e.target.value))}
                                className="w-full h-4 bg-muted rounded-full appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                    </section>

                    {/* Change Password */}
                    <section className="glass-card rounded-[2.5rem] p-12 animate-fadeIn delay-400">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 border border-red-500/20">
                                <LogOut className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight text-red-500">Security</h2>
                                <p className="text-muted-foreground text-sm font-bold">Manage your account credentials</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <input
                                type="password"
                                placeholder="Current Password"
                                className="w-full px-8 py-5 glass border border-border rounded-2xl font-bold"
                                id="current-password"
                            />
                            <input
                                type="password"
                                placeholder="New Password"
                                className="w-full px-8 py-5 glass border border-border rounded-2xl font-bold"
                                id="new-password"
                            />
                            <button
                                onClick={async () => {
                                    const currentPassword = (document.getElementById('current-password') as HTMLInputElement).value;
                                    const newPassword = (document.getElementById('new-password') as HTMLInputElement).value;
                                    if (!currentPassword || !newPassword) return toast.error('Both fields are required');
                                    try {
                                        await authApi.changePassword({ currentPassword, newPassword });
                                        toast.success('Password updated successfully!');
                                        (document.getElementById('current-password') as HTMLInputElement).value = '';
                                        (document.getElementById('new-password') as HTMLInputElement).value = '';
                                    } catch (err: any) {
                                        toast.error(err.message || 'Failed to update password');
                                    }
                                }}
                                className="w-full py-5 bg-red-500/10 text-red-500 font-black rounded-2xl hover:bg-red-500/20 border border-red-500/20 transition-all"
                            >
                                Update Password
                            </button>
                        </div>
                    </section>

                    <div className="flex items-center gap-6 animate-fadeIn delay-400">
                        <button
                            onClick={saveSettings}
                            disabled={saving}
                            className="flex-1 py-6 bg-foreground text-background dark:bg-foreground dark:text-background font-black text-xl rounded-[2.5rem] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl disabled:opacity-50"
                        >
                            {saving ? <div className="w-6 h-6 border-4 border-background border-t-transparent rounded-full animate-spin mx-auto" /> : 'Push Changes'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
