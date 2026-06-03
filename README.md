# Nudge

Productivity app that breaks big tasks into micro-steps based on energy level and available time.

## Setup

1. Install dependencies (requires [Node.js](https://nodejs.org/) with npm):

```bash
npm install
```

2. Copy the environment file and add your Anthropic API key:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set `ANTHROPIC_API_KEY`.

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run build
npm start
```

Set `ANTHROPIC_API_KEY` in your hosting provider's environment variables.

## Architecture

- `nudge-app.jsx` — entire React UI, flow, hooks, and design tokens in one file
- `app/api/breakdown/route.js` — server-side proxy to Anthropic (keeps the API key off the client)
- `app/page.js` — mounts the app full-screen (no prototype chrome)

Persistent state (tasks, completed steps, session count, streak, granularity, pause state) is stored in `localStorage`.

### Return flow (after splash)

Returning users are routed automatically:

| Condition | Screen |
|-----------|--------|
| First visit / no tasks | Onboarding |
| 3+ days since last visit | Return (long gap) |
| Paused mid-task | Return (paused) |
| Finished all steps on last task | Return (done) |
| Otherwise | Suggestion |

Step granularity (`gentle` / `balanced` / `detailed`) from Ready is sent to the AI breakdown API.
