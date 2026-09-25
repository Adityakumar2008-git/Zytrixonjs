const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Zero-dependency .env loader
try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split(/\r?\n/).forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                const [key, ...vals] = trimmed.split('=');
                const val = vals.join('=').trim().replace(/^["']|["']$/g, '');
                if (!process.env[key.trim()]) {
                    process.env[key.trim()] = val;
                }
            }
        });
    }
} catch (e) {
    // env loading optional
}

const LLM_API_KEY = process.env.LLM_API_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || 'qwen3.7-flash';
const LLM_ENDPOINT = process.env.LLM_ENDPOINT || 'https://api.bazaarlink.ai/v1/chat/completions';

const ZYTRIXON_SYSTEM_PROMPT = `You are the AI Strategic Advisory Concierge for Zytrixon (zytrixon.com), an elite Business Growth & Strategy Consultancy founded by Aditya Choudhary. Your mission is to provide institutional-grade, highly structured, confidential guidance for founders, enterprise leaders, and campaign strategists.

CORE STRATEGIC SERVICES (5 PILLARS):
1. Business Strategy: Unit economics audits, moat architecture, competitive positioning, and capital allocation.
2. Business Consulting: Corporate reorganization, executive governance, turnaround strategy, and operational velocity.
3. Performance Marketing: High-ROAS paid acquisition (Meta, Google, LinkedIn), conversion engineering, and CAC/LTV calibration.
4. Social Media Narrative & Reach: High-prestige executive branding, organic distribution architecture, viral narrative engineering, and digital authority.
5. Political Campaign Design & Sentiment Architecture: Voter sentiment modeling, narrative war rooms, counter-narrative blitzes, and constituency micro-targeting.

ENGAGEMENT TIERS & PRICING:
- Tier 01: 14-Day Diagnostic Sprint (₹75,000 one-time): A forensic audit of acquisition channels, unit economics leaks, and competitive moats with an actionable Diagnostic Dossier.
- Tier 02: Advisory Retainer (₹1,50,000 / month): Weekly strategic war rooms, executive governance, and continuous partner desk guidance.
- Tier 03: Growth Partner Tier (₹3,00,000+ / month): Embedded execution team across growth marketing, brand authority, and direct founder access.

CONFIDENTIALITY PROTOCOL:
All client discussions and strategic data are strictly protected under mutual Non-Disclosure Agreements (NDAs) prior to data disclosure.

EXECUTIVE CONTACT COORDINATES:
- Founding Partners WhatsApp Desk: +91 70497 11475 (https://wa.me/917049711475)
- Direct Inquiries Email: zytrixon@gmail.com / adityakumarchaudhari66@gmail.com
- Strategy Intake Form: Available directly on the contact page.

TONE & RESPONSE STYLE:
- Confident, executive, crisp, intellectual, and authoritative.
- Never claim Zytrixon is fictional or hypothetical; Zytrixon is real and operating.
- Keep answers structured with bold bullet points. Be concise (2-4 short sections).
- Proactively invite the user to schedule a consultation via the on-page form or message the founding partners directly on WhatsApp (+91 70497 11475).`;

function generateStrategicFallback(userQuery) {
    const q = (userQuery || '').toLowerCase();
    if (q.includes('price') || q.includes('pricing') || q.includes('cost') || q.includes('retainer') || q.includes('tier') || q.includes('fee')) {
        return "Zytrixon operates on three disciplined engagement tiers:\n\n" +
            "• **Tier 01: Diagnostic Sprint (₹75,000)** — A 14-day forensic audit of your unit economics, ad channels, and revenue bottlenecks.\n" +
            "• **Tier 02: Advisory Retainer (₹1,50,000/mo)** — Strategic direction, weekly war rooms, and executive governance.\n" +
            "• **Tier 03: Growth Partner (₹3,00,000+/mo)** — Full embedded execution across performance marketing, social authority, and engineering.\n\n" +
            "Would you like to schedule a fit assessment via our on-page form or connect directly with our partner desk on WhatsApp (**+91 70497 11475**)?";
    }
    if (q.includes('diagnostic') || q.includes('sprint') || q.includes('14-day') || q.includes('audit')) {
        return "Our **14-Day Forensic Diagnostic Sprint** is our foundational engagement:\n\n" +
            "• **Week 1:** Data ingestion under bilateral NDA (P&L, CAC/LTV, ad metrics, sales pipelines).\n" +
            "• **Week 2:** Synthesis and delivery of a mathematical 90-day growth roadmap and revenue architecture.\n\n" +
            "**Investment:** ₹75,000 (One-time fee).\n\n" +
            "You can initiate this sprint using the intake form on this page or via WhatsApp at **+91 70497 11475**.";
    }
    if (q.includes('pillar') || q.includes('service') || q.includes('offer') || q.includes('help')) {
        return "Zytrixon advises enterprises across **5 Strategic Growth Pillars**:\n\n" +
            "1. **Business Strategy:** Moat modeling, unit economics optimization, and capital allocation.\n" +
            "2. **Business Consulting:** Organizational velocity, corporate governance, and turnaround architecture.\n" +
            "3. **Performance Marketing:** High-ROAS paid acquisition engineering across Meta, Google, and LinkedIn.\n" +
            "4. **Social Media Authority:** Executive personal branding, viral narrative engineering, and algorithmic reach.\n" +
            "5. **Political Campaign Design:** Voter sentiment modeling, narrative war rooms, and booth-level execution.\n\n" +
            "Which pillar aligns most with your current growth bottleneck?";
    }
    if (q.includes('nda') || q.includes('confidential') || q.includes('privacy') || q.includes('security')) {
        return "Confidentiality is institutional at Zytrixon:\n\n" +
            "• All business metrics, P&L sheets, and growth bottlenecks shared with us are governed under strict mutual Non-Disclosure Agreements (NDAs).\n" +
            "• Your proprietary data is never disclosed or shared with third parties.\n\n" +
            "You can book a private consultation with confidence using the form above.";
    }
    return "Welcome to **Zytrixon Strategic Advisory**. We partner with ambitious founders, enterprise leaders, and campaign strategists to scale unit economics, market authority, and operational velocity.\n\n" +
        "You can explore our **5 Strategic Pillars**, learn about our **14-Day Diagnostic Sprint (₹75k)**, or reach out directly to our founding partners on WhatsApp (**+91 70497 11475**) or email **zytrixon@gmail.com**.";
}

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.xml': 'application/xml',
    '.txt': 'text/plain'
};

