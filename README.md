# Expense Tracker

A full-stack web app to record income and expenses, set monthly budgets, and view category-wise summaries.

**Stack:** Python · Django · Django REST Framework · PostgreSQL · React.js (Vite) · Tailwind CSS

## Features
- Secure sign up / log in (token authentication, password validation, rate limiting)
- Full CRUD for income and expense transactions
- Search (description/category) and filter (type, category, month)
- Monthly budget with a progress bar (turns amber at 80%, red when over)
- Category-wise spending summary
- Each user can only see and change their own data
- Animated, responsive UI

## Project structure
```
expense-tracker/
├── backend/    Django REST API  (config/ = settings, tracker/ = app)
└── frontend/   React app        (src/components = screens)
```

## Run locally (VS Code)

### 1. Database
Install PostgreSQL, then create a database:
```sql
CREATE DATABASE expense_tracker;
```

### 2. Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows   (Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env         # Mac/Linux: cp .env.example .env  -> then edit .env
python manage.py makemigrations tracker
python manage.py migrate
python manage.py runserver
```
API runs at http://localhost:8000/api/

### 3. Frontend (new terminal)
```bash
cd frontend
npm install
copy .env.example .env         # Mac/Linux: cp .env.example .env
npm run dev
```
Open http://localhost:5173

## API endpoints
| Method | URL | Purpose |
|---|---|---|
| POST | /api/auth/register/ | Create account, returns token |
| POST | /api/auth/login/ | Log in, returns token |
| POST | /api/auth/logout/ | Invalidate token |
| GET/POST | /api/transactions/ | List (supports `search`, `type`, `category`, `month=YYYY-MM`) / create |
| GET/PUT/DELETE | /api/transactions/{id}/ | Read / update / delete |
| GET | /api/summary/?month=YYYY-MM | Totals, budget, per-category spending |
| PUT | /api/budget/ | Set budget `{month, amount}` |

## Security measures
- Passwords hashed by Django (PBKDF2) and checked by Django's password validators
- Token authentication on every endpoint except register/login
- Queries always filtered by `request.user` (no access to other users' data)
- Django ORM prevents SQL injection; React escapes output (prevents XSS)
- Rate limiting (30 req/min anonymous, 300/min logged in) against brute force
- CORS restricted to the frontend URL
- Secrets kept in environment variables, `.env` is git-ignored
- HTTPS redirect, HSTS, secure cookies and clickjacking protection in production
- Security headers + Content-Security-Policy on the frontend (`netlify.toml`)
