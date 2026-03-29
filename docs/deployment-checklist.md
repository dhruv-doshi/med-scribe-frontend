# Vercel Deployment Checklist — Med Scribe Frontend

GitHub repo: https://github.com/dhruv-doshi/med-scribe-frontend

---

## Branch Strategy

| Branch    | Purpose                        | Vercel Environment |
|-----------|--------------------------------|--------------------|
| `main`    | Production — auto-deploys      | Production         |
| `dev`     | Staging / active development   | Preview            |
| `refactor`| Feature work                   | Preview            |

---

## Step 1 — Import Project on Vercel

1. Go to https://vercel.com/new
2. Import `dhruv-doshi/med-scribe-frontend`
3. Framework: **Next.js** (auto-detected)
4. Root directory: leave as `/` (default)
5. Build settings are already defined in `vercel.json` — no changes needed

---

## Step 2 — Set Environment Variables

In the Vercel project → **Settings → Environment Variables**, add:

| Variable | Value | Environments |
|---|---|---|
| `NEXTAUTH_URL` | `https://<your-vercel-domain>.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://<preview-url>.vercel.app` | Preview (or leave blank to use auto-generated URL) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` locally and paste result | All |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | All |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | All |
| `NEXT_PUBLIC_API_BASE_URL` | `https://<your-backend-url>/api/v1` | Production |
| `NEXT_PUBLIC_API_BASE_URL` | `https://<your-dev-backend-url>/api/v1` | Preview |

> **Note:** `NEXTAUTH_URL` is critical — if it's wrong, redirects after login will fail.
> For previews, you can set it to the Vercel preview URL pattern or leave it out and set `NEXTAUTH_URL_INTERNAL` instead.

---

## Step 3 — Google OAuth Setup

1. Go to https://console.cloud.google.com → **APIs & Services → Credentials**
2. Open your existing OAuth 2.0 Client ID (same one used for image-analysis, or create new)
3. Under **Authorized redirect URIs**, add:
   - `https://<your-vercel-domain>.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for local dev)
4. Save — Google takes ~5 min to propagate

---

## Step 4 — Backend CORS Configuration

Your backend must allow requests from the frontend's origin. Add these to your backend's CORS allowed origins:

```
https://<your-vercel-domain>.vercel.app
http://localhost:3000
```

If you use wildcard preview URLs from Vercel (e.g. `med-scribe-frontend-*.vercel.app`), you may need to add a regex pattern or add the specific preview URL each time.

**The backend also needs to accept the `Authorization: Bearer <token>` header** — confirm the backend allows the `Authorization` header in CORS `allow_headers`.

---

## Step 5 — Vercel Branch Settings

In Vercel → **Settings → Git**:

- **Production Branch:** `main`
- Enable **Preview Deployments** for all other branches (default is on)
- Optionally disable previews for the `refactor` branch if not needed

---

## Step 6 — Deploy

1. Trigger first deploy by pushing to `main` (already done)
2. Vercel will build and assign a domain like `med-scribe-frontend.vercel.app`
3. Update `NEXTAUTH_URL` with the real domain once you have it
4. Redeploy after updating env vars (Vercel → Deployments → Redeploy)

---

## Step 7 — Custom Domain (Optional)

In Vercel → **Settings → Domains**, add your custom domain and follow DNS instructions.

---

## Quick Local Test Before Deploy

```bash
cp .env.example .env.local
# Fill in real values
npm run dev
```

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Login redirect loop | `NEXTAUTH_URL` doesn't match deployment URL |
| Google sign-in error `redirect_uri_mismatch` | Redirect URI not added in Google Console |
| API calls returning 403 | Backend CORS not allowing the Vercel domain |
| API calls returning 401 | `NEXT_PUBLIC_API_BASE_URL` pointing to wrong backend |
| Blank page / no styles | `postcss.config.mjs` missing (already fixed) |
