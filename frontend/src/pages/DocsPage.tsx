import { CHAINS } from '../config/chains';

export function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-10 font-display text-3xl text-ink">Documentation</h1>

      <Section title="Overview">
        <p>
          MilestoneVault is an escrowed grant milestone attestation contract. A grantor locks
          GEN against a milestone tied to one of three fixed, independently-checkable criterion
          types on a GitHub repository. A recipient can attempt verification at any time; the
          contract fetches the real GitHub page itself and judges it against the locked
          criterion — never against a description either party supplies.
        </p>
      </Section>

      <Section title="How it works">
        <ol className="list-decimal space-y-2 pl-5">
          <li>A grantor calls <code>create_milestone</code>, staking GEN and locking the repo, criterion type, and target value.</li>
          <li>The recipient calls <code>submit_attempt</code> whenever they believe the criterion is met.</li>
          <li>The contract builds the real GitHub URL from the locked fields and fetches it directly.</li>
          <li>Independent validators each re-derive the judgment against the same fetched evidence before it counts as consensus.</li>
          <li>A <code>met</code> verdict releases the full stake immediately. A <code>not_met</code> verdict costs nothing but time — the recipient can attempt again.</li>
        </ol>
      </Section>

      <Section title="Architecture">
        <p>
          Single-party attestation, not a two-party dispute — there is no respondent or
          counter-stake. Consensus need here is narrower than a claimant/respondent shape: a
          single grantor or recipient each has an incentive to want the model to be sloppy in
          their own favor, and independent re-derivation across validators is what keeps a
          single lenient or strict run from deciding a real payout alone.
        </p>
      </Section>

      <Section title="Smart contract">
        <table className="w-full border-collapse font-data text-sm">
          <thead>
            <tr className="border-b border-vault/15 text-left text-ink/50">
              <th className="py-2 font-body font-normal">Method</th>
              <th className="py-2 font-body font-normal">Type</th>
              <th className="py-2 font-body font-normal">Description</th>
            </tr>
          </thead>
          <tbody className="text-ink/75">
            <tr className="border-b border-vault/8">
              <td className="py-2.5 pr-3">create_milestone</td>
              <td className="py-2.5 pr-3 text-ink/45">write, payable</td>
              <td className="py-2.5">Locks a new milestone and stakes GEN.</td>
            </tr>
            <tr className="border-b border-vault/8">
              <td className="py-2.5 pr-3">submit_attempt</td>
              <td className="py-2.5 pr-3 text-ink/45">write</td>
              <td className="py-2.5">Fetches evidence and judges it; releases stake on met.</td>
            </tr>
            <tr className="border-b border-vault/8">
              <td className="py-2.5 pr-3">get_milestone</td>
              <td className="py-2.5 pr-3 text-ink/45">view</td>
              <td className="py-2.5">Reads a single milestone's full state.</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-3">get_next_id</td>
              <td className="py-2.5 pr-3 text-ink/45">view</td>
              <td className="py-2.5">Reads the next milestone ID to be assigned.</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-6 space-y-2 font-data text-xs text-ink/60">
          <div>StudioNet: {CHAINS.studionet.contractAddress}</div>
          <div>Bradbury: {CHAINS.bradbury.contractAddress}</div>
        </div>
      </Section>

      <Section title="FAQ">
        <FaqItem q="What happens if the fetch fails?">
          A missing, dead, or non-matching fetch counts as <code>not_met</code> — never a guess
          in the recipient's favor. They can submit again once the page genuinely shows what's
          required.
        </FaqItem>
        <FaqItem q="Can a grantor reclaim a stake if the milestone is never met?">
          Not in this version. There's no deadline or reclaim path yet — a stated, deliberate
          gap, not an oversight.
        </FaqItem>
        <FaqItem q="Why only three criterion types?">
          Arbitrary free-text criteria would reintroduce an unverifiable, party-described claim
          — the exact shape this design exists to avoid.
        </FaqItem>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 font-display text-xl text-ink">{title}</h2>
      <div className="space-y-3 font-body text-sm leading-relaxed text-ink/70">{children}</div>
    </section>
  );
}

function FaqItem({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="mb-1 font-body text-sm font-medium text-ink">{q}</h3>
      <p className="font-body text-sm leading-relaxed text-ink/65">{children}</p>
    </div>
  );
}
