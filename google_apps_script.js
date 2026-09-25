/**
 * ============================================================================
 * ZYTRIXON — GOOGLE SHEETS & INSTANT EMAIL LEAD DISPATCH ENGINE
 * ============================================================================
 * 
 * 1. TARGET SPREADSHEET:
 *    https://docs.google.com/spreadsheets/d/18rM8qpZw5TVM04r32yI7tHHpCCT7B6AwzShSpin1ab0/edit
 * 
 * 2. INSTANT NOTIFICATION INBOX:
 *    adityakumarchaudhari66@gmail.com
 * ============================================================================
 */

// --- CONFIGURATION ---
const NOTIFICATION_EMAIL = "adityakumarchaudhari66@gmail.com";
const SPREADSHEET_ID = "18rM8qpZw5TVM04r32yI7tHHpCCT7B6AwzShSpin1ab0";
const SHEET_NAME = "Leads";

/**
 * Get target sheet safely (works whether script is bound to sheet or standalone)
 */
function getTargetSheet() {
  let ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {}

  if (!ss) {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    // If Sheet1 exists, use it and rename to Leads
    sheet = ss.getSheets()[0];
    if (sheet) {
      sheet.setName(SHEET_NAME);
    } else {
      sheet = ss.insertSheet(SHEET_NAME);
    }
  }
  return sheet;
}

/**
 * Handle incoming POST requests from website forms
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    let data = {};

    // 1. Parse incoming data (supports JSON, FormData, and URL-encoded parameters)
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = (e && e.parameter) ? e.parameter : {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // 2. Extract Lead Fields
    const timestamp = new Date();
    const formattedDate = Utilities.formatDate(timestamp, "Asia/Kolkata", "dd MMM yyyy, hh:mm:ss a") + " (IST)";
    
    const formType = data.form_type || data.formType || "Strategy Consultation";
    const name = data.name || data.executive_name || "N/A";
    const email = data.email || data.corporate_email || "N/A";
    const focusOrPlan = data.pillar || data.plan || data.focus || "General Inquiry";
    const revenueOrBrand = data.revenue || data.brand || data.company || "N/A";
    const message = data.message || data.bottleneck || data.notes || "None provided";

    // 3. Open Sheet & Setup Headers if empty
    const sheet = getTargetSheet();

    if (sheet.getLastRow() === 0) {
      const headers = [
        "Timestamp (IST)",
        "Form Type",
        "Executive Name",
        "Corporate Email",
        "Strategic Focus / Plan",
        "Revenue / Enterprise Brand",
        "Bottleneck / Notes",
        "Status"
      ];
      
      sheet.appendRow(headers);
      
      // Style Header Row: Luxury Dark with Champagne Gold text
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#0A0B0D");
      headerRange.setFontColor("#D8C7B5");
      headerRange.setFontWeight("bold");
      headerRange.setFontFamily("Arial");
      headerRange.setFontSize(10);
      sheet.setFrozenRows(1);
    }

    // 4. Append New Lead Data
    sheet.appendRow([
      formattedDate,
      formType,
      name,
      email,
      focusOrPlan,
      revenueOrBrand,
      message,
      "New Lead"
    ]);

    // Auto-fit columns for clean executive display
    sheet.autoResizeColumns(1, 8);

    // 5. Send Instant HTML Notification to adityakumarchaudhari66@gmail.com
    try {
      sendInstantNotificationEmail({
        date: formattedDate,
        formType: formType,
        name: name,
        email: email,
        focusOrPlan: focusOrPlan,
        revenueOrBrand: revenueOrBrand,
        message: message
      });
    } catch (mailErr) {
      Logger.log("Email dispatch note: " + mailErr.toString());
    }

    // 6. Return JSON response with CORS headers
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Lead recorded in Google Sheet and email dispatched to " + NOTIFICATION_EMAIL,
      timestamp: formattedDate
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle GET requests (Quick URL verification in browser)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Zytrixon Lead Webhook is active. Notifications target: " + NOTIFICATION_EMAIL,
    spreadsheetId: SPREADSHEET_ID
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Send Instant Branded HTML Notification Email to Aditya Kumar Chaudhari
 */
