import prisma from '../lib/prisma.js';
export const getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        const profile = await prisma.profile.findUnique({
            where: { userId }
        });
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }
        res.json({
            success: true,
            profile: {
                keywords: profile.keywords || [],
                sources: profile.sources || [],
                notificationTime: profile.notificationTime
            }
        });
    }
    catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { keywords, sources, notificationTime } = req.body;
        if (!userId)
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        const updateData = {};
        if (keywords)
            updateData.keywords = keywords;
        if (sources)
            updateData.sources = sources;
        if (notificationTime !== undefined)
            updateData.notificationTime = Number(notificationTime);
        const profile = await prisma.profile.upsert({
            where: { userId },
            update: updateData,
            create: {
                userId,
                keywords: keywords || [],
                sources: sources || [],
                notificationTime: notificationTime ? Number(notificationTime) : 9
            }
        });
        res.json({
            success: true,
            profile: {
                keywords: profile.keywords || [],
                sources: profile.sources || [],
                notificationTime: profile.notificationTime
            }
        });
    }
    catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
export const subscribeToPush = async (req, res) => {
    try {
        const userId = req.userId;
        const { endpoint, keys } = req.body;
        if (!userId)
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        const subscription = await prisma.subscription.upsert({
            where: { endpoint },
            update: {
                userId,
                keys: keys || {}
            },
            create: {
                userId,
                endpoint,
                keys: keys || {}
            }
        });
        res.json({ success: true, subscription });
    }
    catch (error) {
        console.error('Subscribe Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
