import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import { fetchAINews, filterNewsByKeywords, getRecentNews } from '@/lib/news';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Configure web-push
webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function GET(request: NextRequest) {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const currentHour = new Date().getHours();
        console.log(`Running cron job for hour: ${currentHour}`);

        // Get all profiles with notification_time matching current hour
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*, subscriptions(*)')
            .eq('notification_time', currentHour);

        if (profilesError) throw profilesError;

        if (!profiles || profiles.length === 0) {
            return NextResponse.json({ message: 'No users to notify at this hour' });
        }

        // Fetch latest news
        const allNews = await fetchAINews();
        const recentNews = getRecentNews(allNews, 24); // Last 24 hours

        let notificationsSent = 0;

        // Send notifications to each user
        for (const profile of profiles) {
            try {
                // Filter news by user keywords
                const filteredNews = filterNewsByKeywords(recentNews, profile.keywords || []);

                if (filteredNews.length === 0) continue;

                // Prepare notification payload
                const payload = JSON.stringify({
                    title: '🤖 새로운 AI 뉴스',
                    body: `${filteredNews.length}개의 새로운 뉴스가 있습니다: ${filteredNews[0]?.title || ''}`,
                    url: '/dashboard',
                });

                // Send to all user subscriptions
                const subscriptions = Array.isArray(profile.subscriptions)
                    ? profile.subscriptions
                    : [];

                for (const sub of subscriptions) {
                    try {
                        await webpush.sendNotification(
                            {
                                endpoint: sub.endpoint,
                                keys: {
                                    p256dh: sub.keys.p256dh,
                                    auth: sub.keys.auth,
                                },
                            },
                            payload
                        );
                        notificationsSent++;
                    } catch (error: any) {
                        console.error(`Failed to send to subscription ${sub.id}:`, error);

                        // If subscription is gone/invalid, delete it
                        if (error.statusCode === 410) {
                            await supabase.from('subscriptions').delete().eq('id', sub.id);
                        }
                    }
                }

                // Update last_notified_at
                await supabase
                    .from('profiles')
                    .update({ last_notified_at: new Date().toISOString() })
                    .eq('id', profile.id);
            } catch (error) {
                console.error(`Failed to process user ${profile.id}:`, error);
            }
        }

        return NextResponse.json({
            message: 'Cron job completed',
            hour: currentHour,
            usersProcessed: profiles.length,
            notificationsSent,
        });
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
