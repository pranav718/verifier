'use client';

import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { submitWork as submitToChain } from '../lib/contract';
import { uploadToIPFS } from '../lib/pinata';
import SubmissionCard from './SubmissionCard';

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
      setSubmissions(prev =>
        prev.map(s => s.id === tempId ? { ...s, cid, status: 'submitting' as const } : s)
      );

      const txHash = await submitToChain(title, cid);
      setSubmissions(prev =>
        prev.map(s => s.id === tempId ? { ...s, txHash, status: 'pending' as const } : s)
      );

      setTitle('');
      setFile(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      setError(message);
      setSubmissions(prev => prev.filter(s => s.id !== tempId));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-section">
      <div className="form-card">
        <h2>Submit Work</h2>

        {!account && (
          <div className="alert warning">
            Connect your MetaMask wallet to submit work to the blockchain.
          </div>
        )}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Project / Task Title
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Frontend for Todo App"
              disabled={loading}
            />
          </label>

          <label>
            Proof File (uploaded to IPFS)
            <input
              id="file-input"
              type="file"
              onChange={e => setFile(e.target.files?.[0] || null)}
              disabled={loading}
            />
          </label>

          {error && <div className="alert error">{error}</div>}

          <div className="form-actions">
            <button className="btn primary" type="submit" disabled={loading || !account}>
              {loading ? 'Processing...' : 'Submit to Blockchain'}
            </button>
            <button
              className="btn ghost"
              type="button"
              onClick={() => { setTitle(''); setFile(null); setError(null); }}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="submissions-list">
        <h3>Your Submissions</h3>

        {submissions.length === 0 && (
          <p className="muted">No submissions yet. Upload a file and submit to the blockchain.</p>
        )}

        {submissions.map(s => (
          <SubmissionCard key={s.id} submission={s} />
        ))}
      </div>
    </section>
  );
}
