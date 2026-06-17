# Vigil

A lightweight uptime monitor. Register URLs, Vigil checks them in the background on a schedule, tracks their health over time, and emails you when something goes down (and when it recovers).

## What it does

1. Sign up and add an endpoint — a URL, an HTTP method, the status code you expect back, and how often to check it.
2. A background worker pings that URL on schedule and records the result (status code, response time, up/down) to the database.
3. The dashboard shows live status, uptime % over 24h/7d/30d, average response time, and a response-time sparkline per endpoint.
4. When a check flips from up to down, an incident opens and you get a "down" email. When it flips back, the incident closes (with duration) and you get a "recovered" email.
5. The incidents page is a full history log of every outage.

## Architecture

```
┌─────────────┐        ┌──────────────┐        ┌─────────────┐
│   Next.js    │──────▶│   Upstash     │◀──────│   Worker     │
│  (Vercel)    │  add   │   Redis       │ poll   │ (Oracle VM,  │
│              │  job   │  (BullMQ)     │  job   │  systemd)    │
└──────┬───────┘        └──────────────┘        └──────┬───────┘
       │                                                 │
       │                writes/reads                     │ writes checks,
       ▼                                                 ▼ incidents
┌─────────────────────────────────────────────────────────────┐
│                      Neon (Postgres)                          │
│         endpoints · checks · incidents                        │
└─────────────────────────────────────────────────────────────┘
                                                          │
                                                          ▼
                                                   Resend (email alerts)
```

The web app (dashboard, endpoint management, auth) and the worker (the thing that actually checks your URLs) are two separate processes with two separate lifecycles, coordinated only through a shared Redis-backed job queue and a shared Postgres database. The web app enqueues a repeating job whenever you add an endpoint; the worker — running independently, 24/7, on its own machine — is the only thing that ever dequeues and executes those jobs.

## Tech stack

- **Framework:** Next.js 15 (App Router) — dashboard, endpoint CRUD, auth
- **Database:** Neon (serverless Postgres) via Drizzle ORM
- **Background worker:** BullMQ + Redis (Upstash) — schedules and runs the actual HTTP checks
- **Auth:** Clerk — every endpoint, check, and incident is scoped to the signed-in user
- **Email:** Resend — down/recovery alerts
- **Charts:** Recharts — response-time sparklines
- **Deploy:** Vercel (Next.js app) + a free-tier Oracle Cloud VM running the worker as a systemd service, with Upstash for Redis

## Why this isn't Railway

The original plan was Railway for both Redis and the worker process, but Railway's free tier expired mid-build. Redis moved to Upstash (free, BullMQ-compatible over its `rediss://` TCP endpoint — just requires `maxRetriesPerRequest: null` on the connection). The worker moved to an Oracle Cloud "Always Free" VM, running via systemd (`worker/vigil-worker.service`) so it survives crashes and reboots without needing a paid platform. See `worker/DEPLOY.md` for the full setup.

## A couple of interesting decisions

**Incident detection is a state machine, not a status flag.** Each check only compares against the *previous* check for that endpoint — if it flips from up to down, open an incident; if it flips back, close it and compute duration. Looking at "is it currently down" in isolation isn't enough; what matters is the transition, which is also why the alert emails only fire on transitions rather than on every failing check.

**Uptime percentages are computed per time window directly in SQL** (`AVG(CASE WHEN is_up THEN 100 ELSE 0 END)` over a `WHERE timestamp > now() - interval`), rather than fetching raw rows and reducing in JS. At the row volume this app generates (a check per endpoint per interval, accumulating indefinitely), pushing the aggregation into Postgres avoids shipping every check row over the wire just to compute a percentage.

## Local development

```bash
npm install
npm run dev      # Next.js app
npm run worker   # background worker (separate terminal)
```

Required env vars (`.env`): `DATABASE_URL`, `REDIS_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ALERT_EMAIL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.
