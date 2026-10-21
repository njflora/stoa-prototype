# Stoa

Stoa is an unofficial concept: a prototype of how the Lotus Eaters site could work, built for a pitch. It is not affiliated with Lotus Eaters, carries none of their branding, and every show, host, episode and comment in it is invented. It shows how their content on every platform (Rumble, Odysee, BitChute and their own video) could be brought together in one site, run from one Laravel source of truth.

## View the static preview

The static preview runs in any browser with nothing to install. It has every feature, saved in your browser.

*Link to be added at deployment.*

Open the demo panel (bottom left) to view the site as a visitor, a free account, a member or staff. Turn on **pitch mode** there to see a label on every improvement, with what their site does today.

## Run the full Laravel version

The full version adds the server: real sign-in to demo accounts, members-only access enforced by the server, saving, the platform sync and server search. It runs in Docker, so nothing else needs installing.

**You need:**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/), installed and running (Windows or Mac)
- [Node.js](https://nodejs.org/) 20 or later
- [Git](https://git-scm.com/)

**1. Get the code.** In a terminal (PowerShell on Windows, Terminal on Mac):

```sh
git clone <repository address>
cd <repository folder>
npm install
```

**2. Set up the server.** Go into the `backend` folder, copy the settings, and install its packages:

```sh
cd backend
cp .env.example .env
docker compose run --rm composer install
docker compose run --rm app php artisan key:generate
```

On Windows PowerShell, `cp` works too. If it does not, use `copy .env.example .env`.

**3. Build the database.** First create its empty file, then load the invented catalogue (5,521 episodes, comments, sources) and build the search index:

```sh
docker compose run --rm app touch database/database.sqlite
docker compose run --rm app php artisan migrate:fresh --seed
```

**4. Start the server** (the API on port 8000, search on port 7700):

```sh
docker compose up -d app
```

**5. Start the site** from the project folder:

```sh
cd ..
npm run dev:laravel
```

Open the address it prints, usually http://localhost:5173. The demo panel should say "Mode: Laravel API".

**The demo accounts.** There are no passwords. Choose an account under "Viewing as" in the demo panel, or on the Sign in page:

| Account | What it shows |
|---|---|
| Signed out | A visitor: free shows, previews, the members' gate |
| Free account | Can post in open spaces and buy a single episode |
| Member (Gold) | Everything, including members' discussion and reading lists |
| Staff | Everything members see, plus the content desk at `/desk` |

**Useful commands** (from the `backend` folder):

| Command | What it does |
|---|---|
| `docker compose run --rm app php artisan test` | Runs the 24 server tests |
| `docker compose run --rm app php artisan migrate:fresh --seed` | Resets everything to the starting data |
| `docker compose run --rm app php artisan stoa:sync --fixtures` | Runs the platform sync against the sample feeds |
| `docker compose down` | Stops the server |

## Read more

| Document | What it covers |
|---|---|
| [SCOPE.md](SCOPE.md) | Every feature, page and capability, with what it answers and its status |
| [ARCHITECTURE.md](ARCHITECTURE.md) | How it fits together, and who may see what |
| [CONSOLIDATION.md](CONSOLIDATION.md) | The plan for one source of truth across their platforms |
| [BRANDING.md](BRANDING.md) | How it would take on their identity |
| [CREDITS.md](CREDITS.md) | Every image and video, with its licence |
