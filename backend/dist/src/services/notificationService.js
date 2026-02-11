import webpush from 'web-push';
import dotenv from 'dotenv';
import prisma from '../lib/prisma.js';
dotenv.config();
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:example@yourdomain.com';
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}
export async function sendPushNotification(userId, title, body, url = '/') {
    try {
        const subscriptions = await prisma.subscription.findMany({
            where: { userId }
        });
        if (subscriptions.length === 0) {
            return { success: false, error: 'No subscriptions found for user' };
        }
        const payload = JSON.stringify({
            title,
            body,
            url,
            icon: '/icons/icon-192x192.png', // Assuming icon exists
            badge: '/icons/badge-72x72.png'
        });
        const sendPromises = subscriptions.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: sub.keys
            };
            try {
                await webpush.sendNotification(pushSubscription, payload);
                return { success: true, endpoint: sub.endpoint };
            }
            catch (error) {
                console.error(`Error sending push to ${sub.endpoint}:`, error);
                // If subscription is gone or expired, remove it from DB
                if (error.statusCode === 410 || error.statusCode === 404) {
                    await prisma.subscription.delete({
                        where: { endpoint: sub.endpoint }
                    });
                }
                return { success: false, endpoint: sub.endpoint, error: error.message };
            }
        });
        const results = await Promise.all(sendPromises);
        return { success: true, results };
    }
    catch (error) {
        console.error('Send Push Notification Error:', error);
        return { success: false, error };
    }
}
