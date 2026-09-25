# 🚀 Zytrixon Google Sheets & Instant Email Setup Guide (2 Minutes)

Apne website forms (`contact.html`, `onboarding.html`, `insights.html`) ka data **Google Sheet** mein save karne aur **instant email notification** paane ke liye bas ye simple steps follow karein:

---

## Step 1: Naya Google Sheet Banayein
1. Browser mein [sheets.new](https://sheets.new) open karein.
2. Sheet ka naam rakhein: **`Zytrixon - Client Inbounds`**.

---

## Step 2: Apps Script Editor Kholein
1. Google Sheet ke top menu bar mein click karein:
   **`Extensions`** > **`Apps Script`**
2. Script editor khul jayega. Vahan pehle se likha hua placeholder code delete kar dein.

---

## Step 3: Script Code Paste Karein
1. Apne project mein bani file [google_apps_script.js](file:///d:/my%20projects/ZYTRIXON%201/google_apps_script.js) ko open karein.
2. Pura code copy karein aur Google Apps Script editor mein paste kar dein.
3. Check karein line 33:
   ```javascript
   const NOTIFICATION_EMAIL = "zytrixon@gmail.com";
   ```
   *(Agar kisi aur email par alert chahiye toh yahan email badal sakte hain).*
4. Top bar mein **Save** (💾 icon) par click karein.

---

## Step 4: Web App ke roop mein Deploy Karein
1. Top-right corner mein blue button **`Deploy`** par click karein > **`New deployment`** select karein.
2. Left side mein gear icon (⚙️) par click karke **`Web app`** select karein.
3. Form mein ye settings set karein:
   - **Description**: `Zytrixon Lead Webhook`
   - **Execute as**: `Me (<your-email>)`
   - **Who has access**: **`Anyone`**  *(⚠️ Ye sabse zaruri step hai, taaki website forms data bhej sakein)*
4. **`Deploy`** button par click karein.

---

## Step 5: Google Permissions Allow Karein
1. Popup aayega **"Authorization required"**, click karein **`Review permissions`**.
2. Apna Google account select karein.
3. Warning screen dikhegi **"Google hasn't verified this app"**:
   - Niche chhote aksharon mein **`Advanced`** par click karein.
   - Fir click karein **`Go to Untitled project (unsafe)`**.
4. Niche scroll karke **`Allow`** par click karein.

---

## Step 6: Web App URL Copy Karein aur Website mein Paste Karein
1. Deployment complete hote hi aapko ek **`Web app URL`** milega (jo `/exec` par end hota hai).
   *Example: `https://script.google.com/macros/s/AKfycbx.../exec`*
2. Is URL ko copy karein.
3. Apne project ki file [public/js/config.js](file:///d:/my%20projects/ZYTRIXON%201/public/js/config.js) open karein aur line 11 par paste kar dein:
   ```javascript
   window.ZYTRIXON_CONFIG = {
       googleScriptUrl: "https://script.google.com/macros/s/YOUR_DEPLOYED_URL_HERE/exec",
       ...
   };
   ```
4. Save karein. **Done! 🎉**

---

## ✨ Kya Hoga Jab Koi Form Bharega?
1. **Google Sheet**:
   - `Leads` tab automatically ban jayega.
   - Dark & Champagne luxury header style ke sath columns create ho jayenge:
     `Timestamp (IST) | Form Type | Executive Name | Corporate Email | Focus/Plan | Revenue/Brand | Bottleneck/Notes | Status`
   - Har naya lead real-time mein nayi row mein add hota jayega.
2. **Instant Email Alert**:
   - `zytrixon@gmail.com` par instant branded HTML email aayega jisme executive ka name, email, focus, revenue aur message stylish table mein hoga.
   - Aap direct **Reply** dabakar lead ko turant email bhej sakte hain (Reply-To lead ke corporate email par set rehta hai).
3. **Website User Experience**:
   - Form submit hote hi user ko high-end **Consultation Requested** success overlay dikhega.
