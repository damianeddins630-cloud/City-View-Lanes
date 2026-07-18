# CityView Lanes

Fort Worth bowling center website — leagues, parties, Hall of Fame pro shop, member accounts, and admin tools.

Built with **Next.js** for easy deploy on **Vercel**.

## Master Admin login

| Field | Value |
| --- | --- |
| Username | `masteradmin` |
| Password | `CityView#Master2026!` |
| Role | Master Admin |

Change this password after first login (Profile → New password).

## Local development

```bash
npm install
cp .env.example .env.local   # if needed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What’s included

- **Home** — silver / white / blue brand, real CityView photos + logo
- **Hours** — daily open hours (editable in admin)
- **Leagues** — searchable table (empty until you add leagues)
- **Pro Shop** — Ballard’s Academy (gold / red / black Hall of Fame theme)
- **Book a Party** — requires login; emails “we will be with you shortly”
- **Login / Create account** — default role: Member
- **Profile** — photo, email, phone, name, birth date, username, password
- **Admin panel**
  - Users list (+ booking / league history)
  - Role Manager
  - Admin Chat
  - Bookings & League signups (approve / deny + email)
  - Admins list (sorted by role)
  - League Manager
  - Hours editor

## Emails

Outbound emails are recorded in the data store and logged to the server console until SMTP is connected. Booking submit always queues the “we will be with you shortly” message.

## Deploy to Vercel

1. Import this GitHub repo (or upload the zip) at [vercel.com/new](https://vercel.com/new)
2. Framework: **Next.js**
3. Add env vars:
   - `AUTH_SECRET` = long random string
   - `BLOB_READ_WRITE_TOKEN` = from Vercel **Storage → Blob** (needed so profile/hours/admin changes save)
4. Deploy

### Make saves stick on Vercel (REQUIRED)

If hours/profile keep resetting, Blob is missing.

1. Vercel → your project → **Storage**
2. Create **Blob**
3. **Connect** it to this project (adds `BLOB_READ_WRITE_TOKEN`)
4. Click **Redeploy**
5. Edit hours again — they should stay on `/hours`

### How to update / fix the live site later

**Option A — GitHub (best)**  
Push to the connected branch → Vercel redeploys automatically.

**Option B — Zip upload**  
1. Download the latest release zip  
2. Vercel → your project → upload / create deployment  
3. Keep the same env vars

## Business info

- **Address:** 6601 Oakmont Blvd, Fort Worth, TX 76132
- **Phone:** (817) 346-0333
- **Pro Shop Manager:** Tim Watson — (817) 768-8748 — Tim.ballardsbowlingacademy@gmail.com
