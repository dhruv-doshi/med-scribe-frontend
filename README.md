# MedScribe

> Voice-to-clinical-note in seconds. Converts physician dictation into structured medical documentation, automatically.

🌐 **Live**: [med-scribe-frontend.vercel.app](https://med-scribe-frontend.vercel.app/login)
👤 **Author**: [Dhruv Doshi](https://dhruvdoshi.vercel.app)

---

## What it does

MedScribe listens to a clinician's free-form dictation and produces structured clinical notes in real time:

- **Live transcription** — ambient capture during the patient encounter
- **Structured output** — chief complaint, history, exam, assessment, plan, medications
- **MCQ-style review** — multi-select review of medications and diagnoses before signing off
- **Session titles** — auto-generated from content for fast retrieval
- **Edit-in-place** — refine any field before exporting

The goal is to give clinicians the documentation they need without staring at a keyboard during the visit.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| UI | Tailwind CSS · shadcn/ui · Radix primitives |
| State / Data | TanStack Query · Axios |
| Forms | React Hook Form + Zod |
| Audio | Web Audio API + MediaRecorder |
| Testing | Vitest + Testing Library |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in API base URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and grant microphone permission when prompted.

### Required env vars

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | URL of the transcription / NLP backend |
| `NEXTAUTH_SECRET` | Session signing |
| `NEXTAUTH_URL` | Public origin |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Vitest unit tests |

## Project structure

```
src/
├── app/             # App Router pages (login, dashboard, session)
├── components/      # Recorder UI, transcript view, structured-note editor
├── lib/             # API client, audio helpers
├── hooks/           # useRecorder, useTranscription
└── types/           # Shared TypeScript types
```

## Privacy

MedScribe handles potentially sensitive clinical audio. All transmission is over TLS; no audio is persisted client-side beyond the active session unless the clinician explicitly saves it.

## Deploy

Deployed on Vercel — connect the repo and add env vars above.

## License

MIT
