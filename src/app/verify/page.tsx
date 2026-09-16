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
        <section style={{ marginTop: '8px', animation: 'fadeInUp 0.6s ease 0.3s both' }}>
            <div className="nb-card" style={{ padding: '36px 40px', marginBottom: '48px' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '2px solid var(--nb-black)' }}>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Lookup On-Chain Record</h2>
                    <span className="nb-badge" style={{ background: 'var(--nb-yellow)', padding: '5px 12px' }}>Polygon Explorer</span>
                </div>

                <form className="flex flex-col" style={{ gap: '28px' }} onSubmit={handleVerify}>
                    <label className="flex flex-col text-xs font-bold uppercase tracking-wider text-zinc-700" style={{ gap: '10px' }}>
                        Submission ID (Integer Index)
                        <input
                            className="nb-input font-mono"
                            style={{ padding: '14px 16px' }}
                            type="number"
                            min="0"
                            value={submissionId}
                            onChange={e => setSubmissionId(e.target.value)}
                            placeholder="e.g. 0"
                            disabled={loading}
                        />
                    </label>

                    {error && <div className="nb-alert-error p-4">{error}</div>}

                    <div style={{ marginTop: '12px' }}>
                        <button className="nb-btn nb-btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }} type="submit" disabled={loading}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                    className="nb-card"
                    style={{
                        animation: 'fadeInUp 0.5s ease both',
                        background: result.approved ? '#FAFFF9' : '#FFFDF5',
                        padding: '36px 40px',
                        marginBottom: '48px',
                    }}
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between" style={{ gap: '20px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid var(--nb-black)' }}>
                        <div>
                            <div className="flex flex-wrap items-center gap-2.5 mb-3">
                                <span className="nb-badge" style={{ background: 'var(--nb-input-bg)', padding: '5px 12px' }}>ID #{verifiedId}</span>
                                <span
                                    className="nb-badge"
                                    style={{
                                        background: result.approved ? 'var(--nb-green)' : 'var(--nb-pink)',
                                        textTransform: 'uppercase',
                                        padding: '5px 12px',
                                    }}
                                >
                                    {result.approved ? '✓ Verified on Polygon' : '⏳ Pending Mentor Approval'}
                                </span>
                            </div>

                            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">{result.title}</h3>

                            {result.approved && mentorDomainStr && (
                                <div className="mt-3 inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-black px-3.5 py-1.5" style={{ background: 'var(--nb-green)', border: '2px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                        <path d="m9 12 2 2 4-4" />
                                    </svg>
                                    Official Endorsement by {mentorDomainStr} Mentor
                                </div>
                            )}
                        </div>

                        {verifiedId !== null && (
                            <div className="p-4 text-center flex-shrink-0" style={{ background: '#FFF', border: 'var(--nb-border)', borderRadius: 'var(--nb-radius)', boxShadow: 'var(--nb-shadow-sm)' }}>
                                <QRCodeSVG
                                    value={verifyPageUrl(verifiedId)}
                                    size={104}
                                    bgColor="#ffffff"
                                    fgColor="#1A1A1A"
                                    level="M"
                                />
                                <span className="text-[10px] font-bold uppercase tracking-wider block mt-1.5">Scan for Proof</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col" style={{ gap: '14px', fontSize: '13px' }}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-2" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                            <span className="font-bold uppercase tracking-wider text-zinc-600">Student Address</span>
                            <span className="font-mono font-bold">{result.student}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-2" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                            <span className="font-bold uppercase tracking-wider text-zinc-600">IPFS CID</span>
                            <a
                                href={ipfsGatewayUrl(result.cid)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono font-bold underline hover:bg-[var(--nb-yellow)] px-1.5 py-0.5 rounded"
                            >
                                {result.cid} ↗
                            </a>
                        </div>

                        {result.approved && result.mentor !== '0x0000000000000000000000000000000000000000' && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-2" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                                <span className="font-bold uppercase tracking-wider text-zinc-600">Mentor Address</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold">{result.mentor}</span>
                                    {mentorDomainStr && (
                                        <span className="nb-badge" style={{ background: 'var(--nb-green)', fontSize: '11px', padding: '3px 8px' }}>{mentorDomainStr}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-2" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                            <span className="font-bold uppercase tracking-wider text-zinc-600">Submission Timestamp</span>
                            <span>{new Date(result.submittedAt * 1000).toLocaleString()}</span>
                        </div>

                        {result.approvedAt > 0 && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-2" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                                <span className="font-bold uppercase tracking-wider text-zinc-600">Approval Timestamp</span>
                                <span>{new Date(result.approvedAt * 1000).toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {result.cid && (
                        <div className="mt-8">
                            <h4 className="text-sm font-bold uppercase tracking-wider mb-3.5">Proof Document Preview</h4>
                            <div className="relative w-full overflow-hidden" style={{ border: 'var(--nb-border)', borderRadius: 'var(--nb-radius)', paddingTop: '56.25%', background: '#fff' }}>
                                <iframe
                                    src={ipfsGatewayUrl(result.cid)}
                                    title="Proof File"
                                    className="absolute inset-0 h-full w-full border-none"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap" style={{ marginTop: '32px', gap: '16px', paddingTop: '24px', borderTop: '2px solid var(--nb-black)' }}>
                        <a
                            href={ipfsGatewayUrl(result.cid)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="nb-btn nb-btn-primary"
                            style={{ padding: '12px 24px', fontSize: '14px' }}
                        >
                            Open Raw File on IPFS ↗
                        </a>
                        {verifiedId !== null && (
                            <button
                                className="nb-btn nb-btn-outline"
                                style={{ padding: '12px 24px', fontSize: '14px' }}
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
        <main className="w-full max-w-[860px] mx-auto" style={{ paddingBottom: '64px', paddingLeft: '20px', paddingRight: '20px' }}>
            <Header />

            <section className="relative" style={{ borderBottom: '3px solid var(--nb-black)', animation: 'fadeInUp 0.6s ease', marginBottom: '48px', paddingTop: '40px', paddingBottom: '48px' }}>
                <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold leading-tight tracking-[-2px]" style={{ marginBottom: '24px' }}>
                    Verify Work Submission
                </h1>
                <p className="max-w-[600px] text-base leading-[1.75]" style={{ color: '#555', animation: 'fadeInUp 0.6s ease 0.15s both', marginTop: '4px' }}>
                    Recruiters &amp; Organizations: enter a submission ID to audit credentials directly on the Polygon blockchain with zero intermediaries.
                </p>

                <div className="flex flex-wrap" style={{ marginTop: '32px', gap: '16px', animation: 'fadeInUp 0.6s ease 0.3s both' }}>
                    <span className="nb-chip" style={{ background: 'var(--nb-yellow)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--nb-black)', display: 'inline-block' }} />
                        On-Chain Verification
                    </span>
                    <span className="nb-chip" style={{ background: 'var(--nb-green)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--nb-black)', display: 'inline-block' }} />
                        Tamper-Proof Proofs
                    </span>
                    <span className="nb-chip" style={{ background: 'var(--nb-blue)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--nb-black)', display: 'inline-block' }} />
                        Corporate Identity Verified
                    </span>
                </div>
            </section>

            <Suspense fallback={<p className="text-sm font-bold text-center py-12">Loading blockchain verification engine...</p>}>
                <VerifyContent />
            </Suspense>
        </main>
    );
}
