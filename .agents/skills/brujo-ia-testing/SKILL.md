---
name: brujo-ia-runtime-testing
description: Run Brujo IA against Docker Postgres with real Clerk login and safe PayPhone/Venice E2E verification.
---

# Runtime testing

Use this for Brujo IA (Next.js 16, Clerk, Drizzle), not the older
NextAuth/Prisma venice-payphone-saas implementation.

## Devin Secrets Needed

Use ignored `.env.local`: `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`,
`DATABASE_URL`, `PAYPHONE_AUTH_TOKEN`, `VENICE_API_KEY`.
Never print secret values. Optional `PAYPHONE_STORE_ID` should be empty if
not supplied by the payment account owner. Models may be configured through
`VENICE_MODEL` and `VENICE_IMAGE_MODEL`.

## Services and login

- With Docker Postgres already on 5432, use `npm run db:migrate` then
  `npm run dev:next`; `npm run dev` also launches PGlite and may conflict.
- Restart Next after key changes. Inherited environment variables override
  dotenv files: exclude stale Clerk variables from the service environment
  if the intended keys live in `.env.local`.
- Clerk development test addresses containing `+clerk_test` accept 424242
  for email/new-device verification.
- Try UI signup first. If Cloudflare Turnstile prevents signup and the user
  authorizes it, create the identity via the official Clerk Backend API,
  using `CLERK_SECRET_KEY`, then sign in through the real UI with password.
  Report UI signup as incomplete rather than claiming it passed.
- Default Spanish locale can be overridden by browser negotiation or the
  locale cookie. Use the globe menu to select Español/English explicitly.

## Safe E2E checks

- Free dashboard shows PayPhone paywall. Browser-origin `/api/generate`
  POST returns 402 for Free and 401 with credentials omitted.
- UI PayPhone button should create a 1900 USD-cent PENDING payment and open
  real checkout. Never enter card details. Provider X/Cancel returns to
  dashboard with `payment=cancelled`; verify the DB row becomes CANCELLED.
- Only when explicitly authorized, simulate PRO by upserting `subscriptions`
  for the actual Clerk user ID with `is_pro=true` and future `pro_until`.
  Distinguish this from real approved-payment confirmation.
- Use harmless prompts through text/image tabs, assert visible outputs;
  read image naturalWidth/naturalHeight for 1024x1024 verification.
- Billing should show PRO expiry and the cancelled payment history.
- Preserve test identity/payment row IDs in the report for cleanup.
