'use client';

import { ipfsGatewayUrl, polygonscanTxUrl } from '../lib/contract';
import { Submission } from './VerificationForm';

export default function SubmissionCard({ submission }: { submission: Submission }) {
  const statusLabel = {
    uploading: 'Uploading to IPFS...',
    submitting: 'Writing to Blockchain...',
    pending: 'Pending Mentor Approval',
    approved: 'Verified On-Chain',
  }[submission.status];

  const statusBg = {
    uploading: 'var(--nb-yellow)',
    submitting: 'var(--nb-yellow)',
    pending: 'var(--nb-pink)',
    approved: 'var(--nb-green)',
  }[submission.status];

  return (
    <div
      className="nb-card"
      style={{
        animation: 'fadeInUp 0.4s ease both',
        padding: '28px 32px',
      }}
    >
      <div className="flex flex-wrap items-center justify-between" style={{ gap: '16px', paddingBottom: '16px', marginBottom: '20px', borderBottom: '2px solid var(--nb-black)' }}>
        <div>
          <h4 className="text-base sm:text-lg font-bold tracking-tight">{submission.title}</h4>
          <span className="text-xs text-zinc-500 font-mono mt-0.5 block">ID: #{submission.id}</span>
        </div>

        <span
          className="nb-badge"
          style={{
            background: statusBg,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '11px',
            padding: '5px 12px',
          }}
        >
          {submission.status === 'approved' && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-col" style={{ gap: '12px', fontSize: '13px' }}>
        {submission.cid && (
          <div className="flex flex-wrap items-center justify-between" style={{ gap: '8px', padding: '12px 14px', background: 'var(--nb-input-bg)', border: '2px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
            <span className="font-bold uppercase tracking-wider text-zinc-600">IPFS CID</span>
            <a
              href={ipfsGatewayUrl(submission.cid)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono font-bold text-xs underline hover:bg-[var(--nb-yellow)] px-2 py-1 rounded transition-colors"
            >
              {submission.cid.slice(0, 14)}...{submission.cid.slice(-8)} ↗
            </a>
          </div>
        )}

        {submission.txHash && (
          <div className="flex flex-wrap items-center justify-between" style={{ gap: '8px', padding: '12px 14px', background: 'var(--nb-input-bg)', border: '2px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
            <span className="font-bold uppercase tracking-wider text-zinc-600">Creation Tx</span>
            <a
              href={polygonscanTxUrl(submission.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono font-bold text-xs underline hover:bg-[var(--nb-yellow)] px-2 py-1 rounded transition-colors"
            >
              {submission.txHash.slice(0, 10)}...{submission.txHash.slice(-6)} ↗
            </a>
          </div>
        )}

        {submission.approvalTxHash && (
          <div className="flex flex-wrap items-center justify-between" style={{ gap: '8px', padding: '12px 14px', background: 'var(--nb-input-bg)', border: '2px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
            <span className="font-bold uppercase tracking-wider text-zinc-600">Approval Tx</span>
            <a
              href={polygonscanTxUrl(submission.approvalTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono font-bold text-xs underline hover:bg-[var(--nb-green)] px-2 py-1 rounded transition-colors"
            >
              {submission.approvalTxHash.slice(0, 10)}...{submission.approvalTxHash.slice(-6)} ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
