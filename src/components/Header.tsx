'use client';

import Link from 'next/link';
import WalletButton from './WalletButton';

export default function Header() {
  return (
    <header className="header">
      <Link href="/" className="brand">
        <span className="brand-name">verifier</span>
      </Link>

      <nav className="header-nav">
        <Link href="/" className="nav-link">Home</Link>
        <Link href="/verify" className="nav-link">Verify</Link>
        <WalletButton />
      </nav>
    </header>
  );
}
