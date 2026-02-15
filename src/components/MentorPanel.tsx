'use client';

import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { approveWork, getSubmission, getSubmissionCount, ipfsGatewayUrl, OnChainSubmission } from '../lib/contract';

interface DisplaySubmission extends OnChainSubmission {
    id: number;
}

export default function MentorPanel() {
    const { account } = useWallet();
    const [submissions, setSubmissions] = useState<DisplaySubmission[]>([]);
    const [loadingList, setLoadingList] = useState(false);
    const [approvingId, setApprovingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const fetchSubmissions = async () => {
        setLoadingList(true);
        setError(null);
        try {
            const count = await getSubmissionCount();
            const items: DisplaySubmission[] = [];
            for (let i = 0; i < count; i++) {
                const sub = await getSubmission(i);
                items.push({ ...sub, id: i });
            }
            setSubmissions(items);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load submissions');
        } finally {
            setLoadingList(false);
        }
    };

    const handleApprove = async (id: number) => {
        if (!account) {
            setError('Connect your wallet first.');
            return;
        }
        setApprovingId(id);
        setError(null);
        setSuccessMsg(null);
        try {
            const txHash = await approveWork(id);
            setSuccessMsg(`Approved! Tx: ${txHash.slice(0, 16)}...`);
            // Refresh
            await fetchSubmissions();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Approval failed');
        } finally {
            setApprovingId(null);
        }
    };

    return (
        <section className="form-section">
            <div className="form-card">
                <h2>Mentor: Approve Submissions</h2>

                {!account && (
                    <div className="alert warning">
                        Connect your MetaMask wallet to approve submissions.
                    </div>
                )}

                <button
                    className="btn primary"
                    onClick={fetchSubmissions}
                    disabled={loadingList}
                >
                    {loadingList ? 'Loading...' : 'Load Submissions from Blockchain'}
                </button>

                {error && <div className="alert error" style={{ marginTop: 12 }}>{error}</div>}
                {successMsg && <div className="alert success" style={{ marginTop: 12 }}>{successMsg}</div>}
            </div>

            <div className="submissions-list">
                <h3>All On-Chain Submissions</h3>

                {submissions.length === 0 && !loadingList && (
                    <p className="muted">Click above to load submissions from the blockchain.</p>
                )}

                {submissions.map(sub => (
                    <div key={sub.id} className={`card ${sub.approved ? 'status-approved' : 'status-pending'}`}>
                        <div className="card-main">
                            <div>
                                <div className="card-title">{sub.title}</div>
                                <div className="card-meta">
                                    Student: <span className="mono">{sub.student.slice(0, 6)}...{sub.student.slice(-4)}</span>
                                </div>
                                <div className={`card-status ${sub.approved ? 'status-approved' : 'status-pending'}`}>
                                    {sub.approved ? '✅ Approved' : '🟡 Pending'}
                                </div>
                            </div>

                            <div className="card-actions">
                                {!sub.approved && account && (
                                    <button
                                        className="btn primary small"
                                        onClick={() => handleApprove(sub.id)}
                                        disabled={approvingId === sub.id}
                                    >
                                        {approvingId === sub.id ? 'Approving...' : 'Approve'}
                                    </button>
                                )}
                                {sub.approved && <div className="approved-badge">Approved</div>}
                            </div>
                        </div>

                        <div className="card-footer">
                            <div>
                                CID:{' '}
                                <a href={ipfsGatewayUrl(sub.cid)} target="_blank" rel="noopener noreferrer" className="mono link">
                                    {sub.cid.slice(0, 20)}...
                                </a>
                            </div>
                            {sub.mentor !== '0x0000000000000000000000000000000000000000' && (
                                <div>Mentor: <span className="mono">{sub.mentor.slice(0, 6)}...{sub.mentor.slice(-4)}</span></div>
                            )}
                            <div>Submitted: {new Date(sub.submittedAt * 1000).toLocaleString()}</div>
                            {sub.approvedAt > 0 && (
                                <div>Approved: {new Date(sub.approvedAt * 1000).toLocaleString()}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
