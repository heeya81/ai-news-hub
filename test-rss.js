const Parser = require('rss-parser');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
    timeout: 10000,
});

const sources = [
    { name: 'ZDNet Korea', url: 'https://feeds.feedburner.com/zdkorea' },
    { name: 'Google News', url: 'https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko' },
];

async function testFetch() {
    for (const source of sources) {
        try {
            console.log(`Testing ${source.name}...`);
            const feed = await parser.parseURL(source.url);
            console.log(`- Success! Found ${feed.items.length} items.`);
            if (feed.items.length > 0) {
                console.log(`  Sample Title: ${feed.items[0].title}`);
            }
        } catch (error) {
            console.error(`- Error fetching ${source.name}:`, error.message);
        }
    }
}

testFetch();
