# Minecraft FFA Server Website

A Next.js landing page for your Minecraft FFA server with purchasable rank cards.

## Features

- Server information and connection details
- Rank store section with PayPal purchase links
- Responsive design with Tailwind CSS
- Easy to customize for your server IP and payment links

## Setup

Install dependencies if needed:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Customize for your server

- Replace `play.yourffa.server` in `src/app/page.tsx` with your actual Minecraft server IP.
- Replace the `YOUR_PAYPAL_ME` placeholders in the rank purchase links with your real PayPal payment links.
- Edit the rank cards in `src/app/page.tsx` to match your available ranks and pricing.

Current defaults in this project:

- Server IP: `mc.effectsffa.xyz` (already set in `src/app/page.tsx`)
- PayPal.me: `https://paypal.me/Hassaan323` (VIP/Ultimate links preconfigured in `src/app/pay/[rank]/page.tsx`)

## Admin dashboard

`/admin` shows every rank purchase (Purchase ID, IGN, rank, date/time, status)
with search, filters, sortable columns, and pagination — backed by the same
Redis store the PayPal checkout writes to. It's protected end-to-end:
`src/proxy.ts` redirects unauthenticated visitors away from `/admin/*` pages
and returns 401 for `/api/admin/*` without a valid session, and every admin
API route re-checks the session itself (defense in depth, not just the
proxy). Login is rate-limited to 5 attempts per 15 minutes per IP.

### One-time setup

Set three environment variables (locally in `.env.local`, and in Vercel →
Project → Settings → Environment Variables for production):

```bash
ADMIN_USERNAME=youradminname
ADMIN_PASSWORD_HASH=<bcrypt hash, see below>
ADMIN_SESSION_SECRET=<random 32+ byte secret, see below>
```

Generate the bcrypt hash for whatever password you want to log in with
(replace `your-password-here`):

```bash
node -e "console.log(require('bcryptjs').hashSync('your-password-here', 12))"
```

Generate a session-signing secret:

```bash
openssl rand -base64 32
```

Never commit real values for these — only `.env.local` (gitignored) or your
hosting provider's environment variable settings.

## Notes

This project uses Next.js App Router, TypeScript, and Tailwind CSS.

If you want a live checkout integration, you can replace the static PayPal URLs with your store or payment gateway links.
