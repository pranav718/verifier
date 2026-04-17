'use client';

import { useState } from 'react';
import Header from '../components/Header';
import MentorPanel from '../components/MentorPanel';
import VerificationForm from '../components/VerificationForm';

type Tab = 'student' | 'mentor';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('student');

  return (
    <main className="w-full max-w-[860px] mx-auto">
      <div className="absolute inset-0 z-[-2] min-h-[100vh] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <Header />

      {/* ── Hero Section ── */}
      <section className="relative mb-9 py-10 pb-10 border-b border-white/5 animate-[fadeInUp_0.8s_ease] before:absolute before:right-0 before:top-5 before:h-[200px] before:w-[200px] before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.04)_0%,transparent_70%)] before:pointer-events-none before:animate-[float_8s_ease-in-out_infinite] after:absolute after:-left-7 after:bottom-2.5 after:h-[120px] after:w-[120px] after:rounded-full after:bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)] after:pointer-events-none after:animate-[float_6s_ease-in-out_infinite_1s]">
        <h1 className="mb-4 font-outfit text-4xl font-black leading-tight tracking-[-2px] text-transparent bg-clip-text bg-[linear-gradient(135deg,#ffffff_0%,#d4d4d8_25%,#ffffff_50%,#a1a1aa_75%,#ffffff_100%)] bg-[length:300%_auto] animate-[gradient-shift_6s_ease_infinite] sm:text-[44px]">Blockchain&#8209;Based<br />Work Verification</h1>
        <p className="max-w-[600px] text-[15px] leading-[1.7] text-zinc-500 animate-[fadeInUp_0.8s_ease_0.2s_both]">
          Students upload proof files to IPFS and submit CIDs to the smart contract.
          Mentors approve on&#8209;chain. Recruiters verify everything trustlessly.
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5 animate-[fadeInUp_0.8s_ease_0.4s_both]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-zinc-400 backdrop-blur-md transition-all duration-300 hover:-translate-y-px hover:border-white/20 hover:bg-[rgba(255,255,255,0.06)] hover:text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[linear-gradient(135deg,#fff,#71717a)] animate-[pulse-glow_3s_ease-in-out_infinite]" />
            Polygon Amoy
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-zinc-400 backdrop-blur-md transition-all duration-300 hover:-translate-y-px hover:border-white/20 hover:bg-[rgba(255,255,255,0.06)] hover:text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[linear-gradient(135deg,#fff,#71717a)] animate-[pulse-glow_3s_ease-in-out_infinite]" />
            IPFS Storage
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-zinc-400 backdrop-blur-md transition-all duration-300 hover:-translate-y-px hover:border-white/20 hover:bg-[rgba(255,255,255,0.06)] hover:text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[linear-gradient(135deg,#fff,#71717a)] animate-[pulse-glow_3s_ease-in-out_infinite]" />
            Smart Contracts
          </span>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <div className="grid grid-cols-1 gap-5 animate-[fadeInUp_0.8s_ease_0.3s_both] sm:grid-cols-3">
        <div className="group relative flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-[rgba(255,255,255,0.015)] p-6 text-center backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-white/10 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3),_inset_0_1px_0_rgba(255,255,255,0.05)]">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition-colors duration-500 group-hover:border-white/20 group-hover:bg-[rgba(255,255,255,0.08)] group-hover:text-white">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </span>
          <div className="mt-1 font-outfit text-[15px] font-bold tracking-[-0.2px] text-white">Submit</div>
          <div className="text-xs leading-[1.6] text-zinc-500">Upload proof to IPFS &amp; record CID on-chain</div>
        </div>
        <div className="group relative flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-[rgba(255,255,255,0.015)] p-6 text-center backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-white/10 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3),_inset_0_1px_0_rgba(255,255,255,0.05)]">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition-colors duration-500 group-hover:border-white/20 group-hover:bg-[rgba(255,255,255,0.08)] group-hover:text-white">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
          <div className="mt-1 font-outfit text-[15px] font-bold tracking-[-0.2px] text-white">Approve</div>
          <div className="text-xs leading-[1.6] text-zinc-500">Mentors verify &amp; approve work on the blockchain</div>
        </div>
        <div className="group relative flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-[rgba(255,255,255,0.015)] p-6 text-center backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-white/10 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3),_inset_0_1px_0_rgba(255,255,255,0.05)]">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition-colors duration-500 group-hover:border-white/20 group-hover:bg-[rgba(255,255,255,0.08)] group-hover:text-white">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <div className="mt-1 font-outfit text-[15px] font-bold tracking-[-0.2px] text-white">Verify</div>
          <div className="text-xs leading-[1.6] text-zinc-500">Recruiters check credentials directly from chain</div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="relative mb-8 mt-10 flex border-b border-white/5 animate-[fadeInUp_0.8s_ease_0.3s_both]">
        <button
          className={`relative flex-1 cursor-pointer border-none border-b-2 bg-transparent pb-3.5 pt-3.5 text-center text-sm font-semibold tracking-[-0.2px] transition-all duration-300 ${activeTab === 'student' ? 'border-white text-white after:absolute after:-bottom-0.5 after:left-[30%] after:h-0.5 after:w-[40%] after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)] after:blur-[2px]' : 'border-transparent text-zinc-700 hover:text-zinc-400'}`}
          onClick={() => setActiveTab('student')}
        >
          Student
        </button>
        <button
          className={`relative flex-1 cursor-pointer border-none border-b-2 bg-transparent pb-3.5 pt-3.5 text-center text-sm font-semibold tracking-[-0.2px] transition-all duration-300 ${activeTab === 'mentor' ? 'border-white text-white after:absolute after:-bottom-0.5 after:left-[30%] after:h-0.5 after:w-[40%] after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)] after:blur-[2px]' : 'border-transparent text-zinc-700 hover:text-zinc-400'}`}
          onClick={() => setActiveTab('mentor')}
        >
          Mentor
        </button>
      </div>

      {activeTab === 'student' ? <VerificationForm /> : <MentorPanel />}
    </main>
  );
}
