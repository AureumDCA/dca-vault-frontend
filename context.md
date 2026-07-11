# DCA Vault Frontend — Context Log

This file tracks every edit, decision, and development session for the `dca-vault-frontend` repo. Update it at the end of every working session — newest entry on top.

## Session log

### Session 5 — 2026-07-11

**Re-theme: gold + dark navy instead of white.** Requested design change —
swapped the entire UI's white/indigo palette for a dark-navy/gold one, using
plain Tailwind utilities (matching the codebase's existing convention, no
custom `@theme` tokens):

- Page background `bg-gray-50` → `bg-slate-950`; cards `bg-white` →
  `bg-slate-900 border border-slate-800 shadow-lg shadow-black/20`.
- Primary actions `bg-indigo-600`/`hover:bg-indigo-700` (white text) →
  `bg-amber-400`/`hover:bg-amber-300` with dark (`text-slate-900`) text for
  contrast; focus rings `ring-indigo-500` → `ring-amber-400`.
- Text hierarchy: `text-gray-900/800/700/600/500/400` → the equivalent
  `slate-100/100/300/400/400/500` scale; brand heading ("AureumDCA", "Your
  Vault") and the vault balance figure use `text-amber-400` as a gold accent.
  Error text `red-500` → `red-400` (better contrast on dark). "Paused" badge
  `yellow-100/yellow-800` → `amber-400/10` bg with `amber-300` text.
- `globals.css`: root `--background`/`--foreground` now dark navy (`#020617`)
  / light (`#f1f5f9`); removed the `prefers-color-scheme: dark` media query
  since gold-on-navy is now the fixed brand theme, not something that should
  flip with system light/dark preference.

Verified visually before committing, not just via typecheck: ran the dev
server and screenshotted both the landing page and a full vault dashboard
(temporarily injected mock vault/history data into `loadVault` for the
screenshot only, then reverted verbatim — confirmed via `git diff --stat`
matching the pre-mock diff and a clean `tsc` — since no funded test vault
exists on the live backend to render the four cards with real data).

`npx tsc --noEmit` and `npm run build` both pass with zero errors.

### Session 4 — 2026-07-11

**README: CI/License badges + Live Deployment section + real screenshot.**
Added `CI` and `License: MIT` badges under the H1. Added a "Live Deployment"
section linking `https://dca-vault-frontend.vercel.app` — verified live first
(`curl` → `200`, real Next.js HTML) rather than trusting the URL blind.

Took an actual screenshot rather than a placeholder: Chrome + the Playwright
CLI were both available locally, so `npx playwright screenshot
--browser=chromium --viewport-size=1280,800 <url> docs/screenshot-landing.png`
captured the live landing page directly (no script needed — Playwright's CLI
has a built-in `screenshot` subcommand). Viewed the result before committing
to confirm it actually shows the "Connect Freighter Wallet" screen and isn't
a blank/error page. Saved to `docs/screenshot-landing.png` (new `docs/` dir),
referenced with a standard markdown image tag.

One correction to the requested copy: the Live Deployment note originally
said schedule-creation signing was "still in progress," but that shipped and
issue #1 closed on 2026-07-09 (Session 3) — only withdraw (#2) remains
unsigned. Wrote the note to reflect that instead of publishing a stale claim.
Did not touch the existing "Current limitations" section, which still has
this same staleness (lists `create_schedule` and `deposit` as not
implemented) — out of scope for today's additive-only instructions, flagged
to the user instead.

`npx tsc --noEmit` and `npm run build` both pass with zero errors after the
README/docs-only change.

### Session 3 — 2026-07-09

**Closed issue #1: `create_schedule` transaction signing via Freighter.**

`CreateSchedule`'s `onSubmit` was a stub (`console.log` + `alert`). Wired it
to the real flow in `app/vault/page.tsx`, following the same
simulate → assemble → sign → submit/poll shape `DepositForm` already
established:

- **`lib/contract.ts`**: added `buildCreateScheduleTx(owner, params,
  accountSequence, networkPassphrase)`. The tricky part is `frequency`: the
  contract's `Frequency` enum is a fieldless `#[contracttype]` variant, whose
  wire shape is a one-element vec of a symbol (this app already assumes that
  shape when *reading* it back — see `VaultStatus.tsx`'s `formatFrequency`,
  which unwraps `["Weekly"]`). Building the same shape going the other
  direction is `nativeToScVal([frequency], { type: ["symbol"] })` — confirmed
  against `@stellar/stellar-base/lib/scval.js`'s documented behavior for
  array + type-hint inputs, rather than guessing.
- **`app/vault/page.tsx`**: `CreateSchedule`'s `onSubmit` (unlike
  `DepositForm`, which owns its whole flow internally) is a prop the parent
  page implements, so the signing flow lives here: parse/validate the form's
  XLM amount and bps, `buildCreateScheduleTx`, `simulateTransaction`,
  `assembleTransaction`, Freighter `signTransaction`, `submitSignedTx`, then
  `loadVault()` to refresh the dashboard. Thrown errors surface through
  `CreateSchedule`'s existing try/catch + error-state UI, so no new
  error-handling plumbing was needed there.

