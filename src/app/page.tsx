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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3" style={{ animation: 'fadeInUp 0.6s ease 0.2s both' }}>
        <div className="nb-card relative flex flex-col items-start gap-3 p-6">
          <div className="flex w-full items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center" style={{ border: 'var(--nb-border)', borderRadius: 'var(--nb-radius)', background: 'var(--nb-yellow)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </span>
            <span className="font-mono text-xs font-bold px-2 py-0.5" style={{ background: 'var(--nb-input-bg)', border: '2px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>01</span>
          </div>
          <div className="text-base font-bold">1. Submit Work</div>
          <div className="text-xs leading-[1.6]" style={{ color: '#555' }}>Upload proof to IPFS &amp; record cryptographically signed CID on-chain.</div>
        </div>

        <div className="nb-card relative flex flex-col items-start gap-3 p-6">
          <div className="flex w-full items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center" style={{ border: 'var(--nb-border)', borderRadius: 'var(--nb-radius)', background: 'var(--nb-green)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
            <span className="font-mono text-xs font-bold px-2 py-0.5" style={{ background: 'var(--nb-input-bg)', border: '2px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>02</span>
          </div>
          <div className="text-base font-bold">2. Approve Proof</div>
          <div className="text-xs leading-[1.6]" style={{ color: '#555' }}>Verified mentors inspect student claims and seal approval on Polygon.</div>
        </div>

        <div className="nb-card relative flex flex-col items-start gap-3 p-6">
          <div className="flex w-full items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center" style={{ border: 'var(--nb-border)', borderRadius: 'var(--nb-radius)', background: 'var(--nb-blue)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <span className="font-mono text-xs font-bold px-2 py-0.5" style={{ background: 'var(--nb-input-bg)', border: '2px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>03</span>
          </div>
          <div className="text-base font-bold">3. Trustless Verification</div>
          <div className="text-xs leading-[1.6]" style={{ color: '#555' }}>Recruiters and institutions scan QR codes for direct blockchain provenance.</div>
        </div>
      </div>

      <div className="relative mb-8 mt-12 flex gap-3" style={{ borderBottom: '3px solid var(--nb-black)', paddingBottom: '0px', animation: 'fadeInUp 0.6s ease 0.2s both' }}>
        <button
          className={`flex items-center justify-center gap-2 cursor-pointer py-3.5 px-6 text-sm font-bold tracking-[-0.2px] transition-all`}
          style={{
            background: activeTab === 'student' ? 'var(--nb-yellow)' : 'var(--nb-card)',
            borderTop: '3px solid var(--nb-black)',
            borderLeft: '3px solid var(--nb-black)',
            borderRight: '3px solid var(--nb-black)',
            borderBottom: activeTab === 'student' ? '3px solid var(--nb-yellow)' : '3px solid var(--nb-black)',
            borderRadius: '8px 8px 0 0',
            marginBottom: '-3px',
            boxShadow: activeTab === 'student' ? 'none' : 'inset 0 -2px 0 var(--nb-black)',
          }}
          onClick={() => setActiveTab('student')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
          Student Portal
        </button>

        <button
          className={`flex items-center justify-center gap-2 cursor-pointer py-3.5 px-6 text-sm font-bold tracking-[-0.2px] transition-all`}
          style={{
            background: activeTab === 'mentor' ? 'var(--nb-yellow)' : 'var(--nb-card)',
            borderTop: '3px solid var(--nb-black)',
            borderLeft: '3px solid var(--nb-black)',
            borderRight: '3px solid var(--nb-black)',
            borderBottom: activeTab === 'mentor' ? '3px solid var(--nb-yellow)' : '3px solid var(--nb-black)',
            borderRadius: '8px 8px 0 0',
            marginBottom: '-3px',
            boxShadow: activeTab === 'mentor' ? 'none' : 'inset 0 -2px 0 var(--nb-black)',
          }}
          onClick={() => setActiveTab('mentor')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <polyline points="16 11 18 13 22 9" />
          </svg>
          Mentor Panel
        </button>
      </div>

      {activeTab === 'student' ? <VerificationForm /> : <MentorPanel />}
    </main>
  );
}
