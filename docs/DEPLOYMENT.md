# Deploying KADHAI to Vercel

The project is ready to deploy as-is: `vercel.json` contains the build, routing and function settings.

## Before you start

- A GitHub account with this repository.
- A free [Vercel](https://vercel.com) account (sign in with GitHub).
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).
- Recommended: run `python scripts/check_gemini.py` locally first to confirm the key works with all three models.

## Steps

1. **Get the code on your production branch.** Vercel deploys the repository's *production branch* (normally `main`) to the main URL. Other branches get preview URLs. If your work is on another branch, merge it into `main` first.
2. **Import the project.** Go to [vercel.com/new](https://vercel.com/new), choose the GitHub repository, and click *Import*.
3. **Leave the build settings alone.** The framework is Vite and the settings come from `vercel.json` (`npm run build`, output `dist`). The Python function in `api/index.py` is detected automatically and uses Python 3.12 unless you add a `.python-version` file.
4. **Add the environment variable before the first deploy.**
   - *Environment Variables* → Name `GEMINI_API_KEY`, Value = your key.
   - Tick *Production* (and *Preview* if you want preview URLs to work).
   - Optional: `GEMINI_TEXT_MODEL`, `GEMINI_IMAGE_MODEL`, `GEMINI_TTS_MODEL`, `GEMINI_TTS_VOICE`, `GEMINI_TIMEOUT` (see the README table).
5. **Deploy.** When it finishes, open the URL.
6. **Check the API.** Visit `/api/health`. Expected: `{"gemini_key_set":true,"status":"ok"}`. `false` means the variable is missing for that environment.
7. **Try it.** Sign in with any username and password, create a story, and confirm the image and audio appear.

### Changing the key or variables later

Edit them under *Settings → Environment Variables*, then **redeploy** (Deployments → the latest one → *Redeploy*). Running deployments keep the old values.

## Troubleshooting

| Symptom | Likely cause and fix |
| --- | --- |
| Page loads but story fails with "not configured" (`missing_api_key`) | `GEMINI_API_KEY` is not set for this environment, or you did not redeploy after adding it. Check `/api/health`. |
| "Gemini rejected the API key" (`provider_auth`) | Key is wrong, revoked, or has trailing spaces. Create a new one in AI Studio. |
| "rate limit or free-tier quota" (`provider_rate_limited`) | Free-tier limits reached, or that model has no free tier on your account. Wait a minute, or set a different `GEMINI_*_MODEL`. Run `scripts/check_gemini.py` to see which model is affected. |
| "configured Gemini model was not found" (`provider_model`) | A model name is wrong or retired. Fix the `GEMINI_*_MODEL` variable. |
| "took too long" (`timeout`, HTTP 504) | The model exceeded 55 s. Try a *short* story, a faster text model, or retry. |
| Story works, image or audio shows "unavailable" | That model failed (message shown). Use the Retry button; if it persists check quota for the image/speech model. |
| `/api/...` returns 404 from Vercel | The rewrite in `vercel.json` was changed or removed. It must map `/api/(.*)` to `/api/index`. |
| Build fails on the Python step | Check the build log; `requirements.txt` must list `Flask`, `google-genai`, `python-dotenv`. |
| Changes on a branch do not appear on the main URL | Only the production branch updates the main URL; use the preview URL or merge to `main`. |

Server logs for each request (including the real Gemini error text, never the key) are under the project's *Logs* tab in Vercel.

## Optional: command-line deploy

```bash
npm i -g vercel
vercel login
vercel          # preview deployment
vercel --prod   # production deployment
```

Add `GEMINI_API_KEY` first with `vercel env add GEMINI_API_KEY`.

## Protecting your quota

The demo login does not protect the API, so anyone with the URL can call `/api/*`. For anything public, cap your key's usage in Google AI Studio and consider adding rate limiting in Vercel.
