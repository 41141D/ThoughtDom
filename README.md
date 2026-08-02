# ThoughtDom — MVP scaffold

This is the Phase 0 MVP scaffold from the architecture doc: auth with random
anonymous usernames, one seeded community, posts, votes, and comments with
the **Steel-Man Gate** enforced on "challenge" replies.

## What's implemented

- Random anonymous username generation on registration (`AdjectiveNoun123`), with an optional preferred-name override
- JWT auth (register / login)
- One community, auto-seeded on first backend startup
- Posts, comments (neutral / agree / challenge), voting
- **Steel-Man Gate**: a "challenge" reply requires a restatement of the argument being challenged. It's checked with a lexical-similarity heuristic — good enough to block obvious straw men without any external API dependency. See the docstring in `backend/app/services/steelman.py` for how to upgrade this to a real embedding model or LLM call later.
- Redis-backed rate limiting on signups, posts, comments, and votes — fails open (doesn't block requests) if Redis isn't reachable, so local dev works without it, but this must never be relied on in production
- Dark-mode-first UI with the Steel-Man restatement rendered as a distinct "mirror" card, so readers see the fair restatement before the disagreement

## What's intentionally NOT built yet (see the roadmap doc, Phase 1+)

Communities beyond the seeded one, community-elected moderation, notifications, DMs, search, tags, image uploads, the Idea Lineage fork feature, an admin dashboard. Adding these is additive to this schema, not a rewrite.

## Running it locally

**A note on this sandbox**: I wrote and syntax-checked every file, but I could not actually install the Python or Node dependencies here — both PyPI and the npm registry are blocked by this environment's network policy (even though they're on the allowed-domains list, egress was refused). So this hasn't been runtime-tested yet. Run it on your own machine and let me know if anything breaks — I'll fix it fast.

### Option A — Docker Compose (closest to production)

```bash
cd thoughtdom
cp backend/.env.example backend/.env   # edit JWT_SECRET before you deploy anywhere real
docker compose up --build
```

- Backend: http://localhost:8000 (docs at `/docs`)
- Frontend: http://localhost:3000

### Option B — run backend and frontend directly (fastest local loop)

Backend (uses SQLite automatically if `DATABASE_URL` isn't set — no Postgres/Redis needed to try it):

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:3000, click "Get a name," and post something.

## Trying the Steel-Man Gate

1. Post an idea.
2. Reply to it, but pick "challenge" instead of "neutral"/"agree."
3. You'll be asked to restate the idea fairly before you can write your rebuttal. Type something that shares almost no words with the original post and submit — you'll get a 422 telling you the restatement doesn't look fair. Restate it using the post's own vocabulary and it'll go through.

That heuristic is deliberately crude for MVP (word overlap, not real semantic understanding) — see the "what to upgrade" note in `steelman.py` when you're ready to make it smarter.
