import { useState, useEffect, useCallback, useMemo, createContext, useContext, type ReactNode } from 'react';
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionStatus } from 'genlayer-js/types';
import { CHAIN, RECEIPT_CONFIG } from '../config/chains';
import { ensureChain } from '../lib/ensureChain';
import { timeoutError } from '../lib/timeoutError';

interface GenLayerContextValue {
  account: string | null;
  connecting: boolean;
  connectError: string | null;
  connect: () => Promise<void>;
  isConnected: boolean;
  readContract: (functionName: string, args?: any[]) => Promise<any>;
  writeContract: (
    functionName: string,
    args?: any[],
    value?: bigint
  ) => Promise<{ txHash: string; receipt: any }>;
}

const GenLayerContext = createContext<GenLayerContextValue | null>(null);

// Wallet connection state lives HERE, once, shared across the whole app --
// not per-component. Every page reads the same account/connecting state
// through this single provider, so connecting via the header immediately
// updates what every other page believes about wallet state. Matches this
// project's own established, live-verified pattern.
//
// This project targets StudioNet exclusively (project knowledge section 7) --
// no network parameter anywhere in this hook. A prior version of this file
// threaded a NetworkKey through every function here; that's been removed
// along with useNetwork.tsx, not left as dead plumbing with one branch.
export function GenLayerProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  useEffect(() => {
    const eth = window.ethereum;
    if (!eth) return;

    eth
      .request({ method: 'eth_accounts' })
      .then((accounts: string[]) => {
        if (accounts[0]) setAccount(accounts[0]);
      })
      .catch(() => {});

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts[0] || null);
    };

    if (eth.on) eth.on('accountsChanged', handleAccountsChanged);
    return () => {
      if (eth.removeListener) eth.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const connect = useCallback(async () => {
    const eth = window.ethereum;
    if (!eth) {
      setConnectError('No wallet found. Install a browser wallet extension to continue.');
      return;
    }
    setConnecting(true);
    setConnectError(null);
    try {
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
      if (accounts[0]) setAccount(accounts[0]);
    } catch (err: any) {
      setConnectError(err?.message || 'Connection was declined.');
    } finally {
      setConnecting(false);
    }
  }, []);

  const readClient = useMemo(() => {
    return createClient({ chain: studionet });
  }, []);

  const writeClient = useMemo(() => {
    if (!account || !window.ethereum) return null;
    // provider: window.ethereum is required -- omitting it caused a
    // confirmed live bug on Copyleft where writes filed silently
    // executed on the wrong network, since the client had no wallet
    // provider bound to force the chain.
    const client = createClient({
      chain: studionet,
      account: account as `0x${string}`,
      provider: window.ethereum,
    });
    // Defensive: not in any official SDK example, but present in this
    // project's confirmed working code. Guarded so contracts built on
    // SDK versions without it don't throw.
    if (typeof (client as any).connect === 'function') {
      (client as any).connect('studionet').catch(() => {});
    }
    return client;
  }, [account]);

  const readContract = useCallback(
    async (functionName: string, args: any[] = []) => {
      const result = await readClient.readContract({
        address: CHAIN.contractAddress as `0x${string}`,
        functionName,
        args,
      });
      // readContract returns a JSON string -- always parse it.
      if (typeof result === 'string') {
        try {
          return JSON.parse(result);
        } catch {
          return result;
        }
      }
      return result;
    },
    [readClient]
  );

  const writeContract = useCallback(
    async (functionName: string, args: any[] = [], value: bigint = BigInt(0)) => {
      if (!writeClient || !account) {
        throw new Error('Connect a wallet before sending a transaction.');
      }
      await ensureChain();

      const txHash = await writeClient.writeContract({
        address: CHAIN.contractAddress as `0x${string}`,
        functionName,
        args,
        value,
      });

      try {
        const receipt = await writeClient.waitForTransactionReceipt({
          hash: txHash,
          status: TransactionStatus.ACCEPTED,
          retries: RECEIPT_CONFIG.retries,
          interval: RECEIPT_CONFIG.interval,
        });
        return { txHash, receipt };
      } catch (err: any) {
        // Only reclassify as a timeout if the underlying error actually
        // looks like one -- a genuinely reverted/failed transaction
        // should surface as a real failure, not get told to the user as
        // "probably succeeded, check the explorer." Checking the message
        // is a real limitation (the SDK doesn't expose a typed timeout
        // error), but it's narrower and safer than treating every
        // failure the same way.
        const looksLikeTimeout = /timeout|timed out|exceeded.*retries/i.test(err?.message || '');
        if (looksLikeTimeout) {
          throw timeoutError(txHash);
        }
        throw err;
      }
    },
    [writeClient, account]
  );

  const value: GenLayerContextValue = {
    account,
    connecting,
    connectError,
    connect,
    isConnected: !!account,
    readContract,
    writeContract,
  };

  return <GenLayerContext.Provider value={value}>{children}</GenLayerContext.Provider>;
}

export function useGenLayer() {
  const ctx = useContext(GenLayerContext);
  if (!ctx) throw new Error('useGenLayer must be used within GenLayerProvider');
  return ctx;
}
