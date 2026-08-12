import { Link } from 'react-router-dom';
import { VaultDoor } from '../components/VaultDoor';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-6 px-6 text-center">
      <VaultDoor status="locked" size="lg" />
      <div>
        <h1 className="font-display text-2xl text-ink">Nothing behind this door.</h1>
        <p className="mt-2 font-body text-sm text-ink/60">The page you're looking for doesn't exist.</p>
      </div>
      <Link to="/" className="rounded-full bg-vault px-6 py-2.5 font-body text-sm text-parchment hover:bg-vault-dark">
        Back to the vault
      </Link>
    </div>
  );
}