`npx tsc --noEmit` and `npm run build` both pass with zero errors.

### Session 2 — 2026-07-03

**Implement deposit transaction signing via Freighter.** The UI had no way to
fund a vault — `CreateSchedule`'s `onSubmit` was a `console.log`/`alert` stub.
Built the full sign-and-submit flow for the contract's
`deposit(owner: Address, amount: i128)` entrypoint (requires owner auth).

- **`lib/contract.ts`** (new): keeps transaction plumbing out of the component.
  - `buildDepositTx(owner, amountStroops, accountSequence, networkPassphrase)`
    — constructs the unsigned Soroban tx (`Account` source = owner, `Contract`
    call to `deposit` with the owner `Address` and an `i128` amount built via
    `nativeToScVal`). Reads `NEXT_PUBLIC_CONTRACT_ID`.
  - `submitSignedTx(signedXdr, rpcUrl)` — rebuilds the signed tx from XDR,
    `sendTransaction`, then polls `getTransaction` every 3s (max 20 tries) for
    SUCCESS/FAILED — same pattern as the backend executor. Returns the tx hash.
  - `readVaultBalance(owner, rpcUrl)` — simulates `get_vault` (read-only, no
    signature) to fetch the authoritative post-deposit balance in stroops.
- **`app/components/DepositForm.tsx`** (new): props `{ owner, onSuccess }`.
  Amount entered in XLM, converted to stroops (`* 1e7`). On submit:
  getAccount → buildDepositTx → `simulateTransaction` → `assembleTransaction`
  → Freighter `signTransaction` → `submitSignedTx` → `readVaultBalance` →
  `onSuccess(newBalance)`. Loading state disables the form; errors surface
  inline. Styling matches `CreateSchedule`.
- **`app/vault/page.tsx`**: rendered `DepositForm` below `VaultStatus`.
  Refactored the vault-loading effect into a `loadVault` `useCallback` so the
  deposit's `onSuccess` can re-fetch the authoritative vault state.
- **env**: added `NEXT_PUBLIC_RPC_URL` (default
  `https://soroban-testnet.stellar.org`) to `.env.local` and
  `.env.local.example` — the frontend now talks to Soroban RPC directly, not
  just the backend API.

`npx tsc --noEmit` and `npm run build` both pass with zero errors.

### Session 1 — 2026-07-01

**Initial scaffold: Next.js 16 app router, Freighter wallet integration, backend API wrappers, four UI components, landing page, vault dashboard.**

**What was built:**

- **Next.js 16.2.9 app-router scaffold** via `create-next-app@latest` with TypeScript, Tailwind CSS, ESLint, no `src/` dir. Additional deps: `@stellar/freighter-api @stellar/stellar-sdk`.

- **`lib/freighter.ts`** — typed wrappers for the Freighter browser extension API (v5):
  - `isConnected(): Promise<boolean>` — calls `freighterIsConnected()`, extracts `.isConnected` boolean (v5 returns an object, not a bare boolean).
  - `connect(): Promise<string>` — calls `requestAccess()`, returns `.address`.
  - `getPublicKey(): Promise<string>` — calls `getAddress()`, returns `.address`.
  - `signTransaction(xdr, network): Promise<string>` — calls `freighterSignTransaction(xdr, { networkPassphrase: network })`, returns `.signedTxXdr`.

