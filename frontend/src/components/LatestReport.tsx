'use client';

import { useEffect, useState } from 'react';
import { userApi } from '@/lib/api';
import { FileText, Sparkles, ChevronRight, Calendar } from 'lucide-react';

export default function LatestReport() {
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLatestReport();
    }, []);

    async function loadLatestReport() {
        try {
            const data = await userApi.getLatestReport();
            if (data.success && data.report) {
                setReport(data.report);
            }
        } catch (error) {
            console.error('Failed to load latest report:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return null;
    if (!report) return null;

    return (
        <section className="glass-card rounded-[2.5rem] p-8 mb-10 overflow-hidden relative group animate-fadeIn">
            <div className="absolute top-0 right-0 p-8 text-blue-500/10 pointer-events-none">
                <Sparkles className="w-40 h-40" />
            </div>

            <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/20">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight">{report.title}</h2>
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mt-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(report.date).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <button className="flex items-center gap-1 text-sm font-black text-blue-500 hover:gap-2 transition-all">
                    View Full Report <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div className="relative z-10 glass rounded-2xl p-6 border border-white/5 bg-white/5 backdrop-blur-sm">
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground line-clamp-4 font-medium leading-relaxed">
                    {report.content.split('\n').map((line: string, i: number) => (
                        <p key={i} className="mb-2">{line}</p>
                    ))}
                </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-wider rounded-full border border-blue-500/20">
                    AI Generated
                </span>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-500 text-[10px] font-black uppercase tracking-wider rounded-full border border-purple-500/20">
                    Personalized Digest
                </span>
            </div>
        </section>
    );
}
