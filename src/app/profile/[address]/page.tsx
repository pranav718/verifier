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
            <div className="absolute inset-0 z-[-2] min-h-[100vh] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <Header />

            <section className="relative mb-9 py-10 pb-10 border-b border-white/5 animate-[fadeInUp_0.8s_ease] before:absolute before:right-0 before:top-5 before:h-[200px] before:w-[200px] before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.04)_0%,transparent_70%)] before:pointer-events-none before:animate-[float_8s_ease-in-out_infinite] after:absolute after:-left-7 after:bottom-2.5 after:h-[120px] after:w-[120px] after:rounded-full after:bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)] after:pointer-events-none after:animate-[float_6s_ease-in-out_infinite_1s]">
                <h1 className="mb-4 font-outfit text-4xl font-black leading-tight tracking-[-2px] text-transparent bg-clip-text bg-[linear-gradient(135deg,#ffffff_0%,#d4d4d8_25%,#ffffff_50%,#a1a1aa_75%,#ffffff_100%)] bg-[length:300%_auto] animate-[gradient-shift_6s_ease_infinite] sm:text-[44px]">Blockchain Resume</h1>
                <p className="max-w-[600px] text-[15px] leading-[1.7] text-zinc-500 animate-[fadeInUp_0.8s_ease_0.2s_both]">
                    Every entry below is verified on-chain. These records are permanent,
                    tamper-proof, and independently verifiable by anyone.
                </p>
            </section>

            <div className="mt-[-16px] mb-8 overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
                <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-5">
                        <span className="font-mono text-sm tracking-[0.2px]">{address}</span>
                        <a
                            href={polygonscanAddressUrl(address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-transparent px-3.5 py-[7px] text-xs font-bold tracking-[-0.1px] text-zinc-400 backdrop-blur-sm transition-all duration-300 hover:-translate-y-px hover:border-white/25 hover:bg-white/5 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.03)]"
                        >
                            View on Polygonscan
                        </a>
                    </div>

                    <div className="grid grid-cols-3 gap-4 rounded-xl border border-white/5 bg-black/40 p-4">
                        <div className="flex flex-col items-center justify-center text-center">
                            <span className="mb-1 font-outfit text-2xl font-black text-white">{submissions.length}</span>
                            <span className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-500">Submissions</span>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center">
                            <span className="mb-1 font-outfit text-2xl font-black text-white">{approvedCount}</span>
                            <span className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-500">Verified</span>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center">
                            <span className="mb-1 font-outfit text-2xl font-black text-white">{uniqueDomains.length}</span>
                            <span className="text-[10px] font-semibold uppercase tracking-[0.5px] text-zinc-500">Organizations</span>
                        </div>
                    </div>

                    {uniqueDomains.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {uniqueDomains.map(d => (
                                <span key={d} className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-500">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                        <path d="m9 12 2 2 4-4" />
                                    </svg>
                                    {d}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {loading && <p className="text-sm leading-[1.7] text-zinc-600" style={{ marginTop: 24 }}>Loading on-chain data...</p>}
            {error && <div className="rounded-lg border border-red-500/10 bg-white/5 p-4 text-[13px] font-medium leading-[1.6] text-red-500 backdrop-blur-md animate-[fadeInUp_0.4s_ease]" style={{ marginTop: 24 }}>{error}</div>}

            {!loading && submissions.length === 0 && (
                <p className="text-sm leading-[1.7] text-zinc-600" style={{ marginTop: 24 }}>No submissions found for this address.</p>
            )}

            <div className="mt-8 flex flex-col gap-4">
                {submissions.map(sub => {
                    const statusConfig = sub.approved
                        ? '!border-green-500/20 hover:!border-green-500/35 hover:!shadow-[0_12px_40px_rgba(0,0,0,0.4),_0_0_30px_rgba(34,197,94,0.05)] text-green-500'
                        : '!border-yellow-400/15 hover:!border-yellow-400/30 hover:!shadow-[0_12px_40px_rgba(0,0,0,0.4),_0_0_30px_rgba(250,204,21,0.03)] text-yellow-400';
                        
                    return (
                        <div key={sub.id} className={`relative overflow-hidden rounded-[14px] border border-white/5 bg-white/5 p-5 backdrop-blur-md transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] animate-[fadeInUp_0.5s_ease_both] before:absolute before:inset-0 before:h-px before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)] before:opacity-0 before:transition-opacity before:duration-300 hover:-translate-y-0.5 hover:border-white/10 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4),_0_0_30px_rgba(255,255,255,0.02)] hover:before:opacity-1 ${statusConfig}`}>
                            <div className="flex items-center justify-between">
                                <div style={{ flex: 1 }}>
                                    <div className="font-outfit text-[15px] font-extrabold tracking-[-0.2px] text-white">{sub.title}</div>
                                    {sub.approved && sub.mentorDomainStr && (
                                        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-500">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                                <path d="m9 12 2 2 4-4" />
                                            </svg>
                                            Verified by {sub.mentorDomainStr}
                                        </div>
                                    )}
                                    <div className={`mt-1.5 text-xs font-bold tracking-[0.2px] ${sub.approved ? 'text-green-500' : 'text-yellow-400'}`}>
                                        {sub.approved ? 'Approved' : 'Pending'}
                                    </div>
                                </div>
                                {sub.approved && (
                                    <div className="flex flex-col items-center gap-2 rounded-[14px] border border-white/10 bg-black/40 !p-2 backdrop-blur-md">
                                        <QRCodeSVG value={verifyPageUrl(sub.id)} size={60} bgColor="transparent" fgColor="#ffffff" level="M" />
                                    </div>
                                )}
                            </div>

                            <div className="mt-3 flex flex-col gap-1.5 border-t border-white/5 pt-3 text-xs text-zinc-500">
                                <div>
                                    CID:{' '}
                                    <a href={ipfsGatewayUrl(sub.cid)} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] tracking-[0.2px] text-zinc-400 underline decoration-white/10 underline-offset-2 transition-colors duration-300 hover:text-white hover:decoration-white/30">
                                        {sub.cid.slice(0, 20)}...
                                    </a>
                                </div>
                                <div>Submitted: {new Date(sub.submittedAt * 1000).toLocaleString()}</div>
                                {sub.approvedAt > 0 && (
                                    <div>Approved: {new Date(sub.approvedAt * 1000).toLocaleString()}</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}