- **`lib/stellar.ts`** — fetch wrappers around the `dca-vault-backend` REST API. `NEXT_PUBLIC_API_URL` env var (default `http://localhost:3001`). Exports `getVault(owner)`, `getHistory(owner): Promise<SwapEvent[]>`, `getPerformance(owner): Promise<Performance>`.

- **Components** (`app/components/`):
  - `ConnectWallet.tsx` — props `{ onConnect: (pk: string) => void }`. Calls `isConnected()` then `connect()`. Shows connect button or "Connected: <pk>" state.
  - `VaultStatus.tsx` — displays balance (stroops ÷ 1e7 → XLM), schedule frequency, amount per execution, next execution ledger, paused badge. `formatFrequency(freq)` handles the `#[contracttype]` C-like enum shape: `scValToNative` converts it to `["Daily"]` (a single-element array), so the function checks `Array.isArray(freq) ? freq[0] : freq`.
  - `CreateSchedule.tsx` — form with frequency select (Daily/Weekly/Monthly), `amountPerExecution`, `targetAsset`, `poolAddress`, `minAmountOutBps`. Props `{ onSubmit: (values: FormValues) => Promise<void> }`.
  - `SwapHistory.tsx` — table of `SwapEvent[]` columns: ledger, amount_in (stroops), amount_out (stroops), tx_hash (truncated with link).

- **Pages**:
  - `app/page.tsx` — landing page. After Freighter connect, calls `useRouter().push(/vault?owner=<pk>)`.
  - `app/vault/page.tsx` — split into `VaultDashboard` (inner, uses `useSearchParams`) and `VaultPage` (exported default, wraps in `<Suspense>`). Loads vault + history in parallel via `Promise.all([getVault, getHistory])`. `CreateSchedule.onSubmit` is a stub: `console.log + alert`.

**Key technical decisions:**

- **`@stellar/freighter-api` v5 — `getAddress` not `getPublicKey`**: v5 removed `getPublicKey`; it's now `getAddress()` which returns `{ address: string }`. Discovered by inspecting `Object.keys(require('@stellar/freighter-api'))` at runtime and reading the `.d.ts` file, not from documentation. `isConnected()` returns `{ isConnected: boolean }` (not a bare `boolean`); must extract `.isConnected`.

- **`useSearchParams` requires `Suspense` boundary**: Next.js app router requires any component calling `useSearchParams()` to be rendered inside a `<Suspense>` boundary. The solution is to split the page into two components: the inner one uses `useSearchParams` and is the `Suspense` child, the outer (exported default) provides the boundary.

- **`vault !== null` not `vault &&`**: `vault` is typed `unknown`. The `&&` short-circuit returns the falsy path value unchanged — `false` when `vault` is `null` — and `false` is not assignable to `ReactNode` in TypeScript. Must use `vault !== null` as the condition.

- **`create-next-app` requires empty directory**: any non-`.git` file in the target directory blocks initialization. Temporarily moved `README.md` to `/tmp/` during init, restored it after. The `.gitignore` generated by Next.js has `.env*` which catches `.env.local.example`; fixed with a `!.env*.example` negation line.

- **Transaction signing deliberately stubbed**: `CreateSchedule.onSubmit` is `console.log + alert` intentionally. Building and signing the `create_schedule` Soroban transaction (assemble → Freighter sign → submit) is non-trivial and tracked as a separate contributor issue. Keeping it stubbed means the scaffold compiles and the UI is testable without requiring a live contract interaction.

**Known gaps at end of session:**

- `CreateSchedule.onSubmit` in `app/vault/page.tsx` is a stub — no transaction signing implemented.
- No deposit UI (no way to fund the vault from the frontend yet).
- No withdraw UI.
- All three of the above tracked as contributor issues.

**CI**: `.github/workflows/ci.yml` — `npm ci` → `npx tsc --noEmit` → `npm run build`. Node 20, `actions/setup-node@v4` with `cache: 'npm'`. (Uses `npx tsc` directly rather than a `typecheck` npm script because Next.js sets `noEmit: true` in `tsconfig.json` already, and `npm run build` also runs tsc internally.) CI green on first push.
