"use client";

import { useState } from "react";

interface FormValues {
  frequency: "Daily" | "Weekly" | "Monthly";
  amountPerExecution: string;
  targetAsset: string;
  poolAddress: string;
  minAmountOutBps: string;
}

interface Props {
  onSubmit: (values: FormValues) => Promise<void>;
}

export default function CreateSchedule({ onSubmit }: Props) {
  const [values, setValues] = useState<FormValues>({
    frequency: "Weekly",
    amountPerExecution: "",
    targetAsset: "",
    poolAddress: "",
    minAmountOutBps: "9500",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create schedule");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg shadow-black/20 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-slate-100">Create Schedule</h2>

      <div className="space-y-1">
        <label className="text-sm text-slate-400">Frequency</label>
        <select
          value={values.frequency}
          onChange={(e) => set("frequency", e.target.value as FormValues["frequency"])}
          className="w-full border border-slate-700 bg-slate-800 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-slate-400">Amount per execution (XLM)</label>
        <input
          type="number"
          min="0"
          step="any"
          value={values.amountPerExecution}
          onChange={(e) => set("amountPerExecution", e.target.value)}
          placeholder="e.g. 10"
          required
          className="w-full border border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-slate-400">Target asset contract ID</label>
        <input
          type="text"
          value={values.targetAsset}
          onChange={(e) => set("targetAsset", e.target.value)}
          placeholder="C…"
          required
          className="w-full border border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-slate-400">Pool contract address</label>
        <input
          type="text"
          value={values.poolAddress}
          onChange={(e) => set("poolAddress", e.target.value)}
          placeholder="C…"
          required
          className="w-full border border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-slate-400">
          Slippage tolerance (bps, e.g. 9500 = 95%)
        </label>
        <input
          type="number"
          min="0"
          max="10000"
          value={values.minAmountOutBps}
          onChange={(e) => set("minAmountOutBps", e.target.value)}
          required
          className="w-full border border-slate-700 bg-slate-800 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-amber-400 text-slate-900 font-semibold rounded-lg hover:bg-amber-300 disabled:opacity-50 transition-colors"
      >
        {loading ? "Submitting…" : "Create Schedule"}
      </button>
    </form>
  );
}
