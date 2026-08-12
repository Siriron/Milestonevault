import { createContext, useContext, useState, type ReactNode } from 'react';
import { DEFAULT_NETWORK, type NetworkKey } from '../config/chains';

interface NetworkContextValue {
  network: NetworkKey;
  setNetwork: (n: NetworkKey) => void;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetwork] = useState<NetworkKey>(DEFAULT_NETWORK);
  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error('useNetwork must be used within NetworkProvider');
  return ctx;
}
