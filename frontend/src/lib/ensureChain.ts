import { CHAINS, type NetworkKey } from '../config/chains';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Confirmed working pattern, adapted from this project's established
// Sigil-derived ensureChain (also used by Copyleft and Recourse). Call
// immediately before every write, never on every network-toggle click --
// toggling should never itself trigger a wallet popup, only the actual
// write action should.
export async function ensureChain(network: NetworkKey): Promise<void> {
  const eth = window.ethereum;
  if (!eth) return;

  const cfg = CHAINS[network];
  const walletChainConfig = {
    chainId: cfg.chainIdHex,
    chainName: cfg.chainName,
    rpcUrls: [cfg.rpcUrl],
    nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
    blockExplorerUrls: [cfg.explorerUrl],
  };

  try {
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: cfg.chainIdHex }],
    });
  } catch (err: any) {
    if (err && err.code === 4902) {
      await eth.request({
        method: 'wallet_addEthereumChain',
        params: [walletChainConfig],
      });
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: cfg.chainIdHex }],
      });
    } else if (err && err.code === -32002) {
      // A wallet_switchEthereumChain request is already pending -- wait
      // rather than stack a second competing request.
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } else {
      throw err;
    }
  }
}
