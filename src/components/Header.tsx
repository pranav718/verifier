'use client';

import Link from 'next/link';
import WalletButton from './WalletButton';

export default function Header() {
  return (
    <header className="header">
      <div className="logo">
        <img src="/logo-placeholder.png" alt="Logo" width={48} height={48} />
      </div>

      <div className="title-block">
        <div className="univ">Manipal University Jaipur</div>
        <div className="dept">Dept. of Computer Science &amp; Engineering</div>
      </div>

      <nav className="header-nav">
        <Link href="/" className="nav-link">Home</Link>
        <Link href="/verify" className="nav-link">Verify</Link>
        <WalletButton />
      </nav>
    </header>
  );
}
