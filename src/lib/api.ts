const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const headers: any = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // With cookie-based auth, we don't need to manually add the Authorization header
    // but we MUST include credentials: 'include'
    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
    });

    // Handle Token Refresh (401 Unauthorized)
    if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
        try {
            const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (refreshRes.ok) {
                // Retry original request
                response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    ...options,
                    headers,
                    credentials: 'include',
                });
            } else {
                // Refresh token failed
                localStorage.removeItem('ainews_user');
                if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
                    window.location.href = '/auth';
                }
            }
        } catch (err) {
            console.error('Refresh Token Error:', err);
        }
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return data;
}

export const authApi = {
    login: (credentials: any) => apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),
    register: (userData: any) => apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    }),
    logout: () => apiRequest('/user/logout', {
        method: 'POST',
    }),
    changePassword: (passwords: any) => apiRequest('/user/change-password', {
        method: 'POST',
        body: JSON.stringify(passwords),
    })
};

export const userApi = {
    getProfile: () => apiRequest('/user/profile'),
    updateProfile: (profile: any) => apiRequest('/user/profile', {
        method: 'POST',
        body: JSON.stringify(profile),
    }),
    subscribeToPush: (subscription: any) => apiRequest('/user/subscribe', {
        method: 'POST',
        body: JSON.stringify({ subscription }),
    }),
    getReports: () => apiRequest('/user/reports'),
    getLatestReport: () => apiRequest('/user/reports/latest'),
};

export const newsApi = {
    fetchNews: (params: any) => {
        const query = new URLSearchParams();
        if (params.sources) query.append('sources', JSON.stringify(params.sources));
        if (params.keywords) query.append('keywords', JSON.stringify(params.keywords));
        return apiRequest(`/news?${query.toString()}`);
    }
};
