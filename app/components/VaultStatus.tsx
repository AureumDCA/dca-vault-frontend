"use client";

interface Schedule {
  frequency: unknown;
  amount_per_execution: number | bigint;
  target_asset: string;
  pool_address: string;
  last_execution_ledger: number;
  next_execution_ledger: number;
  min_amount_out_bps: number;
}

interface VaultData {
  owner: string;
  balance: number | bigint;
  schedule: Schedule | null | undefined;
  paused: boolean;
}

interface Props {
  vault: VaultData;
}

function formatAmount(val: number | bigint): string {
  return (Number(val) / 1e7).toFixed(7);
}

function formatFrequency(freq: unknown): string {
  if (Array.isArray(freq) && freq.length > 0) return String(freq[0]);
  return String(freq);
}

export default function VaultStatus({ vault }: Props) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg shadow-black/20 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Vault</h2>
        {vault.paused && (
          <span className="px-2 py-1 text-xs font-medium bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded-full">
            Paused
          </span>
        )}
      </div>

      <div>
        <p className="text-sm text-slate-400">Balance</p>
        <p className="text-2xl font-bold text-amber-400">
          {formatAmount(vault.balance)} XLM
        </p>
      </div>

      {vault.schedule ? (
        <div className="border-t border-slate-800 pt-4 space-y-2">
          <p className="text-sm font-medium text-slate-300">Active Schedule</p>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-200">
            <span className="text-slate-400">Frequency</span>
            <span>{formatFrequency(vault.schedule.frequency)}</span>
            <span className="text-slate-400">Amount / swap</span>
            <span>{formatAmount(vault.schedule.amount_per_execution)} XLM</span>
            <span className="text-slate-400">Next execution</span>
            <span>ledger {vault.schedule.next_execution_ledger}</span>
            <span className="text-slate-400">Slippage tolerance</span>
            <span>{(vault.schedule.min_amount_out_bps / 100).toFixed(2)}%</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 break-all">
            Pool: {vault.schedule.pool_address}
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500 border-t border-slate-800 pt-4">No schedule configured.</p>
      )}
    </div>
  );
}
