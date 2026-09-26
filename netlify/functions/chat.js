// ============================================================================
// Netlify Serverless Function: Zytrixon AI Strategic Concierge Proxy (/api/chat)
// Reads LLM_API_KEY, LLM_ENDPOINT, and LLM_MODEL securely from Netlify Environment Variables
// ============================================================================

const https = require('https');
const url = require('url');

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

exports.handler = async function (event, context) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: corsHeaders, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const rawMessages = body.messages || [];
        const userLatestMessage = body.message || (rawMessages.length > 0 ? rawMessages[rawMessages.length - 1].content : '');

        const LLM_API_KEY = process.env.LLM_API_KEY || '';
        const LLM_ENDPOINT = process.env.LLM_ENDPOINT || '';
        const LLM_MODEL = process.env.LLM_MODEL || '';

        // If credentials are not configured, return strategic fallback
        if (!LLM_API_KEY || !LLM_ENDPOINT) {
            const fallbackReply = generateStrategicFallback(userLatestMessage);
            return {
                statusCode: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    choices: [{ message: { role: 'assistant', content: fallbackReply } }]
                })
            };
        }

        const formattedMessages = [
            { role: 'system', content: ZYTRIXON_SYSTEM_PROMPT },
            ...rawMessages.filter(m => m.role !== 'system')
        ];

        const postData = JSON.stringify({
            model: body.model || LLM_MODEL || 'default',
            messages: formattedMessages
        });

        const parsedEndpoint = url.parse(LLM_ENDPOINT);

        return new Promise((resolve) => {
            const req = https.request({
                hostname: parsedEndpoint.hostname,
                port: parsedEndpoint.port || 443,
                path: parsedEndpoint.path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${LLM_API_KEY}`,
                    'Content-Length': Buffer.byteLength(postData)
                }
            }, (res) => {
                let resBody = '';
                res.on('data', d => { resBody += d; });
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({
                            statusCode: 200,
                            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                            body: resBody
                        });
                    } else {
                        const fallbackReply = generateStrategicFallback(userLatestMessage);
                        resolve({
                            statusCode: 200,
                            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                choices: [{ message: { role: 'assistant', content: fallbackReply } }]
                            })
                        });
                    }
                });
            });

            req.on('error', () => {
                const fallbackReply = generateStrategicFallback(userLatestMessage);
                resolve({
                    statusCode: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        choices: [{ message: { role: 'assistant', content: fallbackReply } }]
                    })
                });
            });

            req.write(postData);
            req.end();
        });
    } catch (err) {
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};
