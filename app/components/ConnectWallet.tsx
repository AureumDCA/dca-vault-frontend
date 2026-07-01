"use client";

import { useState } from "react";
import { connect, isConnected } from "@/lib/freighter";

interface Props {
  onConnect: (publicKey: string) => void;
}

export default function ConnectWallet({ onConnect }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setLoading(true);
    setError(null);
    try {
      const connected = await isConnected();
      if (!connected) {
        setError("Freighter wallet not found. Install the Freighter extension.");
        return;
      }
      const publicKey = await connect();
      onConnect(publicKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleConnect}
        disabled={loading}
        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Connecting…" : "Connect Freighter Wallet"}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
