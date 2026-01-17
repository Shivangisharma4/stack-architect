
// Emulate the extraction logic from route.ts

function extractNestedDiv(html: string, className: string): string {
    const classRegex = new RegExp(`class=["'][^"']*${className}[^"']*["']`, 'i');
    const startMatch = html.match(classRegex);
    if (!startMatch) return '';

    const startIndex = startMatch.index!;
    // Find the opening tag start "<div" before the class match
    let openTagStart = html.lastIndexOf('<div', startIndex);
    if (openTagStart === -1) return '';

    let depth = 0;
    let currentIndex = openTagStart;
    let contentStart = -1;
    let contentEnd = -1;

    // Iterate through the string to balance divs
    while (currentIndex < html.length) {
        const nextOpen = html.indexOf('<div', currentIndex);
        const nextClose = html.indexOf('</div>', currentIndex);

        if (nextClose === -1) break; // formatting broken

        if (nextOpen !== -1 && nextOpen < nextClose) {
            // Found opening tag
            if (depth === 0) contentStart = html.indexOf('>', nextOpen) + 1;
            depth++;
            currentIndex = nextOpen + 1;
        } else {
            // Found closing tag
            depth--;
            currentIndex = nextClose + 1;
            if (depth === 0) {
                contentEnd = nextClose;
                break;
            }
        }
    }

    if (contentStart !== -1 && contentEnd !== -1) {
        return html.substring(contentStart, contentEnd);
    }
    return '';
}

async function inspectBlog() {
    try {
        const url = 'https://mritunjaysharma13.blogspot.com/2024/10/blog-post_24.html';
        console.log('Fetching post page:', url);

        const postRes = await fetch(url);
        const postHtml = await postRes.text();

        console.log('--- Testing extractNestedDiv ---');
        let content = extractNestedDiv(postHtml, 'post-body');
        console.log(`'post-body' extraction length: ${content.length}`);

        if (content.length < 100) {
            console.log('Content snippet:', content);

            // Debugging the extraction
            const classRegex = /class=["'][^"']*post-body[^"']*["']/i;
            const match = postHtml.match(classRegex);
            console.log('Regex match index:', match?.index);
            if (match) {
                const startIndex = match.index!;
                const openTagStart = postHtml.lastIndexOf('<div', startIndex);
                console.log('Open tag start:', openTagStart);
                console.log('Snippet around open tag:', postHtml.substring(openTagStart, openTagStart + 100));
            }
        }

    } catch (e) {
        console.error(e);
    }
}

inspectBlog();
