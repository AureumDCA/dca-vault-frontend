const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface SwapEvent {
  id: number;
  owner: string;
  amount_in: number;
  amount_out: number;
  pool_address: string;
  ledger_sequence: number;
  tx_hash: string;
  created_at: string;
}

export interface Performance {
  owner: string;
  total_swaps: number;
  total_invested: number;
  total_received: number;
  avg_price: number | null;
}

export async function getVault(owner: string): Promise<unknown> {
  const res = await fetch(`${API_URL}/vaults/${owner}`);
  if (!res.ok) throw new Error(`getVault failed: ${res.status}`);
  return res.json();
}

export async function getHistory(owner: string): Promise<SwapEvent[]> {
  const res = await fetch(`${API_URL}/vaults/${owner}/history`);
  if (!res.ok) throw new Error(`getHistory failed: ${res.status}`);
  return res.json();
}

export async function getPerformance(owner: string): Promise<Performance> {
  const res = await fetch(`${API_URL}/vaults/${owner}/performance`);
  if (!res.ok) throw new Error(`getPerformance failed: ${res.status}`);
  return res.json();
}
