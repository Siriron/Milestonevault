import { CHAIN } from '../config/chains';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Confirmed working pattern, adapted from this project's established
// Sigil-derived ensureChain. Call immediately before every write, never
// on page load or any other trigger -- only the actual write action
// should ever prompt a wallet popup.
export async function ensureChain(): Promise<void> {
  const eth = window.ethereum;
  if (!eth) return;

  const walletChainConfig = {
    chainId: CHAIN.chainIdHex,
    chainName: CHAIN.chainName,
    rpcUrls: [CHAIN.rpcUrl],
    nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
    blockExplorerUrls: [CHAIN.explorerUrl],
  };

  try {
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: CHAIN.chainIdHex }],
    });
  } catch (err: any) {
    if (err && err.code === 4902) {
      await eth.request({
        method: 'wallet_addEthereumChain',
        params: [walletChainConfig],
      });
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN.chainIdHex }],
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
