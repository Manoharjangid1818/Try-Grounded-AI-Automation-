# Run in Jenkins (Playwright CI)

This file is only for Jenkins execution. Use `README.md` for contributor setup, `RunCommands.md` for local commands, and `PROJECT_DOCUMENTATION.md` for the full framework walkthrough.

## Prerequisites (Strategy A: provide auth/user.json)

- Jenkins agent must have Node.js available.
- You must provide `auth/user.json` in the workspace before tests run.
    - Recommended: copy from a Jenkins artifact or write it from a Jenkins secret.
    - Jenkinsfile expects it at: `auth/user.json`.

## Configuration

Environment variables used by Playwright:

- `CI=true` (enables retries/workers=2)
- `HEADLESS=true` (runs browser headless)
- `BASE_URL` (optional; defaults to `https://grounded-topaz.vercel.app/dashboard`)

## Test execution

The Jenkinsfile runs:

1. `npm ci || npm install`
2. `npx playwright install --with-deps`
3. Verifies `auth/user.json` exists
4. `npx playwright test`

## Reports/artifacts

Jenkins archives:

- `playwright-report/**`
- `results/junit-results.xml`
- `results/playwright-results.json`

Jenkins must not archive `auth/user.json` or `.env`.

## Important notes

- `tests/auth.setup.spec.js` is **not** run in CI.
- OTP is manual in `tests/auth.setup.spec.js`, so you must rely on the prebuilt `auth/user.json`.