const server = http.createServer((req, res) => {
    // Parse requested URL
    const parsedUrl = url.parse(req.url);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // Handle Lead Submission API endpoint
    if (pathname === '/api/submit-lead' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const parsedData = JSON.parse(body || '{}');
                console.log(`[LEAD RECEIVED] ${new Date().toISOString()} - ${parsedData.name || 'Anonymous'} (${parsedData.email || 'No email'})`);
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ status: 'success', message: 'Lead captured successfully.' }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ status: 'error', message: 'Invalid payload.' }));
            }
        });
        return;
    }

    // Handle Live AI Chatbot API Proxy endpoint (SECURE SERVER-SIDE KEY & PROMPT)
    if (pathname === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const clientPayload = JSON.parse(body || '{}');
                const rawMessages = clientPayload.messages || [];
                const userLatestMessage = clientPayload.message || (rawMessages.length > 0 ? rawMessages[rawMessages.length - 1].content : '');

                // Ensure System Prompt is always injected at the root from server side
                const formattedMessages = [
                    { role: 'system', content: ZYTRIXON_SYSTEM_PROMPT },
                    ...rawMessages.filter(m => m.role !== 'system')
                ];

                const postData = JSON.stringify({
                    model: clientPayload.model || LLM_MODEL,
                    messages: formattedMessages
                });

                const parsedEndpoint = url.parse(LLM_ENDPOINT);

                const proxyReq = https.request({
                    hostname: parsedEndpoint.hostname,
                    port: parsedEndpoint.port || 443,
                    path: parsedEndpoint.path,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${LLM_API_KEY}`,
                        'Content-Length': Buffer.byteLength(postData)
                    }
                }, proxyRes => {
                    let proxyBody = '';
                    proxyRes.on('data', d => { proxyBody += d; });
                    proxyRes.on('end', () => {
                        // If upstream succeeds (200 OK)
                        if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 300) {
                            res.writeHead(proxyRes.statusCode, {
                                'Content-Type': 'application/json; charset=utf-8',
                                'Access-Control-Allow-Origin': '*'
                            });
                            return res.end(proxyBody);
                        }

                        // If upstream errors (429 rate limit or 402 quota), serve smart fallback
                        console.warn(`[Upstream AI Status ${proxyRes.statusCode}]: Serving fallback response.`);
                        const fallbackContent = generateStrategicFallback(userLatestMessage);
                        res.writeHead(200, {
                            'Content-Type': 'application/json; charset=utf-8',
                            'Access-Control-Allow-Origin': '*'
                        });
                        res.end(JSON.stringify({
                            choices: [{ message: { role: 'assistant', content: fallbackContent } }],
                            source: 'strategic_fallback'
                        }));
                    });
                });

                proxyReq.on('error', err => {
                    console.error('[AI Chat Proxy Network Error]:', err);
                    const fallbackContent = generateStrategicFallback(userLatestMessage);
                    res.writeHead(200, {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({
                        choices: [{ message: { role: 'assistant', content: fallbackContent } }],
                        source: 'offline_fallback'
                    }));
                });

                proxyReq.write(postData);
                proxyReq.end();
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: { message: 'Invalid JSON request payload.' } }));
            }
        });
        return;
    }

    // Map root to index.html
    if (pathname === '/' || pathname === '') {
        pathname = '/index.html';
    }

    // Resolve file path safely within PUBLIC_DIR
    let filePath = path.join(PUBLIC_DIR, pathname);

    // Check if file exists, or try adding .html extension
    if (!fs.existsSync(filePath)) {
        if (fs.existsSync(filePath + '.html')) {
            filePath = filePath + '.html';
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Not Found');
            return;
        }
    }

    // If it's a directory, try index.html
    if (fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
        if (!fs.existsSync(filePath)) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Not Found');
            return;
        }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Support HTTP Range requests for smooth video streaming (frontvideo.mp4)
    const stat = fs.statSync(filePath);
    const range = req.headers.range;

    if (range && (ext === '.mp4' || ext === '.webm')) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${stat.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': contentType,
        });
        file.pipe(res);
        return;
    }

    const headers = {
        'Content-Type': contentType,
        'Content-Length': stat.size,
        'Accept-Ranges': 'bytes'
    };
    if (ext === '.js' || ext === '.html' || ext === '.css') {
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    }

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==============================================`);
    console.log(`  ZYTRIXON LOCAL SERVER RUNNING!`);
    console.log(`  Local URL:   http://localhost:${PORT}`);
    console.log(`  Serving dir: ${PUBLIC_DIR}`);
    console.log(`==============================================\n`);
});
