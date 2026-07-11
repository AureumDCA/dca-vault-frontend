"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConnectWallet from "@/app/components/ConnectWallet";

export default function Home() {
  const router = useRouter();
  const [publicKey, setPublicKey] = useState<string | null>(null);

  function handleConnect(pk: string) {
    setPublicKey(pk);
    router.push(`/vault?owner=${pk}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-950">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-amber-400">AureumDCA</h1>
          <p className="mt-3 text-lg text-slate-400">
            Trustless dollar-cost averaging on Stellar. Deposit XLM, set a
            schedule, let the vault do the rest.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg shadow-black/20 p-8">
          {publicKey ? (
            <p className="text-sm text-slate-400 font-mono break-all">{publicKey}</p>
          ) : (
            <ConnectWallet onConnect={handleConnect} />
          )}
        </div>

        <p className="text-xs text-slate-500">
          Requires{" "}
          <a
            href="https://freighter.app"
            className="text-amber-400 underline hover:text-amber-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            Freighter
          </a>{" "}
          browser extension.
        </p>
      </div>
    </main>
  );
}
