const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('ainews_token') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return data;
}

export const authApi = {
    login: (credentials: any) => apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),
    register: (userData: any) => apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),
};

export const userApi = {
    getProfile: () => apiRequest('/user/profile'),
    updateProfile: (profileData: any) => apiRequest('/user/profile', {
        method: 'POST',
        body: JSON.stringify(profileData)
    }),
    subscribeToPush: (subscription: any) => apiRequest('/user/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription)
    }),
};

export const newsApi = {
    fetchNews: (params: any) => apiRequest('/news', {
        method: 'POST',
        body: JSON.stringify(params)
    }),
};
