import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchAINews, filterNewsByKeywords, getRecentNews, DEFAULT_NEWS_SOURCES } from './services/newsService.js';
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
app.post('/api/news', async (req, res) => {
    try {
        const { keywords, sources, hours } = req.body;
        // Fetch news from requested sources or default
        const rawNews = await fetchAINews(sources && sources.length > 0 ? sources : DEFAULT_NEWS_SOURCES);
        // Filter by time window
        const recentNews = getRecentNews(rawNews, hours || 168);
        // Filter by keywords
        const filteredNews = filterNewsByKeywords(recentNews, keywords);
        res.json({
            success: true,
            news: filteredNews,
            totalFetched: rawNews.length,
            count: filteredNews.length
        });
    }
    catch (error) {
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
//# sourceMappingURL=server.js.map