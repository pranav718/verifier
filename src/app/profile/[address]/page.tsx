'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import Header from '../../../components/Header';
import {
    getStudentSubmissionIds,
    getSubmission,
    getMentorDomain,
    ipfsGatewayUrl,
    verifyPageUrl,
    polygonscanAddressUrl,
    OnChainSubmission
} from '../../../lib/contract';

interface ProfileSubmission extends OnChainSubmission {
    id: number;
    mentorDomainStr: string;
}

export default function ProfilePage() {
    const params = useParams();
    const address = params.address as string;
    const [submissions, setSubmissions] = useState<ProfileSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (address) loadProfile();
    }, [address]);

    const loadProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const ids = await getStudentSubmissionIds(address);
            const items: ProfileSubmission[] = [];

            for (const id of ids) {
                const sub = await getSubmission(id);
                let mentorDomainStr = '';
                if (sub.approved && sub.mentor !== '0x0000000000000000000000000000000000000000') {
                    try {
                        mentorDomainStr = await getMentorDomain(sub.mentor);
                    } catch {
                    }
                }
                items.push({ ...sub, id, mentorDomainStr });
            }

            setSubmissions(items);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const approvedCount = submissions.filter(s => s.approved).length;
    const uniqueDomains = [...new Set(submissions.filter(s => s.mentorDomainStr).map(s => s.mentorDomainStr))];

    return (
        <main className="w-full max-w-[860px] mx-auto">
            <Header />

            {/* ── Profile Hero ── */}
            <section className="relative mb-10 py-10 pb-10" style={{ borderBottom: '3px solid var(--nb-black)', animation: 'fadeInUp 0.6s ease' }}>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="nb-badge" style={{ background: 'var(--nb-yellow)' }}>On-Chain Portfolio</span>
                    <span className="nb-badge" style={{ background: 'var(--nb-green)' }}>Polygon Provenance</span>
                </div>

                <h1 className="mb-4 text-4xl sm:text-5xl font-bold leading-tight tracking-[-2px]">
                    Blockchain Resume
                </h1>
                <p className="max-w-[580px] text-[15px] leading-[1.7]" style={{ color: '#666', animation: 'fadeInUp 0.6s ease 0.15s both' }}>
                    Every credential below is immutable and sealed onto the blockchain. Verified by corporate mentors, auditable by anyone worldwide.
                </p>
            </section>

            {/* ── Profile Identity Card ── */}
            <div className="nb-card p-6 sm:p-8 mb-8" style={{ animation: 'fadeInUp 0.6s ease 0.2s both' }}>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4" style={{ borderBottom: '2px solid var(--nb-black)' }}>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1">Student Wallet Address</span>
                            <span className="font-mono text-sm sm:text-base font-bold break-all">{address}</span>
                        </div>
                        <a
                            href={polygonscanAddressUrl(address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="nb-btn nb-btn-outline"
                            style={{ padding: '6px 14px', fontSize: '12px' }}
                        >
                            View on Polygonscan ↗
                        </a>
                    </div>

                    {/* ── Stats Grid ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-5 text-center" style={{ background: 'var(--nb-yellow)', border: 'var(--nb-border)', borderRadius: 'var(--nb-radius)', boxShadow: 'var(--nb-shadow-sm)' }}>
                            <span className="font-bold text-3xl block leading-none mb-1">{submissions.length}</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-black">Total Submissions</span>
                        </div>
                        <div className="p-5 text-center" style={{ background: 'var(--nb-green)', border: 'var(--nb-border)', borderRadius: 'var(--nb-radius)', boxShadow: 'var(--nb-shadow-sm)' }}>
                            <span className="font-bold text-3xl block leading-none mb-1">{approvedCount}</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-black">Verified Credentials</span>
                        </div>
                        <div className="p-5 text-center" style={{ background: 'var(--nb-blue)', border: 'var(--nb-border)', borderRadius: 'var(--nb-radius)', boxShadow: 'var(--nb-shadow-sm)' }}>
                            <span className="font-bold text-3xl block leading-none mb-1">{uniqueDomains.length}</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-black">Endorsing Companies</span>
                        </div>
                    </div>

                    {uniqueDomains.length > 0 && (
                        <div className="pt-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-2">Verified Affiliations</span>
                            <div className="flex flex-wrap gap-2">
                                {uniqueDomains.map(d => (
                                    <span key={d} className="nb-badge" style={{ background: 'var(--nb-green)', padding: '6px 12px' }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                            <path d="m9 12 2 2 4-4" />
                                        </svg>
                                        Verified by {d}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {loading && <p className="text-sm font-bold text-center py-8">Loading blockchain profile records...</p>}
            {error && <div className="nb-alert-error my-4">{error}</div>}

            {!loading && submissions.length === 0 && (
                <div className="nb-card p-8 text-center my-4">
                    <p className="text-sm text-zinc-600 font-bold">No on-chain submissions found for this wallet address.</p>
                </div>
            )}

            <div className="flex flex-col gap-5 mt-8 mb-12">
                {submissions.map(sub => {
                    return (
                        <div
                            key={sub.id}
                            className="nb-card p-6 sm:p-7"
                            style={{
                                animation: 'fadeInUp 0.4s ease both',
                                background: sub.approved ? '#FAFFF9' : '#FFFDF5',
                            }}
                        >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4" style={{ borderBottom: '2px solid var(--nb-black)' }}>
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                        <span className="nb-badge" style={{ background: 'var(--nb-input-bg)' }}>Record #{sub.id}</span>
                                        <span
                                            className="nb-badge"
                                            style={{
                                                background: sub.approved ? 'var(--nb-green)' : 'var(--nb-pink)',
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {sub.approved ? '✓ Verified on Chain' : '⏳ Pending Approval'}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold tracking-tight">{sub.title}</h3>

                                    {sub.approved && sub.mentorDomainStr && (
                                        <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-black px-2.5 py-1" style={{ background: 'var(--nb-green)', border: '2px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                                <path d="m9 12 2 2 4-4" />
                                            </svg>
                                            Verified by {sub.mentorDomainStr} Mentor
                                        </div>
                                    )}
                                </div>

                                {sub.approved && (
                                    <div className="p-2 text-center" style={{ background: '#FFF', border: 'var(--nb-border)', borderRadius: 'var(--nb-radius)', boxShadow: 'var(--nb-shadow-sm)' }}>
                                        <QRCodeSVG value={verifyPageUrl(sub.id)} size={64} bgColor="#ffffff" fgColor="#1A1A1A" level="M" />
                                        <span className="text-[9px] font-bold uppercase tracking-wider block mt-0.5">Scan Proof</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <div className="p-2.5" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                                    <span className="font-bold uppercase tracking-wider text-zinc-600 block mb-0.5">IPFS Artifact</span>
                                    <a href={ipfsGatewayUrl(sub.cid)} target="_blank" rel="noopener noreferrer" className="font-mono font-bold underline hover:bg-[var(--nb-yellow)]">
                                        {sub.cid.slice(0, 16)}...{sub.cid.slice(-6)} ↗
                                    </a>
                                </div>

                                <div className="p-2.5" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                                    <span className="font-bold uppercase tracking-wider text-zinc-600 block mb-0.5">Submission Date</span>
                                    <span>{new Date(sub.submittedAt * 1000).toLocaleString()}</span>
                                </div>

                                {sub.mentor !== '0x0000000000000000000000000000000000000000' && (
                                    <div className="p-2.5" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                                        <span className="font-bold uppercase tracking-wider text-zinc-600 block mb-0.5">Approved By</span>
                                        <span className="font-mono font-bold">{sub.mentor.slice(0, 6)}...{sub.mentor.slice(-4)}</span>
                                    </div>
                                )}

                                {sub.approvedAt > 0 && (
                                    <div className="p-2.5" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                                        <span className="font-bold uppercase tracking-wider text-zinc-600 block mb-0.5">Approval Date</span>
                                        <span>{new Date(sub.approvedAt * 1000).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}
