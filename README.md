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

## Notes

This project uses Next.js App Router, TypeScript, and Tailwind CSS.

If you want a live checkout integration, you can replace the static PayPal URLs with your store or payment gateway links.
