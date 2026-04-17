'use client';

import { ipfsGatewayUrl, polygonscanTxUrl } from '../lib/contract';
import { Submission } from './VerificationForm';

export default function SubmissionCard({ submission }: { submission: Submission }) {
  const statusLabel = {
    uploading: 'Uploading to IPFS...',
    submitting: 'Writing to blockchain...',
    pending: 'Pending Approval',
    approved: 'Approved',
  }[submission.status];

  const borderClass = {
    uploading: '!border-white/10 opacity-60',
    submitting: '!border-white/10 opacity-60',
    pending: '!border-yellow-400/15 hover:!border-yellow-400/30 hover:!shadow-[0_12px_40px_rgba(0,0,0,0.4),_0_0_30px_rgba(250,204,21,0.03)]',
    approved: '!border-green-500/20 hover:!border-green-500/35 hover:!shadow-[0_12px_40px_rgba(0,0,0,0.4),_0_0_30px_rgba(34,197,94,0.05)]',
  }[submission.status];

  const textClass = {
    uploading: 'text-zinc-500',
    submitting: 'text-zinc-500',
    pending: 'text-yellow-400',
    approved: 'text-green-500',
  }[submission.status];

  return (
    <div className={`relative mt-3.5 overflow-hidden rounded-[14px] border border-white/5 bg-white/5 p-5 backdrop-blur-md transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] animate-[fadeInUp_0.5s_ease_both] before:absolute before:inset-0 before:h-px before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)] before:opacity-0 before:transition-opacity before:duration-300 hover:-translate-y-0.5 hover:border-white/10 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4),_0_0_30px_rgba(255,255,255,0.02)] hover:before:opacity-1 ${borderClass}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-outfit text-[15px] font-extrabold tracking-[-0.2px] text-white">{submission.title}</div>
          <div className={`mt-1.5 text-xs font-bold tracking-[0.2px] ${textClass}`}>{statusLabel}</div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1.5 border-t border-white/5 pt-3 text-xs text-zinc-500">
        {submission.cid && (
          <div>
            IPFS CID:{' '}
            <a
              href={ipfsGatewayUrl(submission.cid)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] tracking-[0.2px] text-zinc-400 underline decoration-white/10 underline-offset-2 transition-colors duration-300 hover:text-white hover:decoration-white/30"
            >
              {submission.cid.slice(0, 16)}...
            </a>
          </div>
        )}
        {submission.txHash && (
          <div>
            Tx Hash:{' '}
            <a
              href={polygonscanTxUrl(submission.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] tracking-[0.2px] text-zinc-400 underline decoration-white/10 underline-offset-2 transition-colors duration-300 hover:text-white hover:decoration-white/30"
            >
              {submission.txHash.slice(0, 16)}...
            </a>
          </div>
        )}
        {submission.approvalTxHash && (
          <div>
            Approval Tx:{' '}
            <a
              href={polygonscanTxUrl(submission.approvalTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] tracking-[0.2px] text-zinc-400 underline decoration-white/10 underline-offset-2 transition-colors duration-300 hover:text-white hover:decoration-white/30"
            >
              {submission.approvalTxHash.slice(0, 16)}...
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
