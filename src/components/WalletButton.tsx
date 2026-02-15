'use client';

import { useWallet } from '../context/WalletContext';

export default function WalletButton() {
    const { account, chainId, isConnecting, error, connect, disconnect } = useWallet();

    const truncateAddress = (addr: string) =>
        addr.slice(0, 6) + '...' + addr.slice(-4);

    const isAmoy = chainId === 80002;

    if (account) {
        return (
            <div className="wallet-info">
                <span className={`network-badge ${isAmoy ? 'correct' : 'wrong'}`}>
                    {isAmoy ? 'Amoy' : 'Wrong Network'}
                </span>
                <span className="wallet-address">{truncateAddress(account)}</span>
                <button className="btn ghost small" onClick={disconnect}>
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <div className="wallet-info">
            {error && <span className="wallet-error">{error}</span>}
            <button
                className="btn primary small"
                onClick={connect}
                disabled={isConnecting}
            >
                {isConnecting ? 'Connecting...' : '🦊 Connect Wallet'}
            </button>
        </div>
    );
}
