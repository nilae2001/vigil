# Worker deployment (free tier: Upstash + Oracle Cloud Always Free)

Replaces Railway (no longer free) with two free-forever services.

## 1. Redis — Upstash

1. Sign up at upstash.com, create a Redis database (any region close to your VM).
2. Copy the **TCP connection string** (starts with `rediss://`), not the REST URL.
3. Set it as `REDIS_URL` in `.env.local` (locally) and on the VM (step 4 below).

The code already sets `maxRetriesPerRequest: null` and `enableReadyCheck: false`
on the BullMQ connection (`lib/redis.ts`) — required for Upstash/BullMQ to work.

Free tier has a daily command cap; check usage on the Upstash dashboard if jobs
start failing silently.

## 2. Worker host — Oracle Cloud Always Free VM

1. Create an Oracle Cloud account (oracle.com/cloud/free) and provision an
   **Always Free** Ampere or AMD compute instance (Ubuntu 22.04+).
2. Open port 22 (SSH) in the instance's security list — no other inbound ports
   needed since the worker doesn't serve HTTP.
3. SSH in, install Node.js (20+) and git:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs git
   ```
4. Clone the repo and install deps:
   ```bash
   git clone <your-repo-url> vigil
   cd vigil
   npm install
   ```
5. Create `.env.local` on the VM with `DATABASE_URL` and `REDIS_URL` (same
   values used for the Next.js app).
6. Copy `worker/vigil-worker.service` to `/etc/systemd/system/` (fix `User`
   and `WorkingDirectory` if your VM user/path differ), then:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now vigil-worker
   sudo systemctl status vigil-worker   # confirm it's running
   journalctl -u vigil-worker -f        # tail logs
   ```

The worker now runs 24/7 and survives reboots. To deploy code changes, `git
pull && npm install` on the VM, then `sudo systemctl restart vigil-worker`.
