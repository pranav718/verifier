'use client';

import { useWallet } from '../context/WalletContext';

export default function WalletButton() {
    const { account, chainId, isConnecting, error, connect, disconnect } = useWallet();

    const truncateAddress = (addr: string) =>
        addr.slice(0, 6) + '...' + addr.slice(-4);

    const isAmoy = chainId === 80002;

    if (account) {
        return (
            <div className="flex flex-wrap items-center gap-2" style={{ animation: 'slideIn 0.4s ease' }}>
                <span
                    className="nb-badge"
                    style={{
                        background: isAmoy ? 'var(--nb-green)' : 'var(--nb-red)',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                    }}
                >
                    {isAmoy && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--nb-black)', display: 'inline-block' }} />}
                    {isAmoy ? 'Amoy' : 'Wrong Network'}
                </span>
                <span
                    className="nb-badge"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', background: 'var(--nb-input-bg)' }}
                >
                    {truncateAddress(account)}
                </span>
                <button
                    className="nb-btn nb-btn-outline"
                    style={{ padding: '5px 12px', fontSize: '11px', boxShadow: 'var(--nb-shadow-sm)' }}
                    onClick={disconnect}
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-2" style={{ animation: 'slideIn 0.4s ease' }}>
            {error && <span className="text-xs font-bold" style={{ color: 'var(--nb-red)' }}>{error}</span>}
            <button
                className="nb-btn nb-btn-primary"
                style={{ padding: '6px 14px', fontSize: '12px' }}
                onClick={connect}
                disabled={isConnecting}
            >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
        </div>
    );
}
