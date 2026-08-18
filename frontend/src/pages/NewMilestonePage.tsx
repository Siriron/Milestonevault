import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenLayer } from '../hooks/useGenLayer';
import { CRITERION_TYPES, MIN_DEADLINE_DAYS, MAX_DEADLINE_DAYS, type CriterionType } from '../config/chains';
import { buildCreateMilestoneArgs } from '../lib/contract';
import { TxStatus, txStateFromError, type TxState } from '../components/TxStatus';
import { VaultDoor } from '../components/VaultDoor';

// Client-side mirrors of the contract's own _validate_target_for_criterion
// -- format-checking here so a submission that would revert on-chain is
// visibly wrong before a wallet round trip, not just after one. The
// contract's check is the real, authoritative one; this is a UX
// convenience layered on top, never a substitute for it.
function isValidTargetForCriterion(criterionType: CriterionType, targetValue: string): boolean {
  const v = targetValue.trim();
  if (v.length === 0) return false;
  if (criterionType === 'star_count') return /^\d+$/.test(v);
  if (criterionType === 'pr_merged') return /^#?\d+$/.test(v);
  if (criterionType === 'release_tag') return !/\s/.test(v) && !/[~^:?*[\\]/.test(v);
  return false;
}

export function NewMilestonePage() {
  const { isConnected, connect, writeContract } = useGenLayer();
  const navigate = useNavigate();

  const [recipient, setRecipient] = useState('');
  const [repoOwner, setRepoOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [criterionType, setCriterionType] = useState<CriterionType>('star_count');
  const [targetValue, setTargetValue] = useState('');
  const [description, setDescription] = useState('');
  const [stake, setStake] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('30');
  const [txState, setTxState] = useState<TxState>({ phase: 'idle' });

  const selectedCriterion = CRITERION_TYPES.find((c) => c.value === criterionType)!;
  const targetIsValid = targetValue.trim().length === 0 || isValidTargetForCriterion(criterionType, targetValue);
  const deadlineDaysNum = Number(deadlineDays);
  const deadlineIsValid =
    Number.isInteger(deadlineDaysNum) && deadlineDaysNum >= MIN_DEADLINE_DAYS && deadlineDaysNum <= MAX_DEADLINE_DAYS;

  const canSubmit =
    isConnected &&
    recipient.trim().length > 0 &&
    repoOwner.trim().length > 0 &&
    repoName.trim().length > 0 &&
    targetValue.trim().length > 0 &&
    isValidTargetForCriterion(criterionType, targetValue) &&
    stake.trim().length > 0 &&
    Number(stake) > 0 &&
    deadlineIsValid &&
    txState.phase !== 'pending';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setTxState({ phase: 'pending', functionName: 'create_milestone' });
    try {
      const args = buildCreateMilestoneArgs({
        recipient: recipient.trim(),
        repoOwner: repoOwner.trim(),
        repoName: repoName.trim(),
        criterionType,
        targetValue: targetValue.trim(),
        description: description.trim(),
        stakeValue: BigInt(stake),
        deadlineDays: deadlineDaysNum,
      });
      // create_milestone is fully deterministic (no LLM judgment), but
      // still needs value: BigInt(0) semantics from the SDK -- here we
      // pass the real stake as value since this is a payable write.
      const { txHash } = await writeContract('create_milestone', args, BigInt(stake));
      setTxState({ phase: 'success', txHash });
      setTimeout(() => navigate('/vaults'), 1800);
    } catch (err) {
      setTxState(txStateFromError(err));
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <div className="mb-10 flex items-center gap-4">
        <VaultDoor status="locked" size="sm" />
        <div>
          <h1 className="font-display text-2xl text-ink">Lock a milestone</h1>
          <p className="font-body text-sm text-ink/60">Staked on StudioNet</p>
        </div>
      </div>

      {!isConnected && (
        <button
          onClick={connect}
          className="mb-8 w-full rounded-full bg-vault px-6 py-3 font-body text-sm text-parchment hover:bg-vault-dark"
        >
          Connect wallet to continue
        </button>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Field label="Recipient address">
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x…"
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Repo owner">
            <input
              type="text"
              value={repoOwner}
              onChange={(e) => setRepoOwner(e.target.value)}
              placeholder="e.g. genlayerlabs"
              className="input"
            />
          </Field>
          <Field label="Repo name">
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="e.g. genlayer-simulator"
              className="input"
            />
          </Field>
        </div>

        <Field label="Criterion">
          <div className="grid grid-cols-3 gap-2">
            {CRITERION_TYPES.map((c) => (
              <button
                type="button"
                key={c.value}
                onClick={() => {
                  setCriterionType(c.value);
                  setTargetValue('');
                }}
                className={`rounded-lg border px-3 py-2.5 font-body text-sm transition-colors ${
                  criterionType === c.value
                    ? 'border-copper bg-copper/10 text-ink'
                    : 'border-vault/15 text-ink/60 hover:border-vault/30'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label={selectedCriterion.targetLabel}>
          <input
            type="text"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder={selectedCriterion.targetPlaceholder}
            className={`input ${!targetIsValid ? 'border-dead/50' : ''}`}
          />
          {!targetIsValid && (
            <p className="mt-1 font-body text-xs text-dead">
              Doesn't match the format {selectedCriterion.label} needs — the contract will reject this.
            </p>
          )}
        </Field>

        <Field label="Description (optional)">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What this milestone is for, for anyone reading the vault later."
            className="input resize-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Stake (GEN)">
            <input
              type="number"
              min="0"
              step="any"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="e.g. 50"
              className="input"
            />
          </Field>
          <Field label="Reclaimable after (days)">
            <input
              type="number"
              min={MIN_DEADLINE_DAYS}
              max={MAX_DEADLINE_DAYS}
              step="1"
              value={deadlineDays}
              onChange={(e) => setDeadlineDays(e.target.value)}
              className={`input ${!deadlineIsValid ? 'border-dead/50' : ''}`}
            />
          </Field>
        </div>
        <p className="-mt-3 font-body text-xs text-ink/45">
          If the criterion still isn't met after this many days, only you (the grantor) can reclaim the
          full stake back. The recipient can keep attempting right up until then. This can't be changed
          once the vault is sealed.
        </p>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-full bg-vault px-6 py-3.5 font-body text-sm text-parchment transition-colors hover:bg-vault-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {txState.phase === 'pending' ? 'Sealing the vault…' : 'Seal vault and stake'}
        </button>

        <TxStatus state={txState} />
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-body text-xs uppercase tracking-wide text-ink/50">{label}</span>
      {children}
    </label>
  );
}
