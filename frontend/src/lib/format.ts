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
