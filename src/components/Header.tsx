'use client';

import Link from 'next/link';
import { useWallet } from '../context/WalletContext';
import WalletButton from './WalletButton';

export default function Header() {
  const { account } = useWallet();

  return (
    <header className="sticky top-0 z-[100] mb-10 flex flex-wrap items-center justify-between gap-2.5 border-b border-white/5 bg-black/60 py-4 backdrop-blur-[20px]">
      <Link href="/" className="flex items-center gap-2 no-underline">
        <span className="animate-[shimmer_4s_ease-in-out_infinite] bg-[linear-gradient(135deg,#ffffff_0%,#a1a1aa_50%,#ffffff_100%)] bg-[length:200%_auto] bg-clip-text text-[19px] font-black tracking-[-0.5px] text-transparent">verifier</span>
      </Link>

      <nav className="flex items-center gap-1">
        <Link href="/" className="relative rounded-lg px-3.5 py-1.5 text-[13px] font-medium text-zinc-500 no-underline transition-all duration-300 hover:text-white after:absolute after:bottom-0 after:left-1/2 after:h-[1px] after:w-0 after:-translate-x-1/2 after:bg-[linear-gradient(90deg,transparent,#fff,transparent)] after:transition-all after:duration-300 hover:after:w-[60%]">Home</Link>
        <Link href="/verify" className="relative rounded-lg px-3.5 py-1.5 text-[13px] font-medium text-zinc-500 no-underline transition-all duration-300 hover:text-white after:absolute after:bottom-0 after:left-1/2 after:h-[1px] after:w-0 after:-translate-x-1/2 after:bg-[linear-gradient(90deg,transparent,#fff,transparent)] after:transition-all after:duration-300 hover:after:w-[60%]">Verify</Link>
        {account && (
          <Link href={`/profile/${account}`} className="relative rounded-lg px-3.5 py-1.5 text-[13px] font-medium text-zinc-500 no-underline transition-all duration-300 hover:text-white after:absolute after:bottom-0 after:left-1/2 after:h-[1px] after:w-0 after:-translate-x-1/2 after:bg-[linear-gradient(90deg,transparent,#fff,transparent)] after:transition-all after:duration-300 hover:after:w-[60%]">Profile</Link>
        )}
        <WalletButton />
      </nav>
    </header>
  );
}
