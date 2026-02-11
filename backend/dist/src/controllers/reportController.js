import prisma from '../lib/prisma.js';
export const getDailyReports = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        const reports = await prisma.dailyReport.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 7 // Last 7 days
        });
        res.json({
            success: true,
            reports
        });
    }
    catch (error) {
        console.error('Get Daily Reports Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
export const getLatestReport = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        const report = await prisma.dailyReport.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            report
        });
    }
    catch (error) {
        console.error('Get Latest Report Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
