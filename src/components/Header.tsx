'use client';

import Link from 'next/link';
import { useWallet } from '../context/WalletContext';
import WalletButton from './WalletButton';

export default function Header() {
  const { account } = useWallet();

  return (
    <header className="sticky top-0 z-[100] mb-10 flex flex-wrap items-center justify-between gap-3 py-4" style={{ borderBottom: '3px solid var(--nb-black)', background: 'var(--nb-bg)' }}>
      <Link href="/" className="flex items-center gap-2 no-underline">
        <span className="text-xl font-bold tracking-[-0.5px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          verifier<span style={{ color: 'var(--nb-yellow)' }}>.</span>
        </span>
      </Link>

      <nav className="flex items-center gap-1">
        <Link href="/" className="px-3.5 py-1.5 text-[13px] font-bold no-underline transition-all hover:bg-[var(--nb-yellow)] hover:translate-y-[-1px]" style={{ borderRadius: 'var(--nb-radius)' }}>
          Home
        </Link>
        <Link href="/verify" className="px-3.5 py-1.5 text-[13px] font-bold no-underline transition-all hover:bg-[var(--nb-yellow)] hover:translate-y-[-1px]" style={{ borderRadius: 'var(--nb-radius)' }}>
          Verify
        </Link>
        {account && (
          <Link href={`/profile/${account}`} className="px-3.5 py-1.5 text-[13px] font-bold no-underline transition-all hover:bg-[var(--nb-yellow)] hover:translate-y-[-1px]" style={{ borderRadius: 'var(--nb-radius)' }}>
            Profile
          </Link>
        )}
        <WalletButton />
      </nav>
    </header>
  );
}
