'use client';

import Link from 'next/link';
import { useWallet } from '../context/WalletContext';
import WalletButton from './WalletButton';

export default function Header() {
  const { account } = useWallet();

  return (
    <header className="sticky top-0 z-[100] mb-6 flex flex-wrap items-center justify-between gap-4 py-6 px-2 backdrop-blur-sm" style={{ borderBottom: '3px solid var(--nb-black)', background: 'rgba(255, 253, 247, 0.95)' }}>
      <Link href="/" className="flex items-center gap-2 no-underline">
        <span className="text-2xl font-bold tracking-[-0.8px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          verifier<span style={{ color: 'var(--nb-yellow)' }}>.</span>
        </span>
      </Link>

      <nav className="flex items-center gap-2 sm:gap-3">
        <Link href="/" className="px-4 py-2 text-sm font-bold no-underline transition-all hover:bg-[var(--nb-yellow)] hover:translate-y-[-1px]" style={{ borderRadius: 'var(--nb-radius)' }}>
          Home
        </Link>
        <Link href="/verify" className="px-4 py-2 text-sm font-bold no-underline transition-all hover:bg-[var(--nb-yellow)] hover:translate-y-[-1px]" style={{ borderRadius: 'var(--nb-radius)' }}>
          Verify
        </Link>
        {account && (
          <Link href={`/profile/${account}`} className="px-4 py-2 text-sm font-bold no-underline transition-all hover:bg-[var(--nb-yellow)] hover:translate-y-[-1px]" style={{ borderRadius: 'var(--nb-radius)' }}>
            Profile
          </Link>
        )}
        <WalletButton />
      </nav>
    </header>
  );
}
