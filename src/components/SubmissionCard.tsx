'use client';

import { ipfsGatewayUrl, polygonscanTxUrl } from '../lib/contract';
import { Submission } from './VerificationForm';

export default function SubmissionCard({ submission }: { submission: Submission }) {
  const statusLabel = {
    uploading: '⏳ Uploading to IPFS...',
    submitting: '⏳ Writing to blockchain...',
    pending: '🟡 Pending Approval',
    approved: '✅ Approved',
  }[submission.status];

  const statusClass = {
    uploading: 'status-loading',
    submitting: 'status-loading',
    pending: 'status-pending',
    approved: 'status-approved',
  }[submission.status];

  return (
    <div className={`card ${statusClass}`}>
      <div className="card-main">
        <div>
          <div className="card-title">{submission.title}</div>
          <div className={`card-status ${statusClass}`}>{statusLabel}</div>
        </div>
      </div>

      <div className="card-footer">
        {submission.cid && (
          <div>
            IPFS CID:{' '}
            <a
              href={ipfsGatewayUrl(submission.cid)}
              target="_blank"
              rel="noopener noreferrer"
              className="mono link"
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
              className="mono link"
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
              className="mono link"
            >
              {submission.approvalTxHash.slice(0, 16)}...
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
