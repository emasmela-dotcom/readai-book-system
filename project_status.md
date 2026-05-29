# ReadAI project status

## Stack

- **App:** Next.js (ReadAI book club)
- **Database:** Neon PostgreSQL (`DATABASE_URL`)
- **Daily ingestion (optional):** `readai_neon_connector.py`, `readai-neon-scheduler.py`

## Local setup

1. Create `.env` with `DATABASE_URL` from Neon.
2. `npm install`
3. `npm run dev`

See `NEON_SETUP.md` and `LOCAL_DEV.md` for database and dev-server notes.

## Python schedulers (Neon only)

```bash
python3 readai_neon_connector.py
python3 readai-neon-scheduler.py
```
