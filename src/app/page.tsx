'use client';

import { ArrowRight, Sparkles, Rss, Bell, Search, Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/components/LanguageProvider';

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 overflow-x-hidden transition-colors duration-500">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/30 bg-background/50 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <Rss className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">Scrap Feed</span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-sm font-bold text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">{t.landing.featuresButton}</Link>
            <Link href="/dashboard" className="hover:text-primary transition-colors">Demo</Link>
          </div>

          <div className="flex items-center gap-6">
            <LanguageToggle />
            <ThemeToggle />
            <Link
              href="/auth"
              className="hidden sm:flex px-6 py-2.5 bg-foreground text-background dark:bg-foreground dark:text-background rounded-full font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              {t.landing.login}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-8 overflow-hidden">
        {/* Background Blobs */}
        <div className="ethereal-blob top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 -translate-y-1/2 translate-x-1/2" />
        <div className="ethereal-blob bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-10 animate-fadeIn">
            <Sparkles className="w-4 h-4" />
            {t.landing.badge}
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-10 leading-[1.05] animate-fadeIn delay-100 tracking-tighter">
            <span className="inline-block">{t.landing.title1}</span>
            <br />
            <span className="text-gemini block">{t.landing.title2}</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-bold leading-relaxed animate-fadeIn delay-200">
            {t.landing.desc}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fadeIn delay-300">
            <Link
              href="/auth"
              className="group px-10 py-5 bg-foreground text-background dark:bg-foreground dark:text-background rounded-full font-black text-lg hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 shadow-2xl"
            >
              {t.landing.startButton}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/#features"
              className="px-10 py-5 glass border border-border rounded-full font-black text-lg hover:bg-muted transition-all duration-300 active:scale-95"
            >
              {t.landing.featuresButton}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-8 bg-black/[0.02] dark:bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 animate-fadeIn">
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">{t.landing.featuresButton}</h2>
            <p className="text-muted-foreground font-bold">{t.landing.featureSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: t.landing.feature1Title,
                desc: t.landing.feature1Desc,
                color: 'blue'
              },
              {
                icon: <Search className="w-8 h-8" />,
                title: t.landing.feature2Title,
                desc: t.landing.feature2Desc,
                color: 'purple'
              },
              {
                icon: <Bell className="w-8 h-8" />,
                title: t.landing.feature3Title,
                desc: t.landing.feature3Desc,
                color: 'pink'
              }
            ].map((feature, i) => (
              <div
                key={i}
                className={`glass-card p-12 rounded-[2.5rem] animate-fadeIn delay-${(i + 1) * 100}`}
              >
                <div className={`w-16 h-16 rounded-2xl bg-${feature.color}-500/10 flex items-center justify-center text-${feature.color}-500 mb-8 border border-${feature.color}-500/20`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground font-bold leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-border/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 text-muted-foreground font-bold text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-foreground/5 rounded-lg flex items-center justify-center">
              <Rss className="w-4 h-4 text-foreground/40" />
            </div>
            <span className="font-black text-foreground/65 uppercase tracking-tighter">Scrap Feed</span>
          </div>
          <p>© 2026 Scrap Feed. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
