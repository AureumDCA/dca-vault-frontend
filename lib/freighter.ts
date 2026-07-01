"use client";

import {
  isConnected as freighterIsConnected,
  getAddress,
  signTransaction as freighterSignTransaction,
  requestAccess,
} from "@stellar/freighter-api";

export async function isConnected(): Promise<boolean> {
  const result = await freighterIsConnected();
  return result.isConnected ?? false;
}

export async function connect(): Promise<string> {
  const result = await requestAccess();
  if (result.error) throw new Error(String(result.error));
  return result.address;
}

export async function getPublicKey(): Promise<string> {
  const result = await getAddress();
  if (result.error) throw new Error(String(result.error));
  return result.address;
}

export async function signTransaction(
  xdr: string,
  network: string
): Promise<string> {
  const result = await freighterSignTransaction(xdr, { networkPassphrase: network });
  if (result.error) throw new Error(String(result.error));
  return result.signedTxXdr;
}
