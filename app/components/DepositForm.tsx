"use client";

import { useState } from "react";
import { rpc } from "@stellar/stellar-sdk";
import { signTransaction } from "@/lib/freighter";
import { buildDepositTx, submitSignedTx, readVaultBalance } from "@/lib/contract";

const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ?? "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ?? "";

const STROOPS_PER_XLM = 1e7;

interface Props {
  owner: string;
  onSuccess: (newBalance: number) => void;
}

export default function DepositForm({ owner, onSuccess }: Props) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const xlm = parseFloat(amount);
    if (!Number.isFinite(xlm) || xlm <= 0) {
      setError("Enter a positive amount.");
      return;
    }
    const amountStroops = BigInt(Math.round(xlm * STROOPS_PER_XLM));

    setLoading(true);
    try {
      const server = new rpc.Server(RPC_URL);
      const account = await server.getAccount(owner);

      // a. Build the unsigned deposit transaction.
      const tx = buildDepositTx(
        owner,
        amountStroops,
        account.sequenceNumber(),
        NETWORK_PASSPHRASE
      );

      // b. Simulate to gather the Soroban footprint and resource fees.
      const sim = await server.simulateTransaction(tx);
      if (!rpc.Api.isSimulationSuccess(sim)) {
        throw new Error(
          "Simulation failed — check the amount and that your account is funded."
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
      setError(err instanceof Error ? err.message : "Deposit failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow p-6 space-y-4"
    >
      <h2 className="text-lg font-semibold text-gray-800">Deposit Funds</h2>

      <div className="space-y-1">
        <label className="text-sm text-gray-600">Amount (XLM)</label>
        <input
          type="number"
          min="0"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 100"
          required
          disabled={loading}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        />
        <p className="text-xs text-gray-400">
          Signed with Freighter and sent to the vault contract.
        </p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Depositing…" : "Deposit"}
      </button>
    </form>
  );
}
