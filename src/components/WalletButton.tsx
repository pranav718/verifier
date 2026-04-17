'use client';

import { useWallet } from '../context/WalletContext';

export default function WalletButton() {
    const { account, chainId, isConnecting, error, connect, disconnect } = useWallet();

    const truncateAddress = (addr: string) =>
        addr.slice(0, 6) + '...' + addr.slice(-4);

    const isAmoy = chainId === 80002;

    if (account) {
        return (
            <div className="flex flex-wrap items-center gap-2 animate-[slide-in-right_0.5s_ease]">
                <span className={`inline-flex items-center text-[10px] px-3 py-1 rounded-full font-semibold tracking-[0.3px] uppercase transition-all duration-300 ${isAmoy ? 'bg-white/5 text-zinc-400 border border-white/10 before:content-[\'\'] before:inline-block before:w-1.5 before:h-1.5 before:rounded-full before:bg-green-500 before:mr-1.5 before:shadow-[0_0_8px_rgba(34,197,94,0.5)] before:animate-[pulse-glow_2s_ease-in-out_infinite]' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {isAmoy ? 'Amoy' : 'Wrong Network'}
                </span>
                <span className="font-mono text-[12px] text-zinc-400 bg-white/5 px-3.5 py-1.5 rounded-lg border border-white/10 transition-all duration-300 hover:border-white/20 hover:bg-[rgba(255,255,255,0.06)]">{truncateAddress(account)}</span>
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-transparent px-3.5 py-[7px] text-xs font-bold tracking-[-0.1px] text-zinc-400 backdrop-blur-sm transition-all hover:-translate-y-px hover:border-white/25 hover:bg-white/5 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.03)]" onClick={disconnect}>
                    Disconnect
                </button>
            </div>
        );
    }

    return (
    return (
        <div className="flex flex-wrap items-center gap-2 animate-[slide-in-right_0.5s_ease]">
            {error && <span className="text-xs text-red-500 animate-[fadeInUp_0.3s_ease]">{error}</span>}
            <button
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-[7px] text-xs font-bold tracking-[-0.1px] text-black shadow-[0_0_20px_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-px hover:bg-zinc-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.2),0_4px_16px_rgba(0,0,0,0.3)] disabled:opacity-35 disabled:cursor-not-allowed"
                onClick={connect}
                disabled={isConnecting}
            >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
        </div>
    );
}
