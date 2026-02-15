'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface WalletState {
    account: string | null;
    chainId: number | null;
    isConnecting: boolean;
    error: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
}

const WalletContext = createContext<WalletState>({
    account: null,
    chainId: null,
    isConnecting: false,
    error: null,
    connect: async () => { },
    disconnect: () => { },
});

export const useWallet = () => useContext(WalletContext);

// Polygon Amoy chain config
const AMOY_CHAIN_ID = 80002;
const AMOY_CHAIN_CONFIG = {
    chainId: '0x' + AMOY_CHAIN_ID.toString(16),
    chainName: 'Polygon Amoy Testnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://rpc-amoy.polygon.technology'],
    blockExplorerUrls: ['https://amoy.polygonscan.com'],
};

export function WalletProvider({ children }: { children: ReactNode }) {
    const [account, setAccount] = useState<string | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-reconnect on page load if previously connected
    useEffect(() => {
        if (typeof window === 'undefined' || !window.ethereum) return;

        window.ethereum
            .request({ method: 'eth_accounts' })
            .then((accounts: string[]) => {
                if (accounts.length > 0) setAccount(accounts[0]);
            })
            .catch(() => { });

        window.ethereum
            .request({ method: 'eth_chainId' })
            .then((id: string) => setChainId(parseInt(id, 16)))
            .catch(() => { });

        // Listen for account/network changes
        const handleAccountsChanged = (accounts: string[]) => {
            setAccount(accounts.length > 0 ? accounts[0] : null);
        };
        const handleChainChanged = (id: string) => {
            setChainId(parseInt(id, 16));
        };

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        return () => {
            window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum?.removeListener('chainChanged', handleChainChanged);
        };
    }, []);

    const connect = useCallback(async () => {
        if (!window.ethereum) {
            setError('MetaMask not installed. Please install MetaMask to continue.');
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            // Request accounts
            const accounts: string[] = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });
            setAccount(accounts[0]);

            // Try to switch to Amoy
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: AMOY_CHAIN_CONFIG.chainId }],
                });
            } catch (switchErr: unknown) {
                // If chain not added, add it
                if (switchErr && typeof switchErr === 'object' && 'code' in switchErr && (switchErr as { code: number }).code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [AMOY_CHAIN_CONFIG],
                    });
                }
            }

            const currentChainId: string = await window.ethereum.request({ method: 'eth_chainId' });
            setChainId(parseInt(currentChainId, 16));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to connect wallet';
            setError(message);
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const disconnect = useCallback(() => {
        setAccount(null);
        setChainId(null);
        setError(null);
    }, []);

    return (
        <WalletContext.Provider value={{ account, chainId, isConnecting, error, connect, disconnect }}>
            {children}
        </WalletContext.Provider>
    );
}
