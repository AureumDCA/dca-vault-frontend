import {
  Account,
  Address,
  BASE_FEE,
  Contract,
  Transaction,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  rpc,
} from "@stellar/stellar-sdk";

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID ?? "";
const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ?? "";

/**
 * Builds the unsigned Soroban transaction that calls `deposit(owner, amount)`
 * on the vault contract. The owner is the transaction source (they must sign),
 * and `amountStroops` is the deposit amount in stroops (1 XLM = 1e7 stroops)
 * passed as the contract's `i128` amount. The returned transaction still needs
 * to be simulated + assembled before signing.
 */
export function buildDepositTx(
  owner: string,
  amountStroops: bigint,
  accountSequence: string,
  networkPassphrase: string
): Transaction {
  if (!CONTRACT_ID) throw new Error("NEXT_PUBLIC_CONTRACT_ID is not set");

  const source = new Account(owner, accountSequence);
  const contract = new Contract(CONTRACT_ID);

  return new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      contract.call(
        "deposit",
        new Address(owner).toScVal(),
        nativeToScVal(amountStroops, { type: "i128" })
      )
    )
    .setTimeout(30)
    .build();
}

/**
 * Submits an already-signed transaction XDR to the Soroban RPC and polls until
 * it is confirmed. Resolves with the transaction hash on SUCCESS; throws on a
 * failed submission, a FAILED on-chain result, or a confirmation timeout.
 * Mirrors the poll loop used by the backend executor.
 */
export async function submitSignedTx(
  signedXdr: string,
  rpcUrl: string
): Promise<string> {
  const server = new rpc.Server(rpcUrl);
  const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);

  const sendResult = await server.sendTransaction(tx);
  if (sendResult.status !== "PENDING" && sendResult.status !== "DUPLICATE") {
    throw new Error(`Transaction submission failed: ${sendResult.status}`);
  }

  const hash = sendResult.hash;
  for (let i = 0; i < 20; i++) {
    await delay(3000);
    const getResult = await server.getTransaction(hash);
    if (getResult.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return hash;
    }
    if (getResult.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`Transaction failed on-chain (${hash})`);
    }
  }

  throw new Error(`Transaction confirmation timed out (${hash})`);
}

/**
 * Reads a vault's current balance (in stroops) by simulating a `get_vault`
 * call — no signature or fee is required for a read-only simulation. Used to
 * report the authoritative post-deposit balance back to the UI.
 */
export async function readVaultBalance(
  owner: string,
  rpcUrl: string
): Promise<number> {
  if (!CONTRACT_ID) throw new Error("NEXT_PUBLIC_CONTRACT_ID is not set");

  const server = new rpc.Server(rpcUrl);
  const account = await server.getAccount(owner);
  const contract = new Contract(CONTRACT_ID);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call("get_vault", new Address(owner).toScVal()))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim) || !sim.result?.retval) {
    throw new Error("get_vault simulation failed");
  }

  const vault = scValToNative(sim.result.retval) as { balance: bigint };
  return Number(vault.balance);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
