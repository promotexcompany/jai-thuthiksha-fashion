# Jai Thuthiksha Fashion — Dress Catalogue

A React/Vite catalogue with an Express API and Supabase-backed dress/category inventory. The public entry route opens directly to the dress catalogue; `/admin/login` is the private admin entry point.

## Requirements
- Node.js 20.19+ (or a Node version supported by Vite 8)
- Supabase project with the existing `dresses`, `categories`, and `users` tables and `dresses` storage bucket

## Setup
1. Configure Supabase tables using the existing project schema/migration files and create an admin user in `users` with `role = 'ADMIN'` and a bcrypt-hashed password in `password`.
2. Copy `server/.env.example` to `server/.env` and fill in your Supabase URL, service-role key, and a unique random `JWT_SECRET` (32+ characters). Never expose the service-role key or JWT secret in the frontend or commit `.env`.
3. Install dependencies: `cd server && npm ci`, then `cd ../client && npm ci`.
4. Start the API in one terminal: `cd server && npm run dev`.
5. Start the frontend in another: `cd client && npm run dev`.
6. Set `VITE_API_BASE_URL=http://localhost:5000/api` in `client/.env.local` if needed.

## Admin
Open `/admin/login`. Admin sessions are validated against the `users` table on protected requests. There is no default password. Configure an admin account securely in Supabase before use.

## Deployment
Deploy the frontend and API separately or use the existing Vercel configuration. Set the frontend `VITE_API_BASE_URL` to the deployed API base URL and set the backend `CLIENT_URL` to exact allowed frontend origins. Configure all secrets in the hosting provider's environment settings.

## Scope
The customer UI is a catalogue with category filtering, dress details, image gallery/zoom, and WhatsApp contact. No online checkout or payment processing is included. Existing legacy API modules may remain in the source for compatibility, but are not part of the customer navigation; review and remove them only after confirming no production data dependency.
