"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import VaultStatus from "@/app/components/VaultStatus";
import SwapHistory from "@/app/components/SwapHistory";
import CreateSchedule from "@/app/components/CreateSchedule";
import { getVault, getHistory, SwapEvent } from "@/lib/stellar";

function VaultDashboard() {
  const params = useSearchParams();
  const owner = params.get("owner") ?? "";

  const [vault, setVault] = useState<unknown>(null);
  const [history, setHistory] = useState<SwapEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!owner) return;
    setLoading(true);
    setError(null);

    Promise.all([getVault(owner), getHistory(owner)])
      .then(([v, h]) => {
        setVault(v);
        setHistory(h);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load vault");
      })
      .finally(() => setLoading(false));
  }, [owner]);

  if (!owner) {
    return (
      <p className="text-gray-500">No owner specified. Connect your wallet first.</p>
    );
  }

  if (loading) {
    return <p className="text-gray-500 animate-pulse">Loading vault…</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="text-xs text-gray-400 font-mono break-all">
        Owner: {owner}
      </div>

      {vault !== null && (
        <VaultStatus
          vault={
            vault as {
              owner: string;
              balance: number;
              schedule: null | {
                frequency: unknown;
                amount_per_execution: number;
                target_asset: string;
                pool_address: string;
                last_execution_ledger: number;
                next_execution_ledger: number;
                min_amount_out_bps: number;
              };
              paused: boolean;
            }
          }
        />
      )}

      <CreateSchedule
        onSubmit={async (values) => {
          // TODO: build and sign the create_schedule transaction via freighter,
          // then submit via stellar-sdk. Requires EXECUTOR_SECRET or user signature.
          console.log("create_schedule payload", values);
          alert("Transaction signing not yet implemented — check console.");
        }}
      />

      <SwapHistory events={history} />
    </div>
  );
}

export default function VaultPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Vault</h1>
        <Suspense fallback={<p className="text-gray-400 animate-pulse">Loading…</p>}>
          <VaultDashboard />
        </Suspense>
      </div>
    </main>
  );
}
