# DCA Vault Frontend

The user-facing web app for [AureumDCA](https://github.com/AureumDCA): vault creation, dashboard, and portfolio UI built with Next.js 16, Tailwind CSS, and the Freighter wallet extension.

Users connect their Stellar wallet via Freighter, view their on-chain DCA vault status and swap history, and (coming soon) create and manage recurring swap schedules directly from the browser — all without handing custody of their funds to anyone.

## Pages

| Path | Description |
| --- | --- |
| `/` | Landing page — connect your Freighter wallet; redirects to `/vault?owner=<publicKey>` on success |
| `/vault` | Vault dashboard — shows vault status, schedule details, swap history, and the schedule creation form |

## Components

| Component | Description |
| --- | --- |
| `ConnectWallet` | Detects Freighter, prompts connection, returns the user's public key |
| `VaultStatus` | Displays vault balance (in XLM), active schedule details, and paused state |
| `CreateSchedule` | Form for configuring a new recurring swap schedule (frequency, amount, target asset, pool, slippage) |
| `SwapHistory` | Table of past swap executions with ledger, amounts, and transaction hash |

## Environment variables

| Variable | Description | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the running `dca-vault-backend` | `http://localhost:3001` |
| `NEXT_PUBLIC_CONTRACT_ID` | Deployed dca-vault-contract address | `CDJF7V5NLGKAV7RHTBCR3LMHC7MUS7IWL6KYSLO6ZWEEJYJGWUVGEDEO` |
| `NEXT_PUBLIC_NETWORK_PASSPHRASE` | Stellar network identifier | `Test SDF Network ; September 2015` |

Copy `.env.local.example` to `.env.local` and fill in the values.

## Setup

Requires [dca-vault-backend](https://github.com/AureumDCA/dca-vault-backend) running locally and [Freighter](https://freighter.app) installed in your browser.

```sh
git clone https://github.com/AureumDCA/dca-vault-frontend.git
cd dca-vault-frontend
npm ci
cp .env.local.example .env.local
# edit .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Typechecks and build

```sh
npx tsc --noEmit   # must be zero errors
npm run build      # production build
```

## Current limitations

Transaction signing for `deposit`, `create_schedule`, and `withdraw` is **not yet implemented** — the `CreateSchedule` form's submit handler is a stub (`console.log` + alert). These are tracked as contributor issues:

- Implement `create_schedule` transaction signing via Freighter
- Implement `deposit` UI and transaction
- Implement `withdraw` UI and transaction

Each requires building a Soroban transaction with `stellar-sdk`, signing it with Freighter's `signTransaction`, and submitting it to the Soroban RPC.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for prerequisites, setup, branch naming, commit style, the PR checklist, and Drips Wave rules.
