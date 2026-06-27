/**
 * Feature flags for the site.
 *
 * SHOW_EXPENSES controls whether the "Cuentas de las Fiestas" (expenses
 * chart) section is rendered on the homepage.
 *
 * Two ways to turn it on:
 *
 * 1. Quick toggle (requires a commit + push to `main`):
 *    Change the line below from `false` to `true`.
 *
 * 2. No-code toggle (requires only a redeploy, no git push):
 *    Set the environment variable `PUBLIC_SHOW_EXPENSES=true` in the
 *    Cloudflare Pages project settings (Settings → Environment variables),
 *    then trigger a new deployment from the Cloudflare dashboard
 *    ("Retry deployment" on the latest one works fine, no need for a new
 *    commit). Because this is a static site, the value is baked in at
 *    build time, so a fresh build is always required either way.
 */
export const SHOW_EXPENSES = import.meta.env.PUBLIC_SHOW_EXPENSES === 'true';

export const INSTAGRAM_URL =
  'https://www.instagram.com/p/DTyETOODLZ2/?igsh=bnRlODE4ZjRqNHZ6';
