'use client';

import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { submitWork as submitToChain } from '../lib/contract';
import { uploadToIPFS } from '../lib/pinata';
import SubmissionCard from './SubmissionCard';
import BlockchainSteps from './BlockchainSteps';

export interface Submission {
  id: number;
  title: string;
  cid: string;
  txHash: string | null;
  status: 'uploading' | 'submitting' | 'pending' | 'approved';
  approvalTxHash?: string;
}

export default function VerificationForm() {
  const { account } = useWallet();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bcStep, setBcStep] = useState(-1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) {
      setError('Please provide a title and select a file.');
      return;
    }
    if (!account) {
      setError('Please connect your wallet first.');
      return;
    }

    setError(null);
    setLoading(true);
    setBcStep(0);

    const tempId = Date.now();
    const tempSubmission: Submission = {
      id: tempId,
      title,
      cid: '',
      txHash: null,
      status: 'uploading',
    };
    setSubmissions(prev => [tempSubmission, ...prev]);

    try {
      const cid = await uploadToIPFS(file);
      setBcStep(1);
      setSubmissions(prev =>
        prev.map(s => s.id === tempId ? { ...s, cid, status: 'submitting' as const } : s)
      );

      setBcStep(2);
      const txHash = await submitToChain(title, cid);
      setBcStep(3);
      setSubmissions(prev =>
        prev.map(s => s.id === tempId ? { ...s, txHash, status: 'pending' as const } : s)
      );

      setTitle('');
      setFile(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setTimeout(() => setBcStep(-1), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      setError(message);
      setSubmissions(prev => prev.filter(s => s.id !== tempId));
      setBcStep(-1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-4" style={{ animation: 'fadeInUp 0.6s ease 0.3s both' }}>
      <div className="nb-card p-7 sm:p-9 mb-10">
        <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: '2px solid var(--nb-black)' }}>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Submit Work Credential</h2>
          <span className="nb-badge" style={{ background: 'var(--nb-yellow)', padding: '5px 12px' }}>IPFS + Polygon</span>
        </div>

        {!account && (
          <div className="nb-alert-info mb-8 p-4 sm:p-5 flex items-start sm:items-center gap-3 text-sm leading-relaxed">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5 sm:mt-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            Connect your Web3 wallet (MetaMask) above to submit proof to the blockchain.
          </div>
        )}

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2.5 text-xs font-bold uppercase tracking-wider text-zinc-700">
            Project / Task Title
            <input
              className="nb-input"
              style={{ padding: '14px 16px' }}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Distributed Consensus Engine in Go"
              disabled={loading}
            />
          </label>

          <label className="flex flex-col gap-2.5 text-xs font-bold uppercase tracking-wider text-zinc-700">
            Proof Artifact (PDF, Image, Zip — Pinned to IPFS)
            <input
              className="nb-input file:mr-4 file:py-1.5 file:px-3.5 file:rounded file:border-2 file:border-black file:text-xs file:font-bold file:bg-[var(--nb-yellow)] file:cursor-pointer"
              style={{ padding: '12px 14px' }}
              id="file-input"
              type="file"
              onChange={e => setFile(e.target.files?.[0] || null)}
              disabled={loading}
            />
          </label>

          {error && (
            <div className="nb-alert-error p-4 flex items-center gap-2.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {bcStep >= 0 && <BlockchainSteps currentStep={bcStep} />}

          <div className="mt-3 flex flex-wrap gap-4 pt-1">
            <button
              className="nb-btn nb-btn-primary"
              style={{ padding: '12px 24px', fontSize: '14px' }}
              type="submit"
              disabled={loading || !account}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {loading ? 'Submitting to Polygon...' : 'Submit to Blockchain'}
            </button>

            <button
              className="nb-btn nb-btn-outline"
              style={{ padding: '12px 20px', fontSize: '14px' }}
              type="button"
              onClick={() => { setTitle(''); setFile(null); setError(null); }}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="nb-card p-7 sm:p-9 mb-10">
        <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '2px solid var(--nb-black)' }}>
          <h3 className="text-xl font-bold tracking-tight">Your Active Submissions</h3>
          <span className="nb-badge" style={{ background: 'var(--nb-input-bg)', padding: '5px 12px' }}>{submissions.length} Total</span>
        </div>

        {submissions.length === 0 && (
          <p className="text-sm leading-relaxed text-zinc-600 py-6 text-center">
            No submissions in this session yet. Upload a proof document and write to chain above.
          </p>
        )}

        <div className="flex flex-col gap-5">
          {submissions.map(s => (
            <SubmissionCard key={s.id} submission={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
