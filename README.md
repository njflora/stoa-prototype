# Stoa

An unofficial, unbranded prototype of a modern media site, built to pitch improvements to a media publisher. Every show, host and episode is invented. It is not deployed.

The site is Vue 3, TypeScript, Vite and Tailwind. Behind it, a Laravel 13 API is the source of truth.

## Run it

**The static preview** (no server needed):

```sh
npm install
npm run dev
```

**The Laravel version** (needs Docker Desktop running):

```sh
cd backend
docker compose run --rm composer install
docker compose run --rm app php artisan migrate:fresh --seed
docker compose up -d app
cd ..
npm run dev:laravel
```

Both offer the same features. In the Laravel version, sign-in, access and saving are real. Use the demo panel (bottom left) to switch between a signed-out visitor, a free account, a member and staff.

## Check it

```sh
npm run build
```

```sh
cd backend
docker compose run --rm app php artisan test
```

## Read more

| Document | What it covers |
|---|---|
| `ARCHITECTURE.md` | What lives where, how data moves, who may see what |
| `CONSOLIDATION.md` | The plan for one source of truth across Rumble, Odysee, BitChute and their own video |
| `BRANDING.md` | How the site would take on their identity |
| `WALKTHROUGH.md` | A course through the code, in thirteen lessons, with an interview crib sheet |
| `PROGRESS.md` | Where things stand, decisions, and open questions |
| `REVIEW-NOTES.md` | Things worth fixing, and what has been fixed |
| `CHANGELOG.md` | Every change, newest first |
| `CREDITS.md` | Every image and video, with its licence |
