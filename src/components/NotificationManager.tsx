'use client';

import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function NotificationManager() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
            checkSubscription();
        }
    }, []);

    async function checkSubscription() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setSubscribed(!!subscription);
        } catch (error) {
            console.error('Failed to check subscription:', error);
        }
    }

    async function requestPermission() {
        if (!('Notification' in window)) {
            alert('이 브라우저는 알림을 지원하지 않습니다.');
            return;
        }

        setLoading(true);

        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                await subscribeToNotifications();
            }
        } catch (error) {
            console.error('Failed to request permission:', error);
            alert('알림 권한 요청에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }

    async function subscribeToNotifications() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            alert('이 브라우저는 푸시 알림을 지원하지 않습니다.');
            return;
        }

        try {
            // Register service worker
            const registration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            // Subscribe to push notifications
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

            if (!vapidPublicKey) {
                console.error('VAPID public key not configured');
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
            });

            // Save subscription to database
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                await supabase.from('subscriptions').insert({
                    user_id: user.id,
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
                        auth: arrayBufferToBase64(subscription.getKey('auth')!),
                    },
                });

                setSubscribed(true);
            }
        } catch (error) {
            console.error('Failed to subscribe to notifications:', error);
            alert('알림 구독에 실패했습니다.');
        }
    }

    if (permission === 'granted' && subscribed) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300">
                <Check className="w-5 h-5" />
                <span className="text-sm font-medium">알림이 활성화되었습니다</span>
            </div>
        );
    }

    if (permission === 'denied') {
        return (
            <div className="glass rounded-lg p-4">
                <p className="text-sm text-gray-400">
                    알림이 차단되었습니다. 브라우저 설정에서 알림을 허용해주세요.
                </p>
            </div>
        );
    }

    return (
        <button
            onClick={requestPermission}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 hover:scale-105 disabled:opacity-50"
        >
            <Bell className="w-5 h-5" />
            {loading ? '설정 중...' : '푸시 알림 활성화'}
        </button>
    );
}

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
