export function formatGen(rawUnits: number): string {
  // Contract stores raw GEN units (u256) -- create_milestone passes
  // gl.message.value straight through with no decimal scaling. Displaying
  // as-is, no wei/decimal conversion assumed. This carries forward an
  // explicitly-flagged, not-fully-confirmed assumption from this
  // project's own established pattern (Recourse's formatGen): GenLayer
  // testnet stake values have been passed and displayed as whole "GEN"
  // units directly in Studio's UI in this project's own test plans, not
  // as wei. If a future live test shows otherwise, both this function
  // and the stake input's BigInt() conversion in NewMilestonePage need
  // to change together, consistently.
  return `${rawUnits.toLocaleString()} GEN`;
}

export function formatAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function formatAttempts(count: number): string {
  return count === 1 ? '1 attempt' : `${count} attempts`;
}

export function formatDeadline(deadlineTsSeconds: number): string {
  // deadline_ts is Unix epoch seconds, contract-derived from
  // gl.message_raw["datetime"] at creation via _now_epoch_seconds() --
  // never client-set, so this is safe to trust for display. JS Date
  // wants milliseconds.
  if (!deadlineTsSeconds || deadlineTsSeconds <= 0) return 'unknown';
  const d = new Date(deadlineTsSeconds * 1000);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function isPastDeadline(deadlineTsSeconds: number, nowMs: number = Date.now()): boolean {
  // Client-side convenience check ONLY, for gating which button renders --
  // the contract re-checks now_ts >= deadline_ts against its own on-chain
  // clock independently at call time via _now_epoch_seconds(), so a
  // clock-skewed or spoofed client value here can at most show the wrong
  // button state, never bypass the real deadline enforced on-chain.
  if (!deadlineTsSeconds || deadlineTsSeconds <= 0) return false;
  return nowMs >= deadlineTsSeconds * 1000;
}
