# Gallery showcase: Khaneh Damaad («خانه داماد»)

Persian men's grooming studio in Lahijan on `be/vps/generated-site` with the `bookings` plugin (plus `auth` for staff login and `notifications`). Tagline: «بهترین ورژن خودت باش».

## Layout

| Path | What |
|---|---|
| `site/` | Authored overlay copied onto an app workspace (pages, components, content, styles, seed pack, `index.html`). No platform-owned file is edited (`sdks/contracts/schemas/platform-files.ts`). |
| `site/src/seed/khane-damad.seed.json` | The seed pack: booking settings, 3 barbers, 10 services (toman), weekly hours, one day off. Single source for the CLI seeder, the in-site setup page and the demo fallback. |
| `site/src/content/salon.js` | Owner-editable content: contact, hours, offer, portfolio, reviews, FAQ, optional links (WhatsApp, Telegram, Instagram, review page render only when set). |
| `scripts/seed.ts` | Applies the seed pack through the live bookings routes (idempotent). |
| `scripts/sync.sh`, `scripts/refresh.sh` | Copy `site/` into a local app workspace; `refresh.sh` also restarts the preview so Tailwind rescans. |
| `scripts/export-import.sh` | Data-free export + import round trip (platform admin). |
| `tests/` | `bun test ./gallery/khane-damad/tests/khane-damad.test.ts` |
| `evidence/` | Rendered RTL screenshots, desktop 1440 and mobile 390. |

## Backend (Joorchin)

The visitor and staff surfaces talk to a Joorchin app through `@joorchin/client-sdk`
(`site/src/api/joorchin.js` owns the single client).

1. **`npm install`.** The SDK is a normal dependency; a `node_modules` tree from
   before it was added is what produces
   `Failed to resolve import "@joorchin/client-sdk"`. Check with
   `npm ls @joorchin/client-sdk` (expect `0.3.2`).
2. **Configure the app.** Copy `.env.example` to `.env.local` and set
   `VITE_JOORCHIN_APP_ID` (leave `VITE_JOORCHIN_SERVER_URL` empty for
   `https://api.joorchin.ai`). Without it the site runs entirely on its bundled
   demo pack and never calls the network. Vite's root is `./site`, so
   `vite.config.js` sets `envDir` to the repo root — keep env files next to
   `package.json`.
3. **Seed an empty app from the browser**: sign in at `/salon/login` (staff phone
   OTP, or password if one is set), then press the seed button on `/salon/setup`.
   It writes settings, barbers, services, schedules, time off and generates 21 days
   of slots, and is idempotent on a second run.
4. **Deployments** need the same `VITE_JOORCHIN_APP_ID` in the host environment;
   `.env.local` is git-ignored.

## Rebuild locally

1. Create an app, install `bookings`, `auth`, `notifications` (`POST /apps/:id/plugins`).
2. `APP_DIR=<be/vps/previews/<appId>> ./scripts/sync.sh`, restart the preview.
3. Seed: `API=… APP_ID=… TOKEN=<owner jwt> bun gallery/khane-damad/scripts/seed.ts`, or sign in and open `/salon/setup`.

A bundle import never re-runs seeding (rows are not in a data-free bundle). A fresh import shows the booking empty state until the owner opens `/salon/setup` once.

## Routes

`/` home, `/services`, `/book` (service, barber, day and time, details, summary, success; deep links `?service=<id|name>&barber=<id>`), `/portfolio` (filters, viewer, `?photo=<pexelsId>`), `/about` (team), `/reviews`, `/contact`, `/faq`, `/salon/appointments` (staff), `/salon/setup` (staff). Staff pages check the `booking:manage` capability via the back-office SDK; the visitor pages only import `@/api/plugins/bookings`.

## Bundle

`scripts/build-bundle.ts <base.bundle.tgz> <out.bundle.tgz>` overlays `site/` on a data-free base export (an app with `bookings`, `auth`, `notifications` installed, exported with `includeData: false`) and rewrites the source checksum. Verified: the in-process bundle service exported a base (manifest `includesData: false`, 0 entity and plugin rows) and imported the built bundle into a new app: 282 source files applied, byte-identical to `site/`, plugins carried, services empty until `/salon/setup` or `scripts/seed.ts` (run against the imported app: 3 barbers, 10 services, slots generated).

## Packages, loyalty, reminders

- **Packages:** haircut and beard carry an embedded multi-session package (`package` in the seed pack). `/services` sells it through `purchaseServicePackage`; the credit id is kept on the device and offered on the details step (`creditId` on `bookSlot`), where the server checks owner and balance. Success shows «از اعتبار بسته».
- **Loyalty (stamp card):** every completed appointment raises `booking_client.visitCount` (plugin behaviour). Five stamps earn 20% off the next visit. Customers see the rules on Home, Services and the success screen; staff see stamps per customer in `/salon/appointments`, the reward on the customer's earliest open booking with the discounted price, and progress in the «انجام شد» confirmation. The `loyalty-club` plugin was not used: it requires `ecommerce` and signed-in site users, which a guest booking site does not have.
- **Reminders:** assisted. Each open appointment has «یادآوری» (WhatsApp) and «پیامک» buttons with a prefilled Persian message, and the «فردا (صف یادآوری)» filter lists tomorrow's queue; the ICS file carries two alarms. Automatic delivery is not available: nothing in be/core evaluates tenant `notification_rule` rows for domain events, and notifications target site users, not guest phone numbers.

## Platform fixes made for this showcase (be/core, bookings plugin)

- A solo resource can no longer be booked twice at overlapping times through slots of different services: pre-check, post-insert re-check with deterministic loser rollback (parallel test: 5 simultaneous overlapping requests, 1 success), and the same check on reschedule.
- Slot regeneration now revives slots that were cancelled as obsolete (editing a service used to leave its slots permanently cancelled and invisible).
- Regression tests: `bookings-concurrency.test.ts`, `booking-schedule-slot-generation.test.ts`.

## Known limits

- Photos are Pexels hotlinks (not real staff or salon). Barber portraits, address, phone, social handles and reviews are sample content to replace.
- Portfolio, reviews, offer and FAQ are file content (`salon.js`), not database rows.
- Guest credit use relies on the credit id stored in the browser; signed-in site users get `credits/my`.
- Automatic reminder delivery (Telegram or SMS to guests) needs platform work: a tenant rule evaluator and guest-addressable channels.
- Generator reads at most 2000 existing slots per window, so a window with more rows needs repeated `generate` calls to revive all of them.
- The local stack used for screenshots ran an older be-core than the bookings fixes above (another worktree); the fixes were verified on a be-core started from this branch, and stale cancelled slots in the dev app were revived directly in Mongo. Staff screens read plugin rows through the back-office transport (`lib/staff-data.js`), because the visitor seam sends the visitor session and is refused for staff-only rows.
- Guest booking is rate limited per IP by the platform; the flow shows a Persian message on 429.
