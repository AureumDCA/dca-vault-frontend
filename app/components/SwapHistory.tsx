"use client";

import { SwapEvent } from "@/lib/stellar";

interface Props {
  events: SwapEvent[];
}

function formatAmount(stroops: number): string {
  return (stroops / 1e7).toFixed(7);
}

export default function SwapHistory({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg shadow-black/20 p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-2">Swap History</h2>
        <p className="text-sm text-slate-500">No swaps executed yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg shadow-black/20 p-6">
      <h2 className="text-lg font-semibold text-slate-100 mb-4">Swap History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-200">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800">
              <th className="pb-2 pr-4 font-medium">Ledger</th>
              <th className="pb-2 pr-4 font-medium">Invested (XLM)</th>
              <th className="pb-2 pr-4 font-medium">Received</th>
              <th className="pb-2 font-medium">Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/60">
                <td className="py-2 pr-4">{e.ledger_sequence}</td>
                <td className="py-2 pr-4">{formatAmount(e.amount_in)}</td>
                <td className="py-2 pr-4">{formatAmount(e.amount_out)}</td>
                <td className="py-2 font-mono text-xs text-slate-500 truncate max-w-[120px]">
                  {e.tx_hash}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
