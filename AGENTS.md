<!-- stripe-projects-cli managed:agents-md:start -->
## Stripe Projects CLI

This repository is initialized for the Stripe project "macrofactor-explorer".

## Tools used

- [Stripe CLI](https://docs.stripe.com/stripe-cli) with the `projects` plugin to manage third-party services, credentials, and deployments for this project. Use the stripe-projects-cli to manage deploying and access to third party services.
<!-- stripe-projects-cli managed:agents-md:end -->

## Production deployments

**Never run `vercel deploy --prod` from a local checkout.** Production deploys must be git-driven: push to `main` and let Vercel build and alias the result.

Why: `vercel deploy --prod` aliases whatever's on disk to `macrofactor-dashboard.vercel.app`, clobbering the previous prod build — even if `origin/main` is ahead. On 2026-08-10 this replaced the theme picker (PR #34, `be474fb`) with a stale `19a9c9f` build.

If a bad deploy ships:

- Prefer `vercel promote <good-deployment-url>` (no rebuild).
- Or `git pull && vercel deploy --prod` as a last resort, after confirming `HEAD == origin/main`.

Before any prod deploy, verify:

```
git fetch origin
git rev-parse HEAD
git rev-parse origin/main
```

These must match.
