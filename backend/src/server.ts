import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchAINews, filterNewsByKeywords, getRecentNews, DEFAULT_NEWS_SOURCES } from './services/newsService.js';
import type { NewsItem } from './services/newsService.js';
import { analyzeNewsRelevance } from './services/aiService.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Set development environment variables if necessary
if (process.env.NODE_ENV === 'development') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.post('/api/news', async (req, res) => {
    try {
        let { keywords, sources, hours } = req.body;
        const RELEVANCE_THRESHOLD = 60; // AI 스코어 기준 (0~100)

        // 1. 뉴스 데이터 수집
        const rawNews = await fetchAINews(sources && sources.length > 0 ? sources : DEFAULT_NEWS_SOURCES);

        // 2. 시간 기간 필터링
        const recentNews = getRecentNews(rawNews, hours || 168);

        // 3. 키워드 전처리
        const activeKeywords = Array.isArray(keywords)
            ? keywords.filter((k: any) => typeof k === 'string').map((k: string) => k.trim())
            : [];

        // 4. 후보군 선발 (AI 분석용)
        // 먼저 규칙 기반으로 필터링 시도
        let ruleBasedCandidates = filterNewsByKeywords(recentNews, activeKeywords);

        // 만약 키워드가 있는데 규칙 기반 결과가 너무 적으면, 
        // 맥락 분석을 위해 전체 최신 뉴스 중 일부를 추가 후보로 포함
        let itemsToAnalyze: NewsItem[] = [...ruleBasedCandidates];
        if (activeKeywords.length > 0 && itemsToAnalyze.length < 10) {
            const extraCandidates = recentNews
                .filter(item => !ruleBasedCandidates.includes(item))
                .slice(0, 15 - itemsToAnalyze.length);
            itemsToAnalyze = [...itemsToAnalyze, ...extraCandidates];
        }

        let finalCandidates = ruleBasedCandidates;

        // 5. 2차 필터링 (AI 분석) - 맥락 기반 지능형 선택
        if (itemsToAnalyze.length > 0 && activeKeywords.length > 0) {
            console.log(`🧠 Gemini AI 분석 시작 (${itemsToAnalyze.length}건 선별, 키워드: ${activeKeywords.join(', ')})`);
            try {
                const aiResults = await analyzeNewsRelevance(
                    itemsToAnalyze.map(item => ({ title: item.title, content: item.content })),
                    activeKeywords
                );

                if (aiResults && aiResults.length > 0) {
                    // AI 분석 결과를 후보군에 병합
                    aiResults.forEach(result => {
                        const item = itemsToAnalyze[result.index];
                        if (item) {
                            item.relevanceScore = result.relevanceScore;
                            item.aiReason = result.reason;
                        }
                    });

                    // AI 스코어 기준에 부합하는 항목만 최종 선발
                    finalCandidates = itemsToAnalyze.filter(item => (item.relevanceScore || 0) >= RELEVANCE_THRESHOLD);

                    // AI가 너무 엄격하게 걸러냈을 경우, 상위 점수 항목이라도 노출 (최소 1개)
                    if (finalCandidates.length === 0 && itemsToAnalyze.length > 0) {
                        console.warn("⚠️ AI가 모든 항목을 낮게 평가했으므로 상위 후보를 노출합니다.");
                        finalCandidates = itemsToAnalyze.slice(0, 5);
                    } else {
                        console.log(`✅ AI 분석 완료: ${finalCandidates.length}건 통과`);
                    }
                } else {
                    console.warn("⚠️ AI 분석 결과가 비비어있음. 기본 후보 노출.");
                    finalCandidates = itemsToAnalyze.slice(0, 10);
                }
            } catch (aiErr) {
                console.error("⚠️ AI 분석 오류 발생, 기본 후보 노출:", aiErr);
                finalCandidates = itemsToAnalyze.slice(0, 10);
            }
        } else {
            // 키워드가 없으면 전체 최신 뉴스 노출
            finalCandidates = recentNews.slice(0, 20);
        }

        // 수집된 고유 소스 목록 계산
        const sourcesFetched = Array.from(new Set(rawNews.map(item => item.source)));

        res.json({
            success: true,
            news: finalCandidates,
            totalFetched: rawNews.length,
            sourcesFetched: sourcesFetched,
            count: finalCandidates.length
        });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});

app.get('/api/sources/default', (req, res) => {
    res.json({
        success: true,
        sources: DEFAULT_NEWS_SOURCES
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
