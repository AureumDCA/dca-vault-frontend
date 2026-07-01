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
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Swap History</h2>
        <p className="text-sm text-gray-400">No swaps executed yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Swap History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="pb-2 pr-4 font-medium">Ledger</th>
              <th className="pb-2 pr-4 font-medium">Invested (XLM)</th>
              <th className="pb-2 pr-4 font-medium">Received</th>
              <th className="pb-2 font-medium">Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2 pr-4">{e.ledger_sequence}</td>
                <td className="py-2 pr-4">{formatAmount(e.amount_in)}</td>
                <td className="py-2 pr-4">{formatAmount(e.amount_out)}</td>
                <td className="py-2 font-mono text-xs text-gray-400 truncate max-w-[120px]">
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
