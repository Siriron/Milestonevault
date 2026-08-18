import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGenLayer } from '../hooks/useGenLayer';
import { buildSubmitAttemptArgs, buildReclaimStakeArgs, buildGetMilestoneArgs, type Milestone } from '../lib/contract';
import { formatGen, formatAddress, formatAttempts, formatDeadline, isPastDeadline } from '../lib/format';
import { CRITERION_TYPES } from '../config/chains';
import { TxStatus, txStateFromError, type TxState } from '../components/TxStatus';
import { VaultDoor } from '../components/VaultDoor';

export function VaultDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isConnected, connect, account, readContract, writeContract } = useGenLayer();

  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [txState, setTxState] = useState<TxState>({ phase: 'idle' });

  const milestoneId = Number(id);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await readContract('get_milestone', buildGetMilestoneArgs(milestoneId));
      setMilestone(result as Milestone);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load this vault.');
    } finally {
      setLoading(false);
    }
  }, [readContract, milestoneId]);

  useEffect(() => {
    if (Number.isFinite(milestoneId)) load();
  }, [load, milestoneId]);

  async function handleSubmitAttempt() {
    setTxState({ phase: 'pending', functionName: 'submit_attempt' });
    try {
      const { txHash } = await writeContract(
        'submit_attempt',
        buildSubmitAttemptArgs(milestoneId),
        BigInt(0)
      );
      setTxState({ phase: 'success', txHash });
      await load();
    } catch (err) {
      setTxState(txStateFromError(err));
    }
  }

  async function handleReclaim() {
    setTxState({ phase: 'pending', functionName: 'reclaim_stake' });
    try {
      const { txHash } = await writeContract(
        'reclaim_stake',
        buildReclaimStakeArgs(milestoneId),
        BigInt(0)
      );
      setTxState({ phase: 'success', txHash });
      await load();
    } catch (err) {
      setTxState(txStateFromError(err));
    }
  }

  if (!Number.isFinite(milestoneId)) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="font-body text-ink/60">That's not a valid vault ID.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <VaultDoor status="pending" size="lg" />
        <p className="mt-6 font-body text-sm text-ink/50">Opening the record…</p>
      </div>
    );
  }

  if (loadError || !milestone) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <VaultDoor status="locked" size="lg" />
        <h1 className="mt-6 font-display text-xl text-ink">Vault #{milestoneId} not found</h1>
        <p className="mt-2 font-body text-sm text-ink/60">{loadError || 'No record exists at this ID yet.'}</p>
        <Link to="/vaults" className="mt-6 inline-block font-body text-sm text-copper underline">
          Back to all vaults
        </Link>
      </div>
    );
  }

  const criterionMeta = CRITERION_TYPES.find((c) => c.value === milestone.criterion_type);
  const isRecipient = account && account.toLowerCase() === milestone.recipient.toLowerCase();
  const isGrantor = account && account.toLowerCase() === milestone.grantor.toLowerCase();
  const deadlinePassed = isPastDeadline(milestone.deadline_ts);
  const doorStatus =
    milestone.status === 'released'
      ? 'released'
      : milestone.status === 'reclaimed'
        ? 'reclaimed'
        : txState.phase === 'pending'
          ? 'pending'
          : 'locked';

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10 flex items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <VaultDoor status={doorStatus} size="lg" />
          <div>
            <h1 className="font-display text-2xl text-ink">Vault #{milestone.milestone_id}</h1>
            <p className="font-body text-sm text-ink/60">
              {milestone.repo_owner}/{milestone.repo_name}
            </p>
          </div>
        </div>
        <StatusBadge status={milestone.status} />
      </div>

      {milestone.description && (
        <p className="mb-8 rounded-lg border border-vault/10 bg-white/40 p-4 font-body text-sm leading-relaxed text-ink/75">
          {milestone.description}
        </p>
      )}

      <dl className="mb-10 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-vault/10 py-6">
        <Detail label="Criterion" value={criterionMeta?.label || milestone.criterion_type} />
        <Detail label={criterionMeta?.targetLabel || 'Target'} value={milestone.target_value} mono />
        <Detail label="Stake" value={formatGen(milestone.stake_amount)} />
        <Detail label="Attempts so far" value={formatAttempts(milestone.attempt_count)} />
        <Detail label="Grantor" value={formatAddress(milestone.grantor)} mono />
        <Detail label="Recipient" value={formatAddress(milestone.recipient)} mono />
        <Detail
          label={milestone.status === 'locked' ? (deadlinePassed ? 'Deadline (passed)' : 'Reclaimable after') : 'Deadline was'}
          value={formatDeadline(milestone.deadline_ts)}
        />
      </dl>

      {milestone.last_verdict && (
        <div className="mb-10">
          <h2 className="mb-2 font-body text-xs uppercase tracking-wide text-ink/50">Last attempt's reasoning</h2>
          <p
            className={`rounded-lg border p-4 font-body text-sm leading-relaxed ${
              milestone.last_verdict === 'met'
                ? 'border-copper/30 bg-copper/5 text-ink/80'
                : 'border-dead/25 bg-dead/5 text-ink/75'
            }`}
          >
            <span className="font-medium">
              {milestone.last_verdict === 'met' ? 'Met — ' : 'Not met — '}
            </span>
            {milestone.last_reasoning}
          </p>
        </div>
      )}

      {milestone.status === 'locked' && !deadlinePassed && (
        <div className="space-y-4">
          {!isConnected ? (
            <button
              onClick={connect}
              className="w-full rounded-full bg-vault px-6 py-3.5 font-body text-sm text-parchment hover:bg-vault-dark"
            >
              Connect wallet to submit an attempt
            </button>
          ) : (
            <button
              onClick={handleSubmitAttempt}
              disabled={txState.phase === 'pending'}
              className="w-full rounded-full bg-vault px-6 py-3.5 font-body text-sm text-parchment transition-colors hover:bg-vault-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {txState.phase === 'pending' ? 'Checking the vault…' : 'Submit attempt'}
            </button>
          )}
          {isConnected && !isRecipient && (
            <p className="text-center font-body text-xs text-ink/45">
              Only the recipient's wallet can submit an attempt. Anyone can watch this vault, though.
            </p>
          )}
          <TxStatus state={txState} />
        </div>
      )}

      {milestone.status === 'locked' && deadlinePassed && (
        <div className="space-y-4">
          <div className="rounded-lg border border-pending/30 bg-pending/5 px-4 py-3 text-center font-body text-sm text-ink/75">
            The deadline has passed with the criterion still unmet. Attempts are closed — the grantor
            can now reclaim the full stake.
          </div>
          {!isConnected ? (
            <button
              onClick={connect}
              className="w-full rounded-full bg-vault px-6 py-3.5 font-body text-sm text-parchment hover:bg-vault-dark"
            >
              Connect wallet
            </button>
          ) : isGrantor ? (
            <button
              onClick={handleReclaim}
              disabled={txState.phase === 'pending'}
              className="w-full rounded-full bg-vault px-6 py-3.5 font-body text-sm text-parchment transition-colors hover:bg-vault-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {txState.phase === 'pending' ? 'Reclaiming…' : 'Reclaim stake'}
            </button>
          ) : (
            <p className="text-center font-body text-xs text-ink/45">
              Only the grantor's wallet can reclaim the stake. Anyone can watch this vault, though.
            </p>
          )}
          <TxStatus state={txState} />
        </div>
      )}

      {milestone.status === 'released' && (
        <div className="rounded-lg border border-copper/30 bg-copper/5 px-4 py-3 text-center font-body text-sm text-ink/80">
          Released. The full stake has already moved to the recipient.
        </div>
      )}

      {milestone.status === 'reclaimed' && (
        <div className="rounded-lg border border-vault/20 bg-white/40 px-4 py-3 text-center font-body text-sm text-ink/70">
          Reclaimed. The deadline passed with the criterion unmet, and the full stake has moved back
          to the grantor.
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: 'locked' | 'released' | 'reclaimed' }) {
  const label = status === 'released' ? 'Released' : status === 'reclaimed' ? 'Reclaimed' : 'Locked';
  const cls =
    status === 'released'
      ? 'bg-copper/15 text-copper'
      : status === 'reclaimed'
        ? 'bg-vault/10 text-ink/60'
        : 'bg-pending/15 text-pending';
  return <span className={`shrink-0 rounded-full px-3 py-1 font-body text-xs ${cls}`}>{label}</span>;
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="mb-0.5 font-body text-xs uppercase tracking-wide text-ink/45">{label}</dt>
      <dd className={`text-sm text-ink ${mono ? 'font-data' : 'font-body'}`}>{value}</dd>
    </div>
  );
}
