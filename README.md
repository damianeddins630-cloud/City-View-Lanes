# CityView Lanes

Fort Worth bowling center website — leagues, parties, Hall of Fame pro shop, member accounts, and admin tools.

Built with **Next.js** for easy deploy on **Vercel**.

## Edit from GitHub (easiest)

Your site files live here:  
**https://github.com/damianeddins630-cloud/City-View-Lanes** (branch: `main`)

1. Open a file (example: `src/app/page.tsx` for the home page)
2. Click the pencil → edit → **Commit changes** to `main`
3. Connect this repo to your **same** Vercel project (Settings → Git) once  
   → then every commit updates the live site automatically

**Which file does what?** See [`EDIT-ON-GITHUB.txt`](./EDIT-ON-GITHUB.txt)  
**Deploy steps:** See [`UPDATE-VERCEL.txt`](./UPDATE-VERCEL.txt)

## Website Owner login

| Field | Value |
| --- | --- |
| Username | `cityview_damian` |
| Password | `Archer6!9_20` |
| Role | Website Owner |

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
3. Deploy once
4. Connect Blob (below) and **Redeploy**

See `DEPLOY-SAVES.txt` for click-by-click zip instructions.

### Make saves stick on Vercel (REQUIRED)

Hours, profiles, bookings, and leagues **will not stay** on Vercel until Blob is connected. The admin panel shows a green “Saves are on” banner when storage is ready.

1. Vercel → **the same project as your live URL** → **Storage**
2. Create **Blob** (Private or Public — both work)
3. **Connect** it to this project  
   - Newer projects get `BLOB_STORE_ID` (OIDC)  
   - Older ones may get `BLOB_READ_WRITE_TOKEN`  
   - Either is fine
4. **Deployments → Redeploy** (required)
5. Open **Admin** → click **Test save now** → must say **PASS**
6. Mode should be `blob`, not `memory`

If you re-upload a zip later, upload into that **same** project so Blob stays connected.

### How to update / fix the live site later

**Option A — GitHub (best)**  
Push to the connected branch → Vercel redeploys automatically.

**Option B — Zip upload**  
1. Download the latest release zip  
2. Vercel → your **existing** project → upload / create deployment  
3. Keep the same Blob env vars (do not create a brand-new project)

## Business info

- **Address:** 6601 Oakmont Blvd, Fort Worth, TX 76132
- **Phone:** (817) 346-0333
- **Pro Shop Manager:** Tim Watson
