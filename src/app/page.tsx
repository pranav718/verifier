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
      <Header />

      <section className="hero-card">
        <h1>Blockchain-Based Work Verification</h1>
        <p className="muted">
          Students upload proof files to IPFS and submit CIDs to the smart contract.
          Mentors approve submissions on-chain. Recruiters can verify everything.
        </p>
      </section>

      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === 'student' ? 'active' : ''}`}
          onClick={() => setActiveTab('student')}
        >
          🎓 Student
        </button>
        <button
          className={`tab-btn ${activeTab === 'mentor' ? 'active' : ''}`}
          onClick={() => setActiveTab('mentor')}
        >
          👨‍🏫 Mentor
        </button>
      </div>

      {activeTab === 'student' ? <VerificationForm /> : <MentorPanel />}
    </main>
  );
}
