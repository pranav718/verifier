'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import Header from '../../components/Header';
import { getSubmission, getMentorDomain, ipfsGatewayUrl, verifyPageUrl, OnChainSubmission } from '../../lib/contract';

function VerifyContent() {
    const searchParams = useSearchParams();
    const [submissionId, setSubmissionId] = useState('');
    const [result, setResult] = useState<OnChainSubmission | null>(null);
    const [mentorDomainStr, setMentorDomainStr] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [verifiedId, setVerifiedId] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const idParam = searchParams.get('id');
        if (idParam) {
            setSubmissionId(idParam);
            doVerify(parseInt(idParam));
        }
    }, [searchParams]);

    const doVerify = async (id: number) => {
        if (isNaN(id) || id < 0) {
            setError('Please enter a valid submission ID (0, 1, 2, ...)');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        setMentorDomainStr('');

        try {
            const sub = await getSubmission(id);
            setResult(sub);
            setVerifiedId(id);

            if (sub.approved && sub.mentor !== '0x0000000000000000000000000000000000000000') {
                try {
                    const domain = await getMentorDomain(sub.mentor);
                    if (domain) setMentorDomainStr(domain);
                } catch {
                }
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch submission from blockchain');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        doVerify(parseInt(submissionId));
    };

    const handleCopy = () => {
        if (verifiedId !== null) {
            navigator.clipboard.writeText(verifyPageUrl(verifiedId));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <section className="mt-2" style={{ animation: 'fadeInUp 0.6s ease 0.3s both' }}>
            <div className="nb-card p-6 sm:p-8 mb-8">
                <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '2px solid var(--nb-black)' }}>
                    <h2 className="text-xl font-bold tracking-tight">Lookup On-Chain Record</h2>
                    <span className="nb-badge" style={{ background: 'var(--nb-yellow)' }}>Polygon Explorer</span>
                </div>

                <form className="flex flex-col gap-5" onSubmit={handleVerify}>
                    <label className="flex flex-col text-xs font-bold uppercase tracking-wider text-zinc-700">
                        Submission ID (Integer Index)
                        <input
                            className="nb-input mt-2 font-mono"
                            type="number"
                            min="0"
                            value={submissionId}
                            onChange={e => setSubmissionId(e.target.value)}
                            placeholder="e.g. 0"
                            disabled={loading}
                        />
                    </label>

                    {error && <div className="nb-alert-error">{error}</div>}

                    <div className="mt-2">
                        <button className="nb-btn nb-btn-primary" type="submit" disabled={loading}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            {loading ? 'Querying Blockchain...' : 'Verify Credential on Chain'}
                        </button>
                    </div>
                </form>
            </div>

            {result && (
                <div
                    className="nb-card p-6 sm:p-8 mb-8"
                    style={{
                        animation: 'fadeInUp 0.5s ease both',
                        background: result.approved ? '#FAFFF9' : '#FFFDF5',
                    }}
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-5" style={{ borderBottom: '2px solid var(--nb-black)' }}>
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="nb-badge" style={{ background: 'var(--nb-input-bg)' }}>ID #{verifiedId}</span>
                                <span
                                    className="nb-badge"
                                    style={{
                                        background: result.approved ? 'var(--nb-green)' : 'var(--nb-pink)',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    {result.approved ? '✓ Verified on Polygon' : '⏳ Pending Mentor Approval'}
                                </span>
                            </div>

                            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">{result.title}</h3>

                            {result.approved && mentorDomainStr && (
                                <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-black px-3 py-1.5" style={{ background: 'var(--nb-green)', border: '2px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                        <path d="m9 12 2 2 4-4" />
                                    </svg>
                                    Official Endorsement by {mentorDomainStr} Mentor
                                </div>
                            )}
                        </div>

                        {verifiedId !== null && (
                            <div className="p-3 text-center" style={{ background: '#FFF', border: 'var(--nb-border)', borderRadius: 'var(--nb-radius)', boxShadow: 'var(--nb-shadow-sm)' }}>
                                <QRCodeSVG
                                    value={verifyPageUrl(verifiedId)}
                                    size={96}
                                    bgColor="#ffffff"
                                    fgColor="#1A1A1A"
                                    level="M"
                                />
                                <span className="text-[10px] font-bold uppercase tracking-wider block mt-1">Scan for Proof</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 text-xs sm:text-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                            <span className="font-bold uppercase tracking-wider text-zinc-600">Student Address</span>
                            <span className="font-mono font-bold">{result.student}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                            <span className="font-bold uppercase tracking-wider text-zinc-600">IPFS CID</span>
                            <a
                                href={ipfsGatewayUrl(result.cid)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono font-bold underline hover:bg-[var(--nb-yellow)]"
                            >
                                {result.cid} ↗
                            </a>
                        </div>

                        {result.approved && result.mentor !== '0x0000000000000000000000000000000000000000' && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                                <span className="font-bold uppercase tracking-wider text-zinc-600">Mentor Address</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold">{result.mentor}</span>
                                    {mentorDomainStr && (
                                        <span className="nb-badge" style={{ background: 'var(--nb-green)', fontSize: '10px' }}>{mentorDomainStr}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                            <span className="font-bold uppercase tracking-wider text-zinc-600">Submission Timestamp</span>
                            <span>{new Date(result.submittedAt * 1000).toLocaleString()}</span>
                        </div>

                        {result.approvedAt > 0 && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                                <span className="font-bold uppercase tracking-wider text-zinc-600">Approval Timestamp</span>
                                <span>{new Date(result.approvedAt * 1000).toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {result.cid && (
                        <div className="mt-6">
                            <h4 className="text-sm font-bold uppercase tracking-wider mb-3">Proof Document Preview</h4>
                            <div className="relative w-full overflow-hidden" style={{ border: 'var(--nb-border)', borderRadius: 'var(--nb-radius)', paddingTop: '56.25%', background: '#fff' }}>
                                <iframe
                                    src={ipfsGatewayUrl(result.cid)}
                                    title="Proof File"
                                    className="absolute inset-0 h-full w-full border-none"
                                />
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex flex-wrap gap-3 pt-4" style={{ borderTop: '2px solid var(--nb-black)' }}>
                        <a
                            href={ipfsGatewayUrl(result.cid)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="nb-btn nb-btn-primary"
                        >
                            Open Raw File on IPFS ↗
                        </a>
                        {verifiedId !== null && (
                            <button
                                className="nb-btn nb-btn-outline"
                                onClick={handleCopy}
                            >
                                {copied ? '✓ Link Copied!' : 'Copy Shareable Proof Link'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}

export default function VerifyPage() {
    return (
        <main className="w-full max-w-[860px] mx-auto">
            <Header />

            <section className="relative mb-10 py-10 pb-10" style={{ borderBottom: '3px solid var(--nb-black)', animation: 'fadeInUp 0.6s ease' }}>
                <h1 className="mb-4 text-4xl sm:text-5xl font-bold leading-tight tracking-[-2px]">
                    Verify Work Submission
                </h1>
                <p className="max-w-[580px] text-[15px] leading-[1.7]" style={{ color: '#666', animation: 'fadeInUp 0.6s ease 0.15s both' }}>
                    Recruiters &amp; Organizations: enter a submission ID to audit credentials directly on the Polygon blockchain with zero intermediaries.
                </p>

                <div className="mt-6 flex flex-wrap gap-2.5" style={{ animation: 'fadeInUp 0.6s ease 0.3s both' }}>
                    <span className="nb-chip" style={{ background: 'var(--nb-yellow)' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--nb-black)', display: 'inline-block' }} />
                        On-Chain Verification
                    </span>
                    <span className="nb-chip" style={{ background: 'var(--nb-green)' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--nb-black)', display: 'inline-block' }} />
                        Tamper-Proof Proofs
                    </span>
                    <span className="nb-chip" style={{ background: 'var(--nb-blue)' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--nb-black)', display: 'inline-block' }} />
                        Corporate Identity Verified
                    </span>
                </div>
            </section>

            <Suspense fallback={<p className="text-sm font-bold text-center py-8">Loading blockchain verification engine...</p>}>
                <VerifyContent />
            </Suspense>
        </main>
    );
}
