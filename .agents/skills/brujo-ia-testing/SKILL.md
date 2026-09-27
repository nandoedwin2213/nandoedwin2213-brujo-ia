---
name: brujo-ia-runtime-testing
description: Run Brujo IA against isolated Postgres with real Clerk login and safe three-plan PayPhone/Venice E2E checks.
---

# Runtime testing

Suggested replacement for `.agents/skills/brujo-ia-testing/SKILL.md`.
This applies to the Next.js/Clerk/Drizzle app, not the older NextAuth app.

## Devin Secrets Needed

Use ignored `.env.local`: `CLERK_SECRET_KEY`,
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `PAYPHONE_AUTH_TOKEN`, `VENICE_API_KEY`.
Never print values. Leave optional `PAYPHONE_STORE_ID` blank if not supplied.
Models can be set with `VENICE_MODEL` and `VENICE_IMAGE_MODEL`.

## Services and access

- `.env.local` may contain a production Neon URL. Explicitly override
  `DATABASE_URL` with a verified local database for BOTH migration and Next.
- With Docker Postgres on 5432, use `npm run db:migrate` followed by
  `npm run dev:next`, not `npm run dev` (which also starts PGlite).
- Verify the running Next process inherited the local database host.
- Restart Next after key changes; inherited variables override dotenv.
  Exclude stale Clerk variables if intended keys live in `.env.local`.
- For PayPhone, explicitly load/export the intended `.env.local` token before
  starting Next; do not assume dotenv precedence has displaced `.env`
  placeholders. Then override DATABASE_URL locally. Verify the running
  process environment matches the intended token without printing its value
  (equality/length only), and confirm local database host.
- Clerk development `+clerk_test` addresses accept code `424242`.
  If signup is blocked by Turnstile and the user authorizes fallback,
  create the identity using Clerk Backend API and then sign in through UI.
  Report signup UI separately.
- Use the globe menu for explicit ES/EN selection; negotiation can override
  the default locale. Generator is `/dashboard`, not `/dashboard/generator`.

## Three-plan checks

- Free users with no subscription row can generate within lifetime quotas;
  they no longer have a PRO-only paywall. Check the current plan constants
  for quotas and rate limits rather than inferring limits from marketing copy.
- Free usage includes prior months. Paid usage counts the current UTC month.
  An expired paid subscription resolves to Free.
- When authorized, simulate paid states only in local `subscriptions`:
  `is_pro=true`, `plan='premium'` or `'vip'`, future `pro_until`.
  This does not prove provider approval or automatic grant.
- Back up existing usage/subscription rows before isolation. Track synthetic
  generation IDs; delete only fixtures, restore originals, retain real results.
- Seed exact lifetime/monthly limits for quota checks, and exact rolling
  60-second counts for rate checks. Seed immediately before UI submission;
  older real rows can age out mid-test and allow an unintended real call.
- Observe browser responses while submitting through UI: quota 402,
  rate limit 429, anonymous 401. Compare invalid-checkout status to the
  requested API contract rather than assuming any 4xx is acceptable.
- Use harmless text/image prompts and minimize paid image calls.
  Check visible output, dimensions, live counters and persistence on reload.
- Test billing effective plan/expiry and history Plan column in ES/EN.
- PayPhone Premium/VIP should open provider amounts matching selected plans
  and persist the matching payment plan. Never enter card information.
  Cancel through provider UI and verify CANCELLED persisted.
- If checkout fails, inspect Next development logs and optional store ID.
  Do not treat historical cancelled rows as proof of a current checkout.
  Report provider amount/plan persistence/cancellation untested if unreachable.
- A valid Prepare can immediately return from PayPhone with a domain-not-allowed
  message. The app may label this CANCELLED because no provider transaction ID
  is present. This proves the automatic-return path, not a manual Cancel click.
  Capture Prepare status/URL and PENDING-to-CANCELLED transitions with passive
  response observation and a brief read-only DB watcher; do not spoof Referer.
- Check expiry both after reload and while a paid page stays open; an error
  must not promise monthly renewal once effective usage has become Free.
