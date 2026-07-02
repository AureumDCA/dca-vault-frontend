# Contributing to dca-vault-frontend

Welcome! This repo is the user-facing frontend for StellarDCA: a Next.js dashboard with Freighter wallet integration where users connect their Stellar wallet, view their DCA vault status, and (soon) create and manage schedules. It's part of the **Stellar Drips Wave contributor program**, which rewards merged contributions with on-chain Drips payments. Maintainers assign complexity/points labels after review.

## Prerequisites

| Tool | Version / notes |
| --- | --- |
| Node.js | 20+ |
| npm | bundled with Node 20 |
| Freighter | [freighter.app](https://freighter.app) — browser extension, required to test wallet flows |

## Getting started

```sh
git clone https://github.com/StellarDCA/dca-vault-frontend.git
cd dca-vault-frontend
npm ci
cp .env.local.example .env.local
# fill in .env.local values (see Environment variables below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll need Freighter installed in your browser and `dca-vault-backend` running locally (default port 3001) for the vault and history pages to work.

## Environment variables

| Variable | Description | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the running `dca-vault-backend` | `http://localhost:3001` |
| `NEXT_PUBLIC_CONTRACT_ID` | Deployed dca-vault-contract address on testnet | `CDJF7V5NLGKAV7RHTBCR3LMHC7MUS7IWL6KYSLO6ZWEEJYJGWUVGEDEO` |
| `NEXT_PUBLIC_NETWORK_PASSPHRASE` | Stellar network identifier | `Test SDF Network ; September 2015` |

All three variables must be set for the app to function. `NEXT_PUBLIC_*` variables are inlined at build time by Next.js and are visible in the browser bundle — do not put secrets here.

## Running typechecks

```sh
npx tsc --noEmit
```

Zero errors required. The CI gate enforces this via `npx tsc --noEmit` before `npm run build`.

## Building

```sh
npm run build
```

Next.js also runs its own type pass during `build`, so a clean build is a second gating check.

## Branch naming

| Prefix | Use for |
| --- | --- |
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `test/` | New or updated tests |
| `chore/` | Tooling, CI, dependency bumps |

## Commit style

This repo uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: implement create_schedule transaction signing via Freighter
fix: handle vault not found error in VaultDashboard
docs: add Freighter setup notes to README
chore: bump @stellar/freighter-api to 5.1.0
```

One logical change per commit. Keep subjects under 72 characters.

## PR checklist

Before requesting review, confirm:

- [ ] `npx tsc --noEmit` passes — zero TypeScript errors
- [ ] `npm run build` succeeds
- [ ] Tested in a browser with Freighter installed — golden path and key edge cases
- [ ] If you changed env var requirements, `.env.local.example` is updated
- [ ] Branch name follows the naming conventions above
- [ ] Commit messages follow Conventional Commits

## Issue labels

| Label | Meaning |
| --- | --- |
| `bug` | Something isn't working |
| `documentation` | Improvements or additions to documentation |
| `duplicate` | This issue or pull request already exists |
| `enhancement` | New feature or request |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention is needed |
| `invalid` | This doesn't seem right |
| `question` | Further information is requested |
| `wontfix` | This will not be worked on |

**Do not add complexity or points labels yourself.** Maintainers assign these after review. Self-tagging inflates estimates and may disqualify your PR from Drips rewards.

## Stellar Drips Wave rules

- **Do not resolve issues you did not open.** Work on your own issue only. Closing someone else's issue without coordination will get your PR marked `invalid`.
- **Do not inflate complexity labels.** Requesting a higher complexity than the work warrants is against program rules.
- If you have scope or complexity questions, ask in the issue thread before writing code.
