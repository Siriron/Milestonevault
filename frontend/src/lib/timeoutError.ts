import { CHAIN } from '../config/chains';

export interface TimeoutError extends Error {
  txHash: string;
  isTimeout: true;
}

// Confirmed implementation pattern for this project's "surface a direct
// explorer link on timeout" rule: a real Error carrying the tx hash and a
// timeout flag as properties, not just a string message, so calling code
// can branch on err.isTimeout to render an explorer link distinctly from
// an actual rejected/reverted transaction. A timeout means the
// transaction was submitted and consensus is still working -- it likely
// succeeded -- which is a different UI state from a real failure.
export function timeoutError(hash: string): TimeoutError {
  const err = new Error(
    `Consensus is taking longer than expected. Your transaction was submitted -- check its status directly: ${CHAIN.explorerUrl}/tx/${hash}`
  ) as TimeoutError;
  err.txHash = hash;
  err.isTimeout = true;
  return err;
}

export function isTimeoutError(err: unknown): err is TimeoutError {
  return !!err && typeof err === 'object' && (err as any).isTimeout === true;
}
