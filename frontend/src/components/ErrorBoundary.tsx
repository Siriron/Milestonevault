import { Component, type ReactNode } from 'react';
import { VaultDoor } from './VaultDoor';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || 'Something went wrong.' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-parchment px-6 text-center">
          <VaultDoor status="locked" size="lg" />
          <div>
            <h1 className="font-display text-2xl text-ink">The vault jammed.</h1>
            <p className="mt-2 max-w-md font-body text-ink/70">{this.state.message}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-vault px-6 py-2.5 font-body text-sm text-parchment hover:bg-vault-dark"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
