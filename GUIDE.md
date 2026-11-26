# Guide: GitHub, Hosting and Interview Notes

## Part 1 – Push to GitHub
1. Install Git (https://git-scm.com) and create a free GitHub account.
2. On github.com click **New repository** → name `expense-tracker` → leave it empty (no README) → **Create**.
3. In VS Code open the `expense-tracker` folder, open the terminal (Ctrl + `) and run:
```bash
git init
git add .
git commit -m "Initial commit: Expense Tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
git push -u origin main
```
4. Sign in when asked (browser login, or use a Personal Access Token as the password).
5. Check that `.env` is NOT on GitHub (the `.gitignore` already blocks it).

Later changes: `git add .` → `git commit -m "message"` → `git push`.

## Part 2 – Hosting
Netlify only hosts static sites, so it hosts the React frontend. Django and PostgreSQL go on Render (free tier).

### A. Database + backend on Render (https://render.com, sign in with GitHub)
1. **New → PostgreSQL** → name `expense-db` → Free plan → Create. Copy the **Internal Database URL**.
2. **New → Web Service** → connect your GitHub repo and set:
   - Root Directory: `backend`
   - Build Command: `./build.sh`
   - Start Command: `gunicorn config.wsgi`
3. Environment variables:
   - `SECRET_KEY` = a long random string (generate: `python -c "import secrets;print(secrets.token_urlsafe(50))"`)
   - `DEBUG` = `False`
   - `DATABASE_URL` = the Internal Database URL
   - `ALLOWED_HOSTS` = `your-service.onrender.com`
   - `CORS_ALLOWED_ORIGINS` = (add after step B, your Netlify URL, no trailing slash)
   - `PYTHON_VERSION` = `3.12.3`
4. Deploy. Your API is at `https://your-service.onrender.com/api/`.
Note: `makemigrations` must be run locally once and the `tracker/migrations/0001_initial.py` file committed to GitHub.

### B. Frontend on Netlify (https://netlify.com, sign in with GitHub)
1. **Add new site → Import an existing project → GitHub** → pick the repo.
2. Set Base directory `frontend`, Build command `npm run build`, Publish directory `frontend/dist`.
3. Environment variable: `VITE_API_URL` = `https://your-service.onrender.com/api`
4. Deploy. You get `https://something.netlify.app`.
5. Go back to Render → set `CORS_ALLOWED_ORIGINS` to that Netlify URL → it redeploys.
6. In `frontend/netlify.toml` the CSP allows `*.onrender.com`; if you use another host, update `connect-src`.
7. Open the site, register, and test.
Free Render services sleep after inactivity, so the first request can take ~30 seconds.

## Part 3 – Interview notes
- **Architecture:** React (SPA) calls a Django REST API over HTTPS; Django talks to PostgreSQL through the ORM.
- **Auth:** DRF token auth; token sent in the `Authorization` header; stored in localStorage (trade-off: simple, but httpOnly cookies are stronger against XSS – good "future improvement").
- **Data isolation:** `get_queryset` filters by `request.user`; `perform_create` sets the owner on the server.
- **Search/filter:** query params (`search`, `type`, `category`, `month`) build a Django ORM queryset with `Q` objects.
- **Summary:** `Sum` aggregation and `values().annotate()` (SQL GROUP BY) for category totals.
- **Budget:** one row per user per month (`unique_together`), saved with `update_or_create`.
- **Why Netlify + Render:** Netlify serves static files; Django needs a Python server and a database.
- **Future improvements:** JWT refresh tokens, pagination, charts, CSV export, tests.
