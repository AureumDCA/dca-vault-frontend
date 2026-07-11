"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { rpc } from "@stellar/stellar-sdk";
import VaultStatus from "@/app/components/VaultStatus";
import SwapHistory from "@/app/components/SwapHistory";
import CreateSchedule from "@/app/components/CreateSchedule";
import DepositForm from "@/app/components/DepositForm";
import { getVault, getHistory, SwapEvent } from "@/lib/stellar";
import { buildCreateScheduleTx, submitSignedTx } from "@/lib/contract";
import { signTransaction } from "@/lib/freighter";

const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ?? "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ?? "";
const STROOPS_PER_XLM = 1e7;

function VaultDashboard() {
  const params = useSearchParams();
  const owner = params.get("owner") ?? "";

  const [vault, setVault] = useState<unknown>(null);
  const [history, setHistory] = useState<SwapEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVault = useCallback(() => {
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

  useEffect(() => {
    loadVault();
  }, [loadVault]);

  if (!owner) {
    return (
      <p className="text-slate-400">No owner specified. Connect your wallet first.</p>
    );
  }

  if (loading) {
    return <p className="text-slate-400 animate-pulse">Loading vault…</p>;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="text-xs text-slate-500 font-mono break-all">
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

      <DepositForm
        owner={owner}
        onSuccess={() => {
          // Re-fetch the authoritative vault state after a confirmed deposit.
          loadVault();
        }}
      />

      <CreateSchedule
        onSubmit={async (values) => {
          const xlm = parseFloat(values.amountPerExecution);
          if (!Number.isFinite(xlm) || xlm <= 0) {
            throw new Error("Amount per execution must be a positive number.");
          }
          const minAmountOutBps = parseInt(values.minAmountOutBps, 10);
          if (!Number.isFinite(minAmountOutBps)) {
            throw new Error("Slippage tolerance must be a number.");
          }

          const server = new rpc.Server(RPC_URL);
          const account = await server.getAccount(owner);

          // Build the unsigned create_schedule transaction.
          const tx = buildCreateScheduleTx(
            owner,
            {
              frequency: values.frequency,
              amountPerExecutionStroops: BigInt(Math.round(xlm * STROOPS_PER_XLM)),
              targetAsset: values.targetAsset,
              poolAddress: values.poolAddress,
              minAmountOutBps,
            },
            account.sequenceNumber(),
            NETWORK_PASSPHRASE
          );

          // Simulate to gather the Soroban footprint and resource fees.
          const sim = await server.simulateTransaction(tx);
          if (!rpc.Api.isSimulationSuccess(sim)) {
            throw new Error(
              "Simulation failed — check the target asset and pool addresses."
            );
          }

          // Assemble, sign with Freighter, then submit and poll for confirmation.
          const assembled = rpc.assembleTransaction(tx, sim).build();
          const signedXdr = await signTransaction(assembled.toXDR(), NETWORK_PASSPHRASE);
          await submitSignedTx(signedXdr, RPC_URL);

          // Refresh vault state so the new schedule shows up immediately.
          loadVault();
        }}
      />

      <SwapHistory events={history} />
    </div>
  );
}

export default function VaultPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-amber-400">Your Vault</h1>
        <Suspense fallback={<p className="text-slate-400 animate-pulse">Loading…</p>}>
          <VaultDashboard />
        </Suspense>
      </div>
    </main>
  );
}
