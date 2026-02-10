import { NextRequest, NextResponse } from 'next/server';
import { fetchAINews } from '@/lib/news';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const news = await fetchAINews();

        return NextResponse.json({
            success: true,
            news,
            count: news.length,
        });
    } catch (error) {
        console.error('Failed to fetch news:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch news',
                news: [],
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sources } = body;

        const news = await fetchAINews(sources);

        return NextResponse.json({
            success: true,
            news,
            count: news.length,
        });
    } catch (error) {
        console.error('Failed to fetch news:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch news',
                news: [],
            },
            { status: 500 }
        );
    }
}
