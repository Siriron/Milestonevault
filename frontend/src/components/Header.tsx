import { Link, NavLink } from 'react-router-dom';
import { useGenLayer } from '../hooks/useGenLayer';
import { useNetwork } from '../hooks/useNetwork';
import { formatAddress } from '../lib/format';
import { VaultDoor } from './VaultDoor';

export function Header() {
  const { account, connect, connecting, isConnected } = useGenLayer();
  const { network, setNetwork } = useNetwork();

  return (
    <header className="sticky top-0 z-40 border-b border-vault/10 bg-parchment/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3 group">
          <VaultDoor status="locked" size="sm" />
          <span className="font-display text-lg font-medium tracking-tight text-ink">
            MilestoneVault
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink
            to="/vaults"
            className={({ isActive }) =>
              `font-body text-sm transition-colors ${isActive ? 'text-copper' : 'text-ink/70 hover:text-ink'}`
            }
          >
            Vaults
          </NavLink>
          <NavLink
            to="/new"
            className={({ isActive }) =>
              `font-body text-sm transition-colors ${isActive ? 'text-copper' : 'text-ink/70 hover:text-ink'}`
            }
          >
            Lock a milestone
          </NavLink>
          <NavLink
            to="/docs"
            className={({ isActive }) =>
              `font-body text-sm transition-colors ${isActive ? 'text-copper' : 'text-ink/70 hover:text-ink'}`
            }
          >
            Docs
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {/* Network toggle is UI state only -- the wallet chain switch
              happens at write time via ensureChain, never on this click,
              so toggling never itself triggers a wallet popup. */}
          <div className="hidden items-center rounded-full border border-vault/15 bg-white/40 p-0.5 text-xs sm:flex">
            <button
              onClick={() => setNetwork('studionet')}
              className={`rounded-full px-3 py-1.5 font-body transition-colors ${
                network === 'studionet' ? 'bg-vault text-parchment' : 'text-ink/60 hover:text-ink'
              }`}
            >
              StudioNet
            </button>
            <button
              onClick={() => setNetwork('bradbury')}
              className={`rounded-full px-3 py-1.5 font-body transition-colors ${
                network === 'bradbury' ? 'bg-vault text-parchment' : 'text-ink/60 hover:text-ink'
              }`}
            >
              Bradbury
            </button>
          </div>

          <button
            onClick={connect}
            disabled={connecting || isConnected}
            className="rounded-full bg-vault px-4 py-2 font-body text-sm text-parchment transition-colors hover:bg-vault-dark disabled:cursor-default disabled:opacity-90"
          >
            {isConnected && account
              ? formatAddress(account)
              : connecting
                ? 'Connecting…'
                : 'Connect wallet'}
          </button>
        </div>
      </div>
    </header>
  );
}
