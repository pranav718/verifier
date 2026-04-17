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
    <section className="mt-2 animate-[fadeInUp_0.8s_ease_0.4s_both]">
      <div className="group relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all duration-400 hover:border-white/10 hover:shadow-[0_8px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] before:absolute before:-left-full before:top-0 before:h-px before:w-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] before:transition-[left] before:duration-600 hover:before:left-full">
        <h2 className="mb-6 font-outfit text-lg font-extrabold tracking-[-0.4px] text-white">Submit Work</h2>

        {!account && (
          <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4 text-[13px] font-medium leading-[1.6] text-zinc-400 backdrop-blur-md animate-[fadeInUp_0.4s_ease]">
            Connect your MetaMask wallet to submit work to the blockchain.
          </div>
        )}

        <form className="flex flex-col gap-[22px]" onSubmit={handleSubmit}>
          <label className="flex flex-col text-[13px] font-medium tracking-normal text-zinc-500">
            Project / Task Title
            <input
              className="mt-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-zinc-200 backdrop-blur-sm transition-all duration-300 placeholder-zinc-700 focus:border-white/25 focus:bg-[rgba(255,255,255,0.05)] focus:outline-none focus:ring-[3px] focus:ring-white/5 disabled:opacity-50"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Frontend for Todo App"
              disabled={loading}
            />
          </label>

          <label className="flex flex-col text-[13px] font-medium tracking-normal text-zinc-500">
            Proof File (uploaded to IPFS)
            <input
              className="mt-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-zinc-200 backdrop-blur-sm transition-all duration-300 focus:border-white/25 focus:bg-[rgba(255,255,255,0.05)] focus:outline-none focus:ring-[3px] focus:ring-white/5 disabled:opacity-50 file:cursor-pointer file:border-0 file:bg-transparent file:text-zinc-500"
              id="file-input"
              type="file"
              onChange={e => setFile(e.target.files?.[0] || null)}
              disabled={loading}
            />
          </label>

          {error && <div className="rounded-lg border border-red-500/10 bg-white/5 p-4 text-[13px] font-medium leading-[1.6] text-red-500 backdrop-blur-md animate-[fadeInUp_0.4s_ease]">{error}</div>}

          {bcStep >= 0 && <BlockchainSteps currentStep={bcStep} />}

          <div className="mt-3 flex gap-3">
            <button className="relative inline-flex overflow-hidden items-center gap-1.5 rounded-lg border-none bg-white px-5 py-2.5 text-[13px] font-bold tracking-[-0.1px] text-black shadow-[0_0_20px_rgba(255,255,255,0.1),_0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-300 before:absolute before:-left-full before:top-0 before:h-full before:w-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] before:transition-[left] before:duration-500 hover:before:left-full hover:bg-zinc-100 hover:-translate-y-px hover:shadow-[0_0_30px_rgba(255,255,255,0.2),_0_4px_16px_rgba(0,0,0,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-35" type="submit" disabled={loading || !account}>
              {loading ? 'Processing...' : 'Submit to Blockchain'}
            </button>
            <button
              className="relative inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-transparent px-5 py-2.5 text-[13px] font-bold tracking-[-0.1px] text-zinc-400 backdrop-blur-sm transition-all duration-300 hover:-translate-y-px hover:border-white/25 hover:bg-white/5 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] disabled:cursor-not-allowed disabled:opacity-35"
              type="button"
              onClick={() => { setTitle(''); setFile(null); setError(null); }}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.01)] p-7 backdrop-blur-md">
        <h3 className="mb-4 font-outfit text-[17px] font-extrabold tracking-[-0.3px] text-white">Your Submissions</h3>

        {submissions.length === 0 && (
          <p className="text-sm leading-[1.7] text-zinc-600">No submissions yet. Upload a file and submit to the blockchain.</p>
        )}

        {submissions.map(s => (
          <SubmissionCard key={s.id} submission={s} />
        ))}
      </div>
    </section>
  );
}
