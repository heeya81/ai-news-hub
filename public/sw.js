self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const options = {
            body: data.body || '새로운 AI 뉴스가 도착했습니다!',
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            vibrate: [200, 100, 200],
            data: {
                url: data.url || '/',
            },
            actions: [
                {
                    action: 'open',
                    title: '열기',
                },
                {
                    action: 'close',
                    title: '닫기',
                },
            ],
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'AI News Hub', options)
        );
    } catch (error) {
        console.error('Push notification error:', error);
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const url = event.notification.data?.url || '/';

    event.waitUntil(
        clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Check if there's already a window open
                for (const client of windowClients) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise open a new window
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});
