'use client';

import { useLanguage } from './LanguageProvider';

export function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-black/5 dark:border-white/10">
            <button
                onClick={() => setLanguage('ko')}
                className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all ${language === 'ko'
                    ? 'bg-white dark:bg-white/10 shadow-sm text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
            >
                KO
            </button>
            <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all ${language === 'en'
                    ? 'bg-white dark:bg-white/10 shadow-sm text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
            >
                EN
            </button>
        </div>
    );
}
