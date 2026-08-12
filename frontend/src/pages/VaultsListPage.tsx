import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useGenLayer } from '../hooks/useGenLayer';
import { type Milestone } from '../lib/contract';
import { formatGen } from '../lib/format';
import { CRITERION_TYPES } from '../config/chains';
import { VaultDoor } from '../components/VaultDoor';

// The contract has no dedicated list_milestones view -- only
// get_next_id() and get_milestone(id). This page reads next_id to know
// the valid range, then fetches each record individually. Fine at this
// project's expected scale; would need the narrow-index-TreeMap pattern
// (project knowledge \u00a74) if record counts grew large.
export function VaultsListPage() {
  const { readContract } = useGenLayer();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { next_id } = await readContract('get_next_id');
      const ids = Array.from({ length: Math.max(0, next_id - 1) }, (_, i) => i + 1);
      const results = await Promise.all(
        ids.map((id) =>
          readContract('get_milestone', [id]).catch(() => null)
        )
      );
      setMilestones(results.filter((m): m is Milestone => m !== null));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load vaults.');
    } finally {
      setLoading(false);
    }
  }, [readContract]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">All vaults</h1>
          <p className="mt-1 font-body text-sm text-ink/60">Every milestone locked on this network, in order.</p>
        </div>
        <Link
          to="/new"
          className="rounded-full bg-vault px-5 py-2.5 font-body text-sm text-parchment hover:bg-vault-dark"
        >
          Lock a milestone
        </Link>
      </div>

      {loading && (
        <div className="py-16 text-center">
          <VaultDoor status="pending" size="lg" />
          <p className="mt-6 font-body text-sm text-ink/50">Reading the vault registry…</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-dead/25 bg-dead/5 px-4 py-3 font-body text-sm text-dead">
          {error}
        </div>
      )}

      {!loading && !error && milestones.length === 0 && (
        <div className="rounded-2xl border border-dashed border-vault/20 py-16 text-center">
          <VaultDoor status="locked" size="lg" />
          <p className="mt-6 font-body text-sm text-ink/50">No vaults yet. Be the first to lock one.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {milestones.map((m) => {
          const criterionMeta = CRITERION_TYPES.find((c) => c.value === m.criterion_type);
          return (
            <Link
              key={m.milestone_id}
              to={`/vaults/${m.milestone_id}`}
              className="group rounded-xl border border-vault/10 bg-white/40 p-5 transition-colors hover:border-copper/40 hover:bg-white/70"
            >
              <div className="mb-3 flex items-center justify-between">
                <VaultDoor status={m.status === 'released' ? 'released' : 'locked'} size="sm" />
                <span
                  className={`rounded-full px-2.5 py-0.5 font-body text-xs ${
                    m.status === 'released' ? 'bg-copper/15 text-copper' : 'bg-pending/15 text-pending'
                  }`}
                >
                  {m.status === 'released' ? 'Released' : 'Locked'}
                </span>
              </div>
              <h3 className="font-display text-base text-ink group-hover:text-copper">
                {m.repo_owner}/{m.repo_name}
              </h3>
              <p className="mt-1 font-body text-xs text-ink/55">
                {criterionMeta?.label} · {formatGen(m.stake_amount)}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
