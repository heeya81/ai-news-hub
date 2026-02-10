import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

interface AuthRequest extends Request {
    userId?: string;
}

export const getDailyReports = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const reports = await (prisma as any).dailyReport.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 7 // Last 7 days
        });

        res.json({
            success: true,
            reports
        });
    } catch (error) {
        console.error('Get Daily Reports Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getLatestReport = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const report = await (prisma as any).dailyReport.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            report
        });
    } catch (error) {
        console.error('Get Latest Report Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
