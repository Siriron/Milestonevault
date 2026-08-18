import { CHAIN, NONDET_METHODS } from '../config/chains';
import { isTimeoutError } from '../lib/timeoutError';

export type TxState =
  | { phase: 'idle' }
  | { phase: 'pending'; functionName: string }
  | { phase: 'success'; txHash: string }
  | { phase: 'timeout'; txHash: string }
  | { phase: 'error'; message: string };

interface TxStatusProps {
  state: TxState;
}

// Distinguishes pending / success / timeout / error as genuinely
// different UI states, not one generic blob -- a timeout is not the same
// state as a rejected transaction, and collapsing them loses exactly the
// information the person needs (their transaction likely succeeded; go
// check).
export function TxStatus({ state }: TxStatusProps) {
  if (state.phase === 'idle') return null;

  if (state.phase === 'pending') {
    const isNondet = NONDET_METHODS.has(state.functionName);
    return (
      <div className="flex items-center gap-3 rounded-lg border border-pending/30 bg-pending/5 px-4 py-3">
        <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-pending" />
        <div className="font-body text-sm text-ink/80">
          <div>Transaction pending…</div>
          {isNondet && (
            <div className="mt-0.5 text-xs text-ink/50">
              This calls an on-chain LLM judgment across multiple validators — it can take
              several minutes, especially with leader rotation. This is expected.
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state.phase === 'success') {
    return (
      <div className="rounded-lg border border-copper/30 bg-copper/5 px-4 py-3 font-body text-sm text-ink/80">
        Confirmed.{' '}
        <a
          href={`${CHAIN.explorerUrl}/tx/${state.txHash}`}
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-copper"
        >
          View on explorer
        </a>
      </div>
    );
  }

  if (state.phase === 'timeout') {
    return (
      <div className="rounded-lg border border-pending/30 bg-pending/5 px-4 py-3 font-body text-sm text-ink/80">
        Consensus is taking longer than expected. Your transaction was submitted — it likely
        succeeded even though this page stopped waiting.{' '}
        <a
          href={`${CHAIN.explorerUrl}/tx/${state.txHash}`}
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-copper"
        >
          Check its status directly
        </a>
        .
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dead/30 bg-dead/5 px-4 py-3 font-body text-sm text-dead">
      {state.message}
    </div>
  );
}

// Helper for call sites: convert a caught error into the right TxState.
export function txStateFromError(err: unknown): TxState {
  if (isTimeoutError(err)) {
    return { phase: 'timeout', txHash: (err as any).txHash };
  }
  const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
  return { phase: 'error', message };
}
