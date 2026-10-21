# Security

How this prototype is protected, what is demo-only, and what a production launch would need.

## The two versions

- **The live static preview** on GitHub Pages is plain files: HTML, JavaScript, images and JSON. No server code runs, and there is no database or login. The common server attacks, such as SQL injection or remote code execution, have nothing to reach. All of its data is invented and public by design.
- **The Laravel version** runs only on a developer's machine, in Docker. It is not hosted anywhere. The checklist below says what hosting it would take.

## What protects it today

### The Laravel API

| Protection | Where |
|---|---|
| Access is decided on the server. Members-only threads, reading lists and streams never leave it for anyone else. | `app/Policies`, `app/Discussion/Discussions.php`, proved by `tests/Feature/AccessTest.php` |
| Every change needs a signed-in account, and carries a CSRF token. | `routes/api.php`, Sanctum's SPA mode in `bootstrap/app.php` |
| Every input is validated: lengths, allowed values, and that what it points to exists. | Each controller in `app/Http/Controllers` |
| The content desk is for staff only. | The `use-desk` gate in `app/Providers/AppServiceProvider.php` |
| Rate limits: 300 requests a minute, 60 searches, and 20 changes, per account or per address. | `AppServiceProvider.php`, proved by `tests/Feature/SecurityTest.php` |
| Security headers on every response: nosniff, a strict referrer policy, no framing, no camera or location, HSTS over HTTPS. The API's Content Security Policy allows nothing to load from it. | `app/Http/Middleware/SecurityHeaders.php` |
| Each model lists the fields a request may set. Tier and staff are never among them. Outside production, setting any other field is an error, so a mistake fails the tests. | `app/Models`, `SecurityTest.php` |
| The password-less demo sign-in exists only in local and testing. | `routes/api.php`, proved by `tests/Feature/ProductionTest.php` |
| Locally, Docker serves the API and Meilisearch to this computer only (127.0.0.1), not to the rest of the network. | `backend/compose.yaml` |
| Session cookies are hidden from JavaScript, and other sites' form posts and background requests do not carry them. | `config/session.php` |

### The site

| Protection | Where |
|---|---|
| Vue escapes all text. No data is inserted as raw HTML. | All components |
| A Content Security Policy in every built page: scripts, data and media only from the site itself, and frames only from Rumble, Odysee and BitChute. | `vite.config.ts` |
| Embed addresses are accepted only on each platform's own embed path. | `src/data/streams.ts` |
| The offline cache keeps only the site's own files. Third-party players are never cached. | `vite.config.ts` (the PWA settings) |
| No secrets in the code. Test embed addresses live in `.env.local`, which git ignores. | `.gitignore`, `.env.example` |

## Checked automatically

- **On every push and pull request** (`.github/workflows/ci.yml`):
  - the site type-checks and builds
  - the Laravel tests pass
  - `npm audit` finds no high or critical problems, and `composer audit` finds no known security advisories
- **Dependabot** (`.github/dependabot.yml`) proposes updates each week, and security fixes at once.
- **Every GitHub Action is pinned to an exact commit,** so a moved tag cannot change a build.

## Demo-only, on purpose

These are not security gaps in the prototype. They are things a real launch must build first.

- **No real accounts.** There are no passwords, sign-up, password reset or two-factor sign-in. The demo panel switches between seeded accounts.
- **No payments.** "Buy" and "Join" take no payment.
- **The static preview has no access control.** Its members' content is invented, and every file can be read. Pitch mode and the demo panel only change what one browser shows.
- **No moderation.** Comments and forum topics are limited in length and rate. Nothing reviews them.

## Production checklist

Before the Laravel version is hosted for real users:

1. **Settings.** Start from `backend/.env.production.example`:
   - `APP_ENV=production` and `APP_DEBUG=false`
   - a new `APP_KEY`, generated on the server
   - encrypted, HTTPS-only session cookies
   - `SANCTUM_STATEFUL_DOMAINS` set to the site's own domain only
2. **Secrets stay out of git.** Keep `.env` outside the public web folder. Back up `APP_KEY` safely: without it, encrypted data cannot be read.
3. **A real web server.** Use nginx or Caddy with PHP-FPM, not `php artisan serve`. The web root must be `backend/public` only.
4. **HTTPS everywhere.** Redirect plain HTTP. Behind a load balancer or proxy, set Laravel's trusted proxies, so it sees requests as HTTPS and sends HSTS.
5. **Private services.** The database and Meilisearch accept connections from the app only, never from the internet. Meilisearch runs with `MEILI_ENV=production` and a long random master key.
6. **The site's headers.** Send the Content Security Policy as a header too, with `frame-ancestors 'none'`, which a `<meta>` tag cannot carry.
7. **Least privilege.** The database user can read and write the app's tables only. The server runs the app as a user without admin rights.
8. **Logs, alerts and backups.** Keep error logs, alert on repeated failures and on 429 spikes, and back up the database daily. Test a restore.
9. **Updates.** Merge Dependabot's security updates promptly. Keep PHP, Laravel and the server patched.
10. **Queues and the scheduler.** Run the platform sync under a queue worker and the scheduler, with their own monitoring.

## Before real accounts and payments

- **Accounts:** use Laravel Fortify for passwords, email verification, password reset and two-factor sign-in. Limit sign-in attempts and lock out repeated failures.
- **Payments:** use Stripe through Laravel Cashier. Card details go to Stripe, never to this server. Grant access only from Stripe's signed webhooks.
- **Personal data:** record what is stored and why, for UK GDPR. Let people export and delete their data.
- **Moderation:** reporting, review and removal for comments and forums.
- **A security review or penetration test** of accounts and payments before launch.

## Reporting a problem

Please do not open a public issue for a security problem. Contact the repository owner through GitHub, and allow time to fix it before sharing details.
