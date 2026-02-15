'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import { getSubmission, ipfsGatewayUrl, OnChainSubmission } from '../../lib/contract';

export default function VerifyPage() {
    const [submissionId, setSubmissionId] = useState('');
    const [result, setResult] = useState<OnChainSubmission | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const id = parseInt(submissionId);
        if (isNaN(id) || id < 0) {
            setError('Please enter a valid submission ID (0, 1, 2, ...)');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const sub = await getSubmission(id);
            setResult(sub);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch submission');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container">
            <Header />

            <section className="hero-card">
                <h1>🔍 Verify Submission</h1>
                <p className="muted">
                    Recruiters: enter a submission ID to verify work credentials directly from the blockchain.
                </p>
            </section>

            <section className="form-section">
                <div className="form-card">
                    <h2>Look Up Submission</h2>
                    <form className="form-grid" onSubmit={handleVerify}>
                        <label>
                            Submission ID
                            <input
                                type="number"
                                min="0"
                                value={submissionId}
                                onChange={e => setSubmissionId(e.target.value)}
                                placeholder="e.g. 0"
                                disabled={loading}
                            />
                        </label>

                        {error && <div className="alert error">{error}</div>}

                        <div className="form-actions">
                            <button className="btn primary" type="submit" disabled={loading}>
                                {loading ? 'Fetching...' : 'Verify'}
                            </button>
                        </div>
                    </form>
                </div>

                {result && (
                    <div className={`card verify-result ${result.approved ? 'status-approved' : 'status-pending'}`}>
                        <h3 className="card-title">{result.title}</h3>

                        <div className="verify-grid">
                            <div className="verify-row">
                                <span className="verify-label">Student Address</span>
                                <span className="mono">{result.student}</span>
                            </div>

                            <div className="verify-row">
                                <span className="verify-label">IPFS CID</span>
                                <a
                                    href={ipfsGatewayUrl(result.cid)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mono link"
                                >
                                    {result.cid}
                                </a>
                            </div>

                            <div className="verify-row">
                                <span className="verify-label">Approval Status</span>
                                <span className={result.approved ? 'badge-approved' : 'badge-pending'}>
                                    {result.approved ? '✅ Approved' : '🟡 Pending'}
                                </span>
                            </div>

                            {result.approved && result.mentor !== '0x0000000000000000000000000000000000000000' && (
                                <div className="verify-row">
                                    <span className="verify-label">Mentor Address</span>
                                    <span className="mono">{result.mentor}</span>
                                </div>
                            )}

                            <div className="verify-row">
                                <span className="verify-label">Submitted At</span>
                                <span>{new Date(result.submittedAt * 1000).toLocaleString()}</span>
                            </div>

                            {result.approvedAt > 0 && (
                                <div className="verify-row">
                                    <span className="verify-label">Approved At</span>
                                    <span>{new Date(result.approvedAt * 1000).toLocaleString()}</span>
                                </div>
                            )}
                        </div>

                        <div className="verify-links">
                            <a
                                href={ipfsGatewayUrl(result.cid)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn ghost small"
                            >
                                📄 View on IPFS
                            </a>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
