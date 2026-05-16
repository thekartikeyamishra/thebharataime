# TheBharatAI WhatsApp Bot

Multilingual government scheme eligibility engine on WhatsApp.
Languages: Hindi · Marathi · Telugu · Tamil · English

---

## Quick Setup (Windows PowerShell)

```powershell
# From project root
cd whatsapp-bot

# Install dependencies (takes 2–3 min first time)
npm install

# Start the bot
node bot.js
```

You'll see a **QR code** in the terminal.

1. Open **WhatsApp** on your phone
2. Go to **Settings → Linked Devices → Link a Device**
3. Scan the QR code
4. Bot is now live ✅

---

## Test the Bot

Send any of these to your own WhatsApp number (the one you used to scan):

```
hi           → Welcome message + language selection
MENU         → Main menu
1            → Start eligibility check
2            → Browse schemes
3            → State-wise schemes
4            → About TheBharatAI
RESET        → Start over
help         → Help / commands
```

---

## Conversation Flow

```
User sends "hi"
  ↓
Language selection (5 options)
  ↓
Main menu (5 options)
  ↓ (option 1: Check Eligibility)
Question 1: State
Question 2: Gender
Question 3: Age
Question 4: Category (SC/ST/OBC/Gen/EWS)
Question 5: Occupation
  ↓
AI scans schemes…
  ↓
Results with matched schemes + apply links
  ↓
Post-result menu (check again / browse / share)
```

---

## Production Deployment

### Option 1: VPS with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start bot (auto-restart on crash)
pm2 start bot.js --name bharatai-bot

# View logs
pm2 logs bharatai-bot

# Auto-start on server reboot
pm2 startup && pm2 save
```

### Option 2: Railway / Render / Fly.io

```bash
# Create Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "bot.js"]
```

### Option 3: Meta WhatsApp Business Cloud API (>10k users/day)

Replace Baileys with Meta's official API for:
- No phone needed (permanent session)
- 1000+ messages/day
- Template messages with buttons
- Analytics dashboard

Cost: Free for first 1,000 conversations/month

---

## Architecture

```
User WhatsApp ──→ Baileys WebSocket ──→ bot.js
                                           ↓
                                    State Machine
                                    (sessions Map)
                                           ↓
                                    Scheme Matcher
                                    (SCHEMES_DB)
                                           ↓
                                    Response Builder
                                    (multilingual MSG)
                                           ↓
                               WhatsApp reply ──→ User
```

---

## Rate Limits

- Max 30 messages per user per hour
- Session cleanup: every 30 minutes
- Idle session timeout: 1 hour

---

## Session Data (DPDP Act 2023 Compliant)

- All session data is **in-memory only**
- No Aadhaar, PAN, or bank data collected
- Sessions cleared after 1 hour of inactivity
- No data persisted to disk or database
- User answers (state, gender, age, category, occupation) are not stored after conversation ends

---

## WhatsApp Bot Number

Use any personal WhatsApp number for testing.
For production: Get a dedicated number + WhatsApp Business account.
Suggested naming: `+91-XXXXXXXXXX` (TheBharatAI)

---

## Troubleshooting

**QR code expired?**
→ The QR code refreshes every 60 seconds. Scan quickly.

**Bot disconnected?**
→ Session files are in `auth_info/`. Don't delete them.
→ Bot auto-reconnects on disconnect.

**Logged out?**
→ Delete `auth_info/` folder and restart. Re-scan QR.

**Messages not delivered?**
→ Check internet connection. WhatsApp may have temporarily blocked due to rapid reconnections.

---

© 2025-2026 Kartikeya Mishra · TheBharatAI
NOT affiliated with Government of India