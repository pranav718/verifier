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
      <Header />

      {/* ── Hero Section ── */}
      <section className="relative mb-10 py-10 pb-10" style={{ borderBottom: '3px solid var(--nb-black)', animation: 'fadeInUp 0.6s ease' }}>
        <h1 className="mb-4 text-4xl sm:text-5xl font-bold leading-tight tracking-[-2px]">
          Blockchain&#8209;Based<br />Work Verification
        </h1>
        <p className="max-w-[580px] text-[15px] leading-[1.7]" style={{ color: '#666', animation: 'fadeInUp 0.6s ease 0.15s both' }}>
          Students upload proof files to IPFS and submit CIDs to the smart contract.
          Mentors approve on&#8209;chain. Recruiters verify everything trustlessly.
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5" style={{ animation: 'fadeInUp 0.6s ease 0.3s both' }}>
          <span className="nb-chip" style={{ background: 'var(--nb-yellow)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--nb-black)', display: 'inline-block' }} />
            Polygon Amoy
          </span>
          <span className="nb-chip" style={{ background: 'var(--nb-blue)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--nb-black)', display: 'inline-block' }} />
            IPFS Storage
          </span>
          <span className="nb-chip" style={{ background: 'var(--nb-green)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--nb-black)', display: 'inline-block' }} />
            Smart Contracts
          </span>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3" style={{ animation: 'fadeInUp 0.6s ease 0.2s both' }}>
        <div className="nb-card flex flex-col items-center gap-3 p-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center" style={{ border: 'var(--nb-border)', borderRadius: 'var(--nb-radius)', background: 'var(--nb-yellow)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </span>
          <div className="text-[15px] font-bold">Submit</div>
          <div className="text-xs leading-[1.6]" style={{ color: '#666' }}>Upload proof to IPFS &amp; record CID on-chain</div>
        </div>
        <div className="nb-card flex flex-col items-center gap-3 p-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center" style={{ border: 'var(--nb-border)', borderRadius: 'var(--nb-radius)', background: 'var(--nb-green)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
          <div className="text-[15px] font-bold">Approve</div>
          <div className="text-xs leading-[1.6]" style={{ color: '#666' }}>Mentors verify &amp; approve work on the blockchain</div>
        </div>
        <div className="nb-card flex flex-col items-center gap-3 p-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center" style={{ border: 'var(--nb-border)', borderRadius: 'var(--nb-radius)', background: 'var(--nb-blue)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <div className="text-[15px] font-bold">Verify</div>
          <div className="text-xs leading-[1.6]" style={{ color: '#666' }}>Recruiters check credentials directly from chain</div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="relative mb-8 mt-10 flex" style={{ borderBottom: '3px solid var(--nb-black)', animation: 'fadeInUp 0.6s ease 0.2s both' }}>
        <button
          className={`flex-1 cursor-pointer border-none py-3.5 text-center text-sm font-bold tracking-[-0.2px] transition-all`}
          style={{
            background: activeTab === 'student' ? 'var(--nb-yellow)' : 'transparent',
            borderTop: activeTab === 'student' ? '3px solid var(--nb-black)' : '3px solid transparent',
            borderLeft: activeTab === 'student' ? '3px solid var(--nb-black)' : '3px solid transparent',
            borderRight: activeTab === 'student' ? '3px solid var(--nb-black)' : '3px solid transparent',
            borderBottom: 'none',
            borderRadius: '8px 8px 0 0',
            marginBottom: activeTab === 'student' ? '-3px' : '0',
          }}
          onClick={() => setActiveTab('student')}
        >
          Student
        </button>
        <button
          className={`flex-1 cursor-pointer border-none py-3.5 text-center text-sm font-bold tracking-[-0.2px] transition-all`}
          style={{
            background: activeTab === 'mentor' ? 'var(--nb-yellow)' : 'transparent',
            borderTop: activeTab === 'mentor' ? '3px solid var(--nb-black)' : '3px solid transparent',
            borderLeft: activeTab === 'mentor' ? '3px solid var(--nb-black)' : '3px solid transparent',
            borderRight: activeTab === 'mentor' ? '3px solid var(--nb-black)' : '3px solid transparent',
            borderBottom: 'none',
            borderRadius: '8px 8px 0 0',
            marginBottom: activeTab === 'mentor' ? '-3px' : '0',
          }}
          onClick={() => setActiveTab('mentor')}
        >
          Mentor
        </button>
      </div>

      {activeTab === 'student' ? <VerificationForm /> : <MentorPanel />}
    </main>
  );
}
