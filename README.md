# Sawa Citi — E-Commerce & Management Platform

A supermarket storefront and management platform built with React, Vite, Express, and MongoDB.
All bundled product, price, and branch data is for demonstration and is not live Sawa Citi inventory.

## What is implemented

- Customer storefront with product search, categories, offers, product details, cart, wishlist,
  reusable weekly shopping list, checkout, order tracking, account, and informational pages.
- Express API with catalog, authentication and roles, cart, orders, payments, reviews, branches,
  notifications, and management routes.
- Admin pages for overview, orders, products, categories, and inventory.
- Independent MongoDB catalog with manual product management, CSV/XLSX imports, CSV export, and
  branch-level inventory movement history.
- Checkout substitution preferences saved with each order and visible to customers and staff.
- Demo data seeding, mock payments, in-memory MongoDB for local development without a configured
  database, and persistent MongoDB support through `MONGO_URI`.
- Official Sawa Citi logo, social profiles, Isokko store link, and WhatsApp contact in the site
  branding.
- Get the App page and download badges linking to the Isokko app on the App Store and Google Play,
  with quick links to shopping, order tracking and support.
- Savings-first sorting, quick budget filters, visible “Save X RWF” amounts, and server-verified
  order totals for better price transparency.
- MTN MoMo collections adapter with per-payment callback tokens, server-side status verification,
  automatic order status updates, and checkout payment availability from `/api/payments/config`.

## Run locally

Use two PowerShell terminals from the project root.

Terminal 1 — API:

```powershell
cd sawa-citi-platform/server
npm install
npm run dev
```

By default, the API uses an in-memory MongoDB instance and seeds demo data when it starts. Data is
reset when the server restarts. The API health check is at
http://localhost:5000/api/health.

Terminal 2 — storefront:

```powershell
cd sawa-citi-platform/client
npm install
npm run dev -- --host 127.0.0.1
```

Open the URL Vite prints (usually http://127.0.0.1:5173). The API allows both localhost and
127.0.0.1 origins by default. In development, Vite proxies `/api` to the server so either local
host works. Set `VITE_API_URL` only when the deployed API uses a different origin.

To use a persistent MongoDB database or production secrets, copy `.env.example` to
`server/.env` and set the appropriate values. For production, set `SEED_DEMO=false` and choose a
configured real payment provider; the server refuses demo seeding or mock payments in production.
Never commit `server/.env`.

## Live MTN MoMo payments

Set `PAYMENT_PROVIDER=mtn_momo` in `server/.env` and provide `MOMO_SUBSCRIPTION_KEY`,
`MOMO_CALLBACK_URL`, and either `MOMO_USER_ID` plus `MOMO_CREDENTIAL_TOKEN` or the older
`MOMO_API_USER` plus `MOMO_API_KEY`. Set `MOMO_TARGET_ENVIRONMENT` to `sandbox` for testing or the
country environment supplied by MTN for production. `MOMO_BASE_URL` can override the default
sandbox or migrated production hostname. In production, the callback URL must be HTTPS and its host
must match the callback host registered with MTN.

Register the callback host with MTN, expose `POST` and `PUT` on `/api/payments/webhook`, and keep
`SEED_DEMO=false`. The site only shows MTN MoMo at checkout when the server reports it configured.
Payments stay pending until MTN confirms `SUCCESSFUL`; the order page verifies status every five
seconds and the webhook verifies status again server-side before marking an order paid.

## Checks

```powershell
cd sawa-citi-platform/client
npm run lint
npm run build
```

```powershell
cd sawa-citi-platform/server
npm test
```

## Project layout

- `client/` — React storefront and admin interface.
- `server/` — Express API, MongoDB models, seed data, and payment adapters.
- `docs/` — architecture documentation.
- `Sawa Citi Supermarket Logo.png` — supplied brand artwork; `client/public/logo.png` is used by
  the site.

## Launch considerations

The local demo uses sample data and mock payments. Production launch still requires approved
inventory and content, persistent database and production secrets, configured real payment
providers and media storage, and deployment-specific CORS, hosting, and operational setup.

## Catalog imports and inventory

The admin Products page accepts CSV and Excel `.xlsx` files up to 5 MB and 2,000 product rows.
Required headers are `SKU`, `Barcode`, `Product Name`, `Category`, `Price RWF`, and
`Stock Quantity`. Optional headers are `Branch Code` and `Image URL`. If a row has no branch code,
the selected default branch is used. Categories and branch codes must already exist. Repeated SKU
rows are supported only across different branches, and product details must match across those rows.

Imports create or update products by SKU, set the selected branch's absolute stock quantity, and
record stock changes. CSV exports include one row per product and active branch, so an export can be
re-imported after review. The Inventory admin page shows recent movement history for manual
adjustments, imports, order reservations/sales, and cancelled orders.

This catalog is independent: it does not scrape or synchronize with sawaciti.com or the Isokko
store. No official product/POS API or internal inventory feed has been verified. Product
`sourceSystem` and `externalId` metadata plus the shared inventory movement service provide a
controlled extension point for a future POS/API adapter when authorized access and mapping rules
are available. Until then, only staff-approved imports and manual admin updates should be treated as
catalog data; bundled seed records remain sample data.
