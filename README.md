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

1. Import this GitHub repo at [vercel.com/new](https://vercel.com/new)
2. Framework: **Next.js**
3. Add env var `AUTH_SECRET` (long random string)
4. Deploy

> Note: On Vercel’s serverless filesystem, runtime data writes go to `/tmp` and can reset on cold starts. For production persistence, plug in Postgres / Supabase later — the API layer is ready to swap.

## Business info

- **Address:** 6601 Oakmont Blvd, Fort Worth, TX 76132
- **Phone:** (817) 346-0333
