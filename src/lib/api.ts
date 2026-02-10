const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    let token = typeof window !== 'undefined' ? localStorage.getItem('ainews_token') : null;

    const headers: any = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Handle Token Refresh (401 Unauthorized)
    if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
        const refreshToken = localStorage.getItem('ainews_refresh_token');
        if (refreshToken) {
            try {
                const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                });

                if (refreshRes.ok) {
                    const refreshData = await refreshRes.json();
                    localStorage.setItem('ainews_token', refreshData.accessToken);

                    // Retry original request
                    token = refreshData.accessToken;
                    headers['Authorization'] = `Bearer ${token}`;
                    response = await fetch(`${API_BASE_URL}${endpoint}`, {
                        ...options,
                        headers,
                    });
                } else {
                    // Refresh token failed
                    localStorage.removeItem('ainews_token');
                    localStorage.removeItem('ainews_refresh_token');
                    localStorage.removeItem('ainews_user');
                    if (typeof window !== 'undefined') window.location.href = '/auth';
                }
            } catch (err) {
                console.error('Refresh Token Error:', err);
            }
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
    logout: () => {
        const refreshToken = localStorage.getItem('ainews_refresh_token');
        return apiRequest('/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });
    }
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
};

export const newsApi = {
    fetchNews: (params: any) => {
        const query = new URLSearchParams();
        if (params.sources) query.append('sources', JSON.stringify(params.sources));
        if (params.keywords) query.append('keywords', JSON.stringify(params.keywords));
        return apiRequest(`/news?${query.toString()}`);
    }
};
