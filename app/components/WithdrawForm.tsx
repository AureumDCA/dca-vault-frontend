"use client";

import { useState } from "react";
import { rpc } from "@stellar/stellar-sdk";
import { signTransaction } from "@/lib/freighter";
import { buildWithdrawTx, submitSignedTx, readVaultBalance } from "@/lib/contract";

const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ?? "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ?? "";

const STROOPS_PER_XLM = 1e7;

interface Props {
  owner: string;
  currentBalance: number;
  onSuccess: (newBalance: number) => void;
}

export default function WithdrawForm({ owner, currentBalance, onSuccess }: Props) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentBalanceXlm = currentBalance / STROOPS_PER_XLM;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const xlm = parseFloat(amount);
    if (!Number.isFinite(xlm) || xlm <= 0) {
      setError("Enter a positive amount.");
      return;
    }
    if (xlm > currentBalanceXlm) {
      setError(
        `Amount exceeds your vault balance (${currentBalanceXlm} XLM available).`
      );
      return;
    }
    const amountStroops = BigInt(Math.round(xlm * STROOPS_PER_XLM));

    setLoading(true);
    try {
      const server = new rpc.Server(RPC_URL);
      const account = await server.getAccount(owner);

      // a. Build the unsigned withdraw transaction.
      const tx = buildWithdrawTx(
        owner,
        amountStroops,
        account.sequenceNumber(),
        NETWORK_PASSPHRASE
      );

      // b. Simulate to gather the Soroban footprint and resource fees.
      const sim = await server.simulateTransaction(tx);
      if (!rpc.Api.isSimulationSuccess(sim)) {
        throw new Error(
          "Simulation failed — check the amount and that your vault balance covers it."
        );
      }

      // c. Assemble the transaction with the simulation results.
      const assembled = rpc.assembleTransaction(tx, sim).build();

      // d. Sign the assembled XDR with Freighter.
      const signedXdr = await signTransaction(
        assembled.toXDR(),
        NETWORK_PASSPHRASE
      );

      // e-f. Submit and poll until the transaction is confirmed.
      await submitSignedTx(signedXdr, RPC_URL);

      // g. Report the authoritative new balance back to the parent.
      const newBalance = await readVaultBalance(owner, RPC_URL);
      onSuccess(newBalance);
      setAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg shadow-black/20 p-6 space-y-4"
    >
      <h2 className="text-lg font-semibold text-slate-100">Withdraw Funds</h2>

      <div className="space-y-1">
        <label className="text-sm text-slate-400">Amount (XLM)</label>
        <input
          type="number"
          min="0"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 50"
          required
          disabled={loading}
          className="w-full border border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
        />
        <p className="text-xs text-slate-500">
          Available: {currentBalanceXlm} XLM. Signed with Freighter and sent to
          the vault contract.
        </p>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-amber-400 text-slate-900 font-semibold rounded-lg hover:bg-amber-300 disabled:opacity-50 transition-colors"
      >
        {loading ? "Withdrawing…" : "Withdraw"}
      </button>
    </form>
  );
}