function sendInstantNotificationEmail(lead) {
  const subject = "⚡ New Zytrixon Lead: " + lead.name + " (" + lead.focusOrPlan + ")";
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #0A0B0D; color: #FFFFFF; margin: 0; padding: 24px; }
        .card { background-color: #12141A; border: 1px solid rgba(216, 199, 181, 0.3); border-radius: 8px; max-width: 620px; margin: 0 auto; overflow: hidden; }
        .header { background-color: #090A0D; padding: 24px 32px; border-bottom: 1px solid rgba(216, 199, 181, 0.2); }
        .logo { font-size: 18px; font-weight: 800; letter-spacing: 0.18em; color: #FFFFFF; text-transform: uppercase; }
        .badge { display: inline-block; background: #D8C7B5; color: #0A0B0D; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; margin-left: 12px; vertical-align: middle; }
        .body { padding: 32px; }
        .headline { font-size: 22px; font-weight: 700; color: #FFFFFF; margin: 0 0 10px 0; }
        .subtitle { font-size: 13px; color: #8E929E; margin-bottom: 24px; }
        .lead-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .lead-table td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
        .lead-table .label { color: #8E929E; font-weight: 600; width: 34%; text-transform: uppercase; font-size: 11px; letter-spacing: 0.08em; }
        .lead-table .value { color: #FFFFFF; font-weight: 500; }
        .message-box { background: rgba(0, 0, 0, 0.4); border-left: 3px solid #D8C7B5; padding: 16px; border-radius: 4px; font-size: 13px; line-height: 1.6; color: #D8C7B5; margin-top: 8px; }
        .cta-row { margin-top: 28px; text-align: center; }
        .cta-btn { display: inline-block; background-color: #D8C7B5; color: #0A0B0D; text-decoration: none; font-weight: 700; font-size: 13px; letter-spacing: 0.06em; padding: 14px 28px; border-radius: 9999px; text-transform: uppercase; }
        .footer { background-color: #090A0D; padding: 16px 32px; font-size: 11px; color: #585B66; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.06); }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <span class="logo">ZYTRIXON<sup>®</sup></span>
          <span class="badge">${lead.formType}</span>
        </div>
        <div class="body">
          <h2 class="headline">New Executive Inbound Received</h2>
          <p class="subtitle">Dispatched live from Zytrixon Digital Infrastructure on ${lead.date}</p>
          
          <table class="lead-table">
            <tr>
              <td class="label">Executive Name</td>
              <td class="value"><strong>${lead.name}</strong></td>
            </tr>
            <tr>
              <td class="label">Corporate Email</td>
              <td class="value"><a href="mailto:${lead.email}" style="color: #D8C7B5; text-decoration: underline;">${lead.email}</a></td>
            </tr>
            <tr>
              <td class="label">Strategic Focus / Tier</td>
              <td class="value"><strong>${lead.focusOrPlan}</strong></td>
            </tr>
            <tr>
              <td class="label">Revenue / Enterprise</td>
              <td class="value">${lead.revenueOrBrand}</td>
            </tr>
          </table>

          <div style="margin-top: 16px;">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #8E929E;">Strategic Bottleneck / Objectives:</div>
            <div class="message-box">${lead.message.replace(/\\n/g, '<br>')}</div>
          </div>

          <div class="cta-row">
            <a href="mailto:${lead.email}?subject=Re:%20Zytrixon%20Strategic%20Consultation%20-%20Next%20Steps" class="cta-btn">
              Reply Directly to Executive →
            </a>
          </div>
        </div>
        <div class="footer">
          Zytrixon Executive Advisory Dispatch System • Direct Real-Time Delivery
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    to: NOTIFICATION_EMAIL,
    subject: subject,
    htmlBody: htmlBody
  };
  if (lead.email && lead.email.indexOf("@") !== -1) {
    mailOptions.replyTo = lead.email;
  }
  MailApp.sendEmail(mailOptions);
}

/**
 * ============================================================================
 * ONE-CLICK TEST & AUTHORIZATION FUNCTION:
 * Click "Run" on this function in the top bar of Apps Script.
 * It will:
 * 1. Open Google's permission prompt ("Allow" access to Sheets and Gmail).
 * 2. Immediately write the headers + test row in your Google Sheet.
 * 3. Immediately send a test notification to adityakumarchaudhari66@gmail.com!
 * ============================================================================
 */
function testSend() {
  const testPayload = {
    form_type: "Strategy Consultation (Test Run)",
    name: "Aditya Kumar Chaudhari",
    email: "adityakumarchaudhari66@gmail.com",
    pillar: "Business Strategy & Consulting",
    revenue: "₹50L/mo",
    message: "Verifying live Google Sheet storage and instant email delivery to adityakumarchaudhari66@gmail.com."
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testPayload)
    }
  };

  const response = doPost(mockEvent);
  Logger.log("Execution Result: " + response.getContent());
}
