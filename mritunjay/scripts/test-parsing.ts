
// Helper to decode HTML entities (copied from route.ts)
function unescapeHtml(safe: string) {
    if (!safe) return "";
    return safe
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#039;/g, "'")
        .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
        .replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/&amp;/g, "&");
}

// Helper to clean title (copied from route.ts)
function cleanTitle(title: string) {
    let cleaned = unescapeHtml(title);
    cleaned = cleaned.replace(/^mritunjay13\s*.*?:/i, '').trim();
    cleaned = cleaned.replace(/^mritunjay13\s*:/i, '').trim();
    return cleaned;
}

const testCases = [
    "mritunjay13 &#9997;&#65039; : भ&#2366;रत और उसक&#2375; समक&#2366;ल&#2368;न द&#2375;श&#2379;&#2306; क&#2368; प&#2381;रगत&#2367;: कह&#2366;&#2306; हम प&#2367;छड&#2364; गए?",
    "mritunjay13 &#9997;&#65039; : 🚩 त&#2381;रय&#2379;दश&#2368; त&#2367;थ&#2367; और १३ स&#2381;वर&#2379;प अन&#2306;त शक&#2381;त&#2367; क&#2366; प&#2381;र&#2366;कट&#2381;य म&#2375;र&#2375; मह&#2366;द&#2375;व 🚩",
    "mritunjay13 : Just a title",
    "mritunjay13 ✍️ : Decoded title"
];

testCases.forEach((t, i) => {
    console.log(`\n--- Case ${i + 1} ---`);
    console.log("Raw:", t);
    console.log("Unescaped:", unescapeHtml(t));
    console.log("Cleaned:", cleanTitle(t));
});
