// ============================================================================
// ZYTRIXON — GLOBAL CONFIGURATION & LEAD DISPATCH SYSTEM
// ============================================================================

window.ZYTRIXON_CONFIG = {
    /**
     * GOOGLE APPS SCRIPT WEB APP ENDPOINT:
     * 1. Deploy google_apps_script.js from project root as a Web App (Access: Anyone).
     * 2. Paste your Google Web App URL below between the quotes.
     *    Example: "https://script.google.com/macros/s/AKfycbx.../exec"
     */
    googleScriptUrl: "https://script.google.com/macros/s/AKfycbwYjrGTlq7aIM64p_ratXDxPks0fim2gSZCZn_0Gx4k_h-9EteQKwGG5SHRfGe4ej42/exec",

    // Fallback webhook (Formspree) if Google Apps Script URL has not been pasted yet
    fallbackUrl: "https://formspree.io/f/mojoqqkw",

    // Executive Contact Coordinates
    notificationEmail: "adityakumarchaudhari66@gmail.com",
    whatsappNumber: "917049711475",

    /**
     * ========================================================================
     * AI CHATBOT / CHAT SUPPORT API CONFIGURATION
     * Protected via backend proxy (/api/chat) — ZERO keys exposed to frontend
     * ========================================================================
     */
    chatbot: {
        // Secure local backend proxy route (handles LLM communication on server)
        apiUrl: "/api/chat",
        model: "qwen3.7-flash"
    }
};

/**
 * Universal Lead Submitter for Zytrixon Forms
 * Handles Google Sheets dispatch, instant email triggering, and fallback routing.
 */
window.submitZytrixonLead = async function(formElement, additionalData = {}) {
    const formData = new FormData(formElement);
    const payload = Object.fromEntries(formData.entries());

    // Merge any additional metadata (form_type, page_source, timestamp)
    Object.assign(payload, additionalData, {
        page_source: window.location.pathname,
        submitted_at: new Date().toISOString()
    });

    const targetUrl = (window.ZYTRIXON_CONFIG.googleScriptUrl && window.ZYTRIXON_CONFIG.googleScriptUrl.trim() !== "")
        ? window.ZYTRIXON_CONFIG.googleScriptUrl.trim()
        : window.ZYTRIXON_CONFIG.fallbackUrl;

    const isGoogleScript = targetUrl.includes("script.google.com");

    if (isGoogleScript) {
        // Gold standard Google Apps Script dispatch:
        // text/plain avoids CORS preflight OPTIONS check while transmitting full JSON payload
        try {
            await fetch(targetUrl, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(payload),
                mode: "no-cors" // Guarantees execution without browser CORS blocking
            });
            return { success: true, destination: "Google Sheets & Email" };
        } catch (err) {
            console.error("Google Apps Script submission error:", err);
            // Fallback attempt via standard FormData
            const formBody = new URLSearchParams(payload);
            await fetch(targetUrl, {
                method: "POST",
                mode: "no-cors",
                body: formBody
            });
            return { success: true, destination: "Google Sheets & Email (fallback)" };
        }
    } else {
        // Fallback provider (Formspree)
        const response = await fetch(targetUrl, {
            method: "POST",
            body: formData,
            headers: { "Accept": "application/json" }
        });
        if (!response.ok) {
            throw new Error(`Fallback submission failed: ${response.statusText}`);
        }
        return { success: true, destination: "Fallback Webhook" };
    }
};
