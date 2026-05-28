# Run ReadAI locally (homepage must load)

## Option A — Stable (recommended if dev hangs)

One command. Kills port 3000, builds, runs production server:

```bash
cd /Users/ericmasmela/readai-book-system
npm run preview
```

Open: **http://localhost:3000**

## Option B — Dev mode (hot reload)

```bash
cd /Users/ericmasmela/readai-book-system
npm run dev:fresh
```

Wait until the terminal shows **Ready**, then open **http://localhost:3000**.

First load can take **15–30 seconds** while it compiles — do not refresh until you see `Compiled /` in the terminal.

## If the page is still blank

1. Confirm you are in **`readai-book-system`**, not another folder.
2. Hard refresh: **Cmd+Shift+R** (Mac).
3. Try a private/incognito window.
4. Check the terminal — if you see `EMFILE: too many open files`, use **Option A** (`npm run preview`).

## Verify APIs

```bash
curl http://localhost:3000/api/book-count
```

Should return `"totalBooks": 38908` (or current Neon count).
