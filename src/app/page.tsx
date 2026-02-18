'use client';

import { useState } from 'react';
import Header from '../components/Header';
import MentorPanel from '../components/MentorPanel';
import VerificationForm from '../components/VerificationForm';

type Tab = 'student' | 'mentor';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('student');

  return (
    <main className="container">
      <div className="grid-bg" />

      <Header />

      {/* ── Hero Section ── */}
      <section className="hero-card">
        <h1>Blockchain&#8209;Based<br />Work Verification</h1>
        <p className="hero-subtitle">
          Students upload proof files to IPFS and submit CIDs to the smart contract.
          Mentors approve on&#8209;chain. Recruiters verify everything trustlessly.
        </p>

        <div className="hero-badges">
          <span className="hero-badge">
            <span className="badge-dot" />
            Polygon Amoy
          </span>
          <span className="hero-badge">
            <span className="badge-dot" />
            IPFS Storage
          </span>
          <span className="hero-badge">
            <span className="badge-dot" />
            Smart Contracts
          </span>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <div className="features-row">
        <div className="feature-card">
          <span className="feature-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </span>
          <div className="feature-title">Submit</div>
          <div className="feature-desc">Upload proof to IPFS &amp; record CID on-chain</div>
        </div>
        <div className="feature-card">
          <span className="feature-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
          <div className="feature-title">Approve</div>
          <div className="feature-desc">Mentors verify &amp; approve work on the blockchain</div>
        </div>
        <div className="feature-card">
          <span className="feature-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <div className="feature-title">Verify</div>
          <div className="feature-desc">Recruiters check credentials directly from chain</div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="tab-bar" style={{ marginTop: 40 }}>
        <button
          className={`tab-btn ${activeTab === 'student' ? 'active' : ''}`}
          onClick={() => setActiveTab('student')}
        >
          Student
        </button>
        <button
          className={`tab-btn ${activeTab === 'mentor' ? 'active' : ''}`}
          onClick={() => setActiveTab('mentor')}
        >
          Mentor
        </button>
      </div>

      {activeTab === 'student' ? <VerificationForm /> : <MentorPanel />}
    </main>
  );
}
