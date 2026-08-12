import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { VaultDoor } from '../components/VaultDoor';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export function LandingPage() {
  return (
    <div>
      {/* Hero -- thesis statement: a vault that only opens on genuinely
          checkable evidence, not a claim */}
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 pb-20 pt-20 text-center sm:pt-28">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <VaultDoor status="locked" size="lg" />
        </motion.div>
        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          className="max-w-3xl font-display text-4xl font-medium leading-tight text-ink sm:text-6xl"
        >
          A vault that opens<br className="hidden sm:block" /> only when the evidence does.
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ delay: 0.2 }}
          className="max-w-xl font-body text-lg text-ink/70"
        >
          Lock GEN against a GitHub-verifiable milestone — a star count, a merged PR, a
          published release. The vault fetches the real page itself and releases funds only
          when it genuinely matches. No one's word is taken for it, including yours.
        </motion.p>
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/new"
            className="rounded-full bg-vault px-7 py-3.5 font-body text-sm text-parchment shadow-sm transition-transform hover:scale-[1.02] hover:bg-vault-dark"
          >
            Lock a milestone
          </Link>
          <Link
            to="/vaults"
            className="rounded-full border border-vault/20 px-7 py-3.5 font-body text-sm text-ink transition-colors hover:bg-vault/5"
          >
            Browse vaults
          </Link>
        </motion.div>
      </section>

      {/* What it checks */}
      <section className="border-t border-vault/10 bg-white/40 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-12 text-center font-display text-2xl text-ink sm:text-3xl">
            Three things it can check
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                title: 'Star count',
                body: 'The vault fetches the repo page itself and reads the real, current star count off it.',
              },
              {
                title: 'PR merged',
                body: 'The vault fetches that exact pull request and confirms it genuinely shows a merged state.',
              },
              {
                title: 'Release tag',
                body: 'The vault fetches the release page and confirms that exact tag is genuinely published.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-vault/10 bg-parchment p-6">
                <h3 className="mb-2 font-display text-lg text-ink">{item.title}</h3>
                <p className="font-body text-sm leading-relaxed text-ink/65">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works -- the real lifecycle, matching the deployed contract */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-12 text-center font-display text-2xl text-ink sm:text-3xl">
            How it works
          </h2>
          <ol className="space-y-8">
            {[
              {
                n: '1',
                title: 'A grantor locks GEN against a criterion',
                body: 'The repo, the criterion type, and the target value are all written to the vault at creation — none of it can be reshaped later.',
              },
              {
                n: '2',
                title: 'The recipient submits an attempt, any time',
                body: 'No description of their own progress is asked for or trusted. The recipient just signals: check it now.',
              },
              {
                n: '3',
                title: 'The vault fetches the real GitHub page itself',
                body: 'Independent validators each re-derive the same judgment against the same fetched evidence before it counts as consensus.',
              },
              {
                n: '4',
                title: 'It releases, or it stays sealed',
                body: 'Met releases the full stake immediately. Not met costs nothing but time — the recipient can attempt again once it\u2019s actually true.',
              },
            ].map((step) => (
              <li key={step.n} className="flex gap-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vault font-display text-sm text-parchment">
                  {step.n}
                </span>
                <div>
                  <h3 className="font-display text-lg text-ink">{step.title}</h3>
                  <p className="mt-1 font-body text-sm leading-relaxed text-ink/65">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Honest status -- what to expect before it's live-tested */}
      <section className="border-t border-vault/10 bg-white/40 py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-3 font-display text-xl text-ink">One-party attestation, deliberately</h2>
          <p className="font-body text-sm leading-relaxed text-ink/65">
            There's no counter-party disputing a verdict here — a grantor and a recipient each
            have reason to want the model to be sloppy in their own favor, and independent
            validator re-derivation is what keeps a single run from deciding a real payout
            alone. That's a narrower justification than a two-party dispute, and it's stated
            plainly rather than dressed up as one.
          </p>
        </div>
      </section>
    </div>
  );
}
