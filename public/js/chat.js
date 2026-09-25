/**
 * ============================================================================
 * ZYTRIXON — EXECUTIVE AI CHAT SUPPORT ENGINE
 * Real-Time Strategic Concierge & Modular API Connector
 * ============================================================================
 */

(function () {
    'use strict';

    // Conversation history buffer for multi-turn context
    const conversationHistory = [];

    document.addEventListener('DOMContentLoaded', () => {
        const widget = document.getElementById('chatSupportWidget');
        const triggerBtn = document.getElementById('chatSupportBtn');
        const closeBtn = document.getElementById('chatWidgetClose');
        const minimizeBtn = document.getElementById('chatWidgetMinimize');
        const form = document.getElementById('chatSupportForm');
        const input = document.getElementById('chatUserInput');
        const messagesContainer = document.getElementById('chatMessagesContainer');
        const promptPills = document.querySelectorAll('.chat-prompt-pill');

        if (!form || !messagesContainer) return;

        // Toggle chat widget visibility if trigger and modal exist
        if (triggerBtn && widget) {
            function openChat() {
                widget.classList.add('active');
                widget.setAttribute('aria-hidden', 'false');
                if (input) input.focus();
                scrollToBottom();
            }

            function closeChat() {
                widget.classList.remove('active');
                widget.setAttribute('aria-hidden', 'true');
            }

            triggerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (widget.classList.contains('active')) {
                    closeChat();
                } else {
                    openChat();
                }
            });

            if (closeBtn) closeBtn.addEventListener('click', closeChat);
            if (minimizeBtn) minimizeBtn.addEventListener('click', closeChat);
        }

        // Quick prompt suggestions handler
        promptPills.forEach(pill => {
            pill.addEventListener('click', () => {
                const promptText = pill.getAttribute('data-prompt') || pill.textContent;
                if (input) {
                    input.value = promptText;
                    submitMessage(promptText);
                }
            });
        });

        // Form submit handler
        if (form && input) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const text = input.value.trim();
                if (!text) return;
                submitMessage(text);
            });
        }

        // Process message transmission
        async function submitMessage(userText) {
            if (!userText) return;

            // Render User Bubble
            appendMessage(userText, 'user');
            if (input) input.value = '';

            // Hide quick prompt pills after first interaction
            const promptsWrapper = document.getElementById('chatQuickPrompts');
            if (promptsWrapper) promptsWrapper.style.display = 'none';

            // Show Typing Indicator
            const typingIndicator = showTypingIndicator();
            scrollToBottom();

            // Track user message in history
            conversationHistory.push({ role: 'user', content: userText });

            try {
                const reply = await dispatchToChatbotAPI(userText, conversationHistory);
                removeTypingIndicator(typingIndicator);
                appendMessage(reply, 'ai');
                conversationHistory.push({ role: 'assistant', content: reply });
            } catch (err) {
                console.error('[Zytrixon AI Chatbot Error]:', err);
                removeTypingIndicator(typingIndicator);
                appendMessage(
                    "Our senior advisory committee is standing by. You can directly connect with our partner desk on WhatsApp (+91 70497 11475) or submit your brief using the consultation form on this page.",
                    'ai'
                );
            }

            scrollToBottom();
        }

        // Append message bubble to stream
        function appendMessage(text, sender = 'ai') {
            const msgDiv = document.createElement('div');
            msgDiv.className = `chat-message chat-message-${sender}`;

            const bubble = document.createElement('div');
            bubble.className = 'chat-bubble';

            // Format markdown-like bold and links cleanly
            bubble.innerHTML = formatChatText(text);

            const timestamp = document.createElement('span');
            timestamp.className = 'chat-timestamp';
            const now = new Date();
            timestamp.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            bubble.appendChild(timestamp);
            msgDiv.appendChild(bubble);
            messagesContainer.appendChild(msgDiv);
            scrollToBottom();
        }

        // Show pulsing typing indicator
        function showTypingIndicator() {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'chat-message chat-message-ai chat-typing-wrapper';
            typingDiv.innerHTML = `
                <div class="chat-typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            `;
            messagesContainer.appendChild(typingDiv);
            return typingDiv;
        }

        function removeTypingIndicator(el) {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }

        function scrollToBottom() {
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }

        function formatChatText(str) {
            if (!str) return '';
            // Basic HTML escape
            let formatted = str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            // Headers (### Heading)
            formatted = formatted.replace(/^### (.*$)/gim, '<h5 style="margin: 12px 0 6px 0; color: #FFFFFF; font-size: 14px; font-weight: 600;">$1</h5>');
            formatted = formatted.replace(/^## (.*$)/gim, '<h4 style="margin: 14px 0 8px 0; color: #FFFFFF; font-size: 15px; font-weight: 600;">$1</h4>');

            // Bold **text**
            formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            // Bullet points (* item or - item)
            formatted = formatted.replace(/^\s*[\*\-]\s+(.*$)/gim, '<div style="display: flex; gap: 8px; margin: 4px 0;"><span style="color: #D8C7B5; flex-shrink: 0;">•</span><span>$1</span></div>');

            // Auto-link WhatsApp and emails
            formatted = formatted.replace(/(https:\/\/wa\.me\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #25D366; text-decoration: underline; font-weight: 500;">$1</a>');
            formatted = formatted.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1" style="color: #D8C7B5; text-decoration: underline;">$1</a>');

            // Line breaks
            formatted = formatted.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
            formatted = formatted.replace(/<\/div><br>/g, '</div>');

            return formatted;
        }
    });

    /**
     * Dispatcher: Connects to secure backend proxy (/api/chat)
     * The LLM API key and system prompt are stored strictly on the server.
     */
    async function dispatchToChatbotAPI(userText, history) {
        const config = window.ZYTRIXON_CONFIG && window.ZYTRIXON_CONFIG.chatbot;
        const apiUrl = (config && config.apiUrl) ? config.apiUrl.trim() : "/api/chat";

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: history,
                    message: userText
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    return data.choices[0].message.content;
                }
                if (data.reply) return data.reply;
                if (data.response) return data.response;
                if (data.message) return data.message;
            }
        } catch (err) {
            console.warn('[Backend Chat API error, using smart fallback]:', err);
        }

        // ========================================================================
        // SMART LOCAL STRATEGIC ASSISTANT (Fallback when API endpoint is pending)
        // ========================================================================
        await new Promise(r => setTimeout(r, 650)); // Realistic advisory thinking delay

        const query = userText.toLowerCase();

        if (query.includes('price') || query.includes('pricing') || query.includes('cost') || query.includes('retainer') || query.includes('tier') || query.includes('fees')) {
            return "Zytrixon operates on three disciplined engagement tiers:\n\n" +
                "1. **Tier 01: Diagnostic Sprint (₹75,000)** — A 14-day forensic audit of your unit economics, ad channels, and revenue bottlenecks.\n" +
                "2. **Tier 02: Advisory Retainer (₹1,50,000/mo)** — Strategic direction, weekly war rooms, and executive governance.\n" +
                "3. **Tier 03: Growth Partner (₹3,00,000+/mo)** — Full embedded execution across performance marketing, social authority, and engineering.\n\n" +
                "Would you like to schedule a fit assessment or submit the intake form on this page?";
        }

        if (query.includes('diagnostic') || query.includes('sprint') || query.includes('14-day') || query.includes('audit')) {
            return "Our **14-Day Forensic Diagnostic Sprint** is our foundational engagement:\n\n" +
                "• **Week 1:** Data ingestion under bilateral NDA (P&L, CAC/LTV, ad metrics, sales pipelines).\n" +
                "• **Week 2:** Synthesis and delivery of a mathematical 90-day growth roadmap and revenue architecture.\n\n" +
                "Investment is fixed at ₹75,000. You can initiate this sprint using the form above.";
        }

        if (query.includes('nda') || query.includes('confidential') || query.includes('privacy') || query.includes('security') || query.includes('data')) {
            return "We treat client data with strict institutional rigor. Prior to ingesting any proprietary financials, margins, or ad accounts, we execute a **Bilateral Non-Disclosure Agreement (NDA)**.\n\nAll metrics remain strictly isolated and protected under Indian IT & DPDP regulations.";
        }

        if (query.includes('book') || query.includes('consultation') || query.includes('call') || query.includes('contact') || query.includes('meeting') || query.includes('schedule')) {
            return "To request an executive strategy consultation:\n\n" +
                "1. Fill out the consultation intake form right here on this page with your current revenue stage.\n" +
                "2. Or connect immediately with our senior partnership desk via **WhatsApp at +91 70497 11475**.\n\nOur committee reviews all submissions within 2 business hours.";
        }

        if (query.includes('marketing') || query.includes('performance') || query.includes('ads') || query.includes('facebook') || query.includes('google') || query.includes('roas')) {
            return "Our **Performance Marketing Pillar** architects full-funnel customer acquisition engines. We combine mathematical media buying across Meta & Google with high-converting creative strategy and narrative authority to maximize ROAS and scale commercial revenue.";
        }

        if (query.includes('political') || query.includes('campaign') || query.includes('election') || query.includes('voter')) {
            return "Our **Political Campaign Design Pillar** provides end-to-end election warfare: voter sentiment mapping, micro-targeted digital narratives, constituency war rooms, and strategic field mobilization.";
        }

        if (query.includes('service') || query.includes('what do you do') || query.includes('pillar') || query.includes('offer')) {
            return "Zytrixon is a pure Business Growth & Strategy Consultancy operating across 5 core disciplines:\n\n" +
                "• **Business Strategy & Market Modeling**\n" +
                "• **Business Consulting & Revenue Architecture**\n" +
                "• **Performance & Digital Marketing**\n" +
                "• **Social Media & Narrative Warfare**\n" +
                "• **Political Campaign Design**\n\n" +
                "Which area is your enterprise looking to accelerate?";
        }

        // Default executive response
        return "Thank you for reaching out to Zytrixon Advisory. We partner with ambitious enterprises and leaders to architect scalable growth moats and maximize commercial velocity.\n\n" +
            "How can our senior advisory committee assist you today? You can ask about our **Retainer Tiers**, **Diagnostic Sprint**, or book a direct consultation using the form above.";
    }
})();
