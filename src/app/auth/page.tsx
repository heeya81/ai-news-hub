'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Rss, ArrowRight, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { useLanguage } from '@/components/LanguageProvider';

import toast from 'react-hot-toast';
import { useAuth } from '@/components/AuthProvider';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login: authLogin } = useAuth();
    const { t } = useLanguage();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const data = await authApi.login({ email, password });
                authLogin(data.user);
                toast.success(t.common?.loginSuccess || 'Logged in successfully!');
            } else {
                await authApi.register({ email, password });
                toast.success(t.common?.registerSuccess || 'Registration successful! Please login.');
                setIsLogin(true);
            }
        } catch (err: any) {
            toast.error(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans relative overflow-hidden flex items-center justify-center p-6">
            {/* Background Blobs */}
            <div className="ethereal-blob top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10" />
            <div className="ethereal-blob bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10" />

            <div className="max-w-md w-full relative z-10 animate-fadeIn">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                            <Rss className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter uppercase">Scrap Feed</span>
                    </Link>
                    <h1 className="text-4xl font-black mb-3 tracking-tight">
                        {isLogin ? 'Welcome Back' : 'Join the Future'}
                    </h1>
                    <p className="text-muted-foreground font-bold">
                        {isLogin ? 'Sign in to access your curated AI news' : 'Create an account to start your journey'}
                    </p>
                </div>

                <div className="glass-card p-10 rounded-[2.5rem] border border-border/30">

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 glass border border-border focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-bold rounded-2xl"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 glass border border-border focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-bold rounded-2xl"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-foreground text-background dark:bg-foreground dark:text-background font-black text-lg rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-background border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm font-bold text-muted-foreground">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-primary hover:underline"
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>
                </div>

                <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-black uppercase tracking-widest">Powered by Gemini AI</span>
                </div>
            </div>
        </div>
    );
}
