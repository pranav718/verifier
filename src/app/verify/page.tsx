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
            setError(err instanceof Error ? err.message : 'Failed to fetch submission');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        doVerify(parseInt(submissionId));
    };

    return (
        <>
            <section className="mt-2 animate-[fadeInUp_0.8s_ease_0.4s_both]">
                <div className="group relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all duration-400 hover:border-white/10 hover:shadow-[0_8px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] before:absolute before:-left-full before:top-0 before:h-px before:w-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] before:transition-[left] before:duration-600 hover:before:left-full">
                    <h2 className="mb-6 font-outfit text-lg font-extrabold tracking-[-0.4px] text-white">Look Up Submission</h2>
                    <form className="flex flex-col gap-[22px]" onSubmit={handleVerify}>
                        <label className="flex flex-col text-[13px] font-medium tracking-normal text-zinc-500">
                            Submission ID
                            <input
                                className="mt-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-zinc-200 backdrop-blur-sm transition-all duration-300 placeholder-zinc-700 focus:border-white/25 focus:bg-[rgba(255,255,255,0.05)] focus:outline-none focus:ring-[3px] focus:ring-white/5 disabled:opacity-50"
                                type="number"
                                min="0"
                                value={submissionId}
                                onChange={e => setSubmissionId(e.target.value)}
                                placeholder="e.g. 0"
                                disabled={loading}
                            />
                        </label>

                        {error && <div className="rounded-lg border border-red-500/10 bg-white/5 p-4 text-[13px] font-medium leading-[1.6] text-red-500 backdrop-blur-md animate-[fadeInUp_0.4s_ease]">{error}</div>}

                        <div className="mt-3 flex gap-3">
                            <button className="relative inline-flex overflow-hidden items-center gap-1.5 rounded-lg border-none bg-white px-5 py-2.5 text-[13px] font-bold tracking-[-0.1px] text-black shadow-[0_0_20px_rgba(255,255,255,0.1),_0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-300 before:absolute before:-left-full before:top-0 before:h-full before:w-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] before:transition-[left] before:duration-500 hover:before:left-full hover:bg-zinc-100 hover:-translate-y-px hover:shadow-[0_0_30px_rgba(255,255,255,0.2),_0_4px_16px_rgba(0,0,0,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-35" type="submit" disabled={loading}>
                                {loading ? 'Fetching...' : 'Verify'}
                            </button>
                        </div>
                    </form>
                </div>

                {result && (
                    <div className={`relative mt-4 overflow-hidden rounded-[14px] border border-white/5 bg-white/5 p-5 backdrop-blur-md transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] animate-[fadeInUp_0.5s_ease_both] before:absolute before:inset-0 before:h-px before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)] before:opacity-0 before:transition-opacity before:duration-300 hover:border-white/10 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4),_0_0_30px_rgba(255,255,255,0.02)] hover:before:opacity-1 ${result.approved ? '!border-green-500/20 hover:!border-green-500/35 hover:!shadow-[0_12px_40px_rgba(0,0,0,0.4),_0_0_30px_rgba(34,197,94,0.05)]' : '!border-yellow-400/15 hover:!border-yellow-400/30 hover:!shadow-[0_12px_40px_rgba(0,0,0,0.4),_0_0_30px_rgba(250,204,21,0.03)]'}`}>
                        <div className="mb-8 flex flex-row items-center justify-between gap-5 border-b border-white/5 pb-6 text-left">
                            <div>
                                <h3 className="font-outfit text-[15px] font-extrabold tracking-[-0.2px] text-white">{result.title}</h3>
                                {result.approved && mentorDomainStr && (
                                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-500">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                            <path d="m9 12 2 2 4-4" />
                                        </svg>
                                        Verified by {mentorDomainStr}
                                    </div>
                                )}
                            </div>
                            {verifiedId !== null && (
                                <div className="flex flex-col items-center gap-2 rounded-[14px] border border-white/10 bg-black/40 p-3 backdrop-blur-md">
                                    <QRCodeSVG
                                        value={verifyPageUrl(verifiedId)}
                                        size={100}
                                        bgColor="transparent"
                                        fgColor="#ffffff"
                                        level="M"
                                    />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-zinc-500">Scan to Verify</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5 rounded-xl border border-white/5 bg-[rgba(255,255,255,0.01)] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:bg-transparent sm:px-0 sm:py-2">
                                <span className="text-xs font-semibold uppercase tracking-[0.5px] text-zinc-500">Student Address</span>
                                <span className="font-mono text-[11px] tracking-[0.2px]">{result.student}</span>
                            </div>

                            <div className="flex flex-col gap-1.5 rounded-xl border border-white/5 bg-[rgba(255,255,255,0.01)] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:bg-transparent sm:px-0 sm:py-2">
                                <span className="text-xs font-semibold uppercase tracking-[0.5px] text-zinc-500">IPFS CID</span>
                                <a
                                    href={ipfsGatewayUrl(result.cid)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-[11px] tracking-[0.2px] text-zinc-400 underline decoration-white/10 underline-offset-2 transition-colors duration-300 hover:text-white hover:decoration-white/30"
                                >
                                    {result.cid}
                                </a>
                            </div>

                            <div className="flex flex-col gap-1.5 rounded-xl border border-white/5 bg-[rgba(255,255,255,0.01)] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:bg-transparent sm:px-0 sm:py-2">
                                <span className="text-xs font-semibold uppercase tracking-[0.5px] text-zinc-500">Approval Status</span>
                                <span className={result.approved ? 'inline-block rounded-md border border-green-500/20 bg-green-500/10 px-2 py-1 text-xs font-bold text-green-500' : 'inline-block rounded-md border border-yellow-400/20 bg-yellow-400/10 px-2 py-1 text-xs font-bold text-yellow-500'}>
                                    {result.approved ? 'Approved' : 'Pending'}
                                </span>
                            </div>

                            {result.approved && result.mentor !== '0x0000000000000000000000000000000000000000' && (
                                <div className="flex flex-col gap-1.5 rounded-xl border border-white/5 bg-[rgba(255,255,255,0.01)] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:bg-transparent sm:px-0 sm:py-2">
                                    <span className="text-xs font-semibold uppercase tracking-[0.5px] text-zinc-500">Mentor Address</span>
                                    <span className="font-mono text-[11px] tracking-[0.2px]">{result.mentor}</span>
                                    {mentorDomainStr && (
                                        <span className="ml-2 inline-block rounded border border-green-500/20 bg-green-500/10 px-1.5 py-0.5 text-[10px] font-bold text-green-500">{mentorDomainStr}</span>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5 rounded-xl border border-white/5 bg-[rgba(255,255,255,0.01)] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:bg-transparent sm:px-0 sm:py-2">
                                <span className="text-xs font-semibold uppercase tracking-[0.5px] text-zinc-500">Submitted At</span>
                                <span className="text-[13px]">{new Date(result.submittedAt * 1000).toLocaleString()}</span>
                            </div>

                            {result.approvedAt > 0 && (
                                <div className="flex flex-col gap-1.5 rounded-xl border border-white/5 bg-[rgba(255,255,255,0.01)] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:bg-transparent sm:px-0 sm:py-2">
                                    <span className="text-xs font-semibold uppercase tracking-[0.5px] text-zinc-500">Approved At</span>
                                    <span className="text-[13px]">{new Date(result.approvedAt * 1000).toLocaleString()}</span>
                                </div>
                            )}
                        </div>

                        {result.cid && (
                            <div className="mt-8 animate-[fadeInUp_0.8s_ease_0.2s]">
                                <h4 className="mb-4 font-outfit text-[15px] font-extrabold tracking-[-0.2px] text-white">Proof File Preview</h4>
                                <div className="relative w-full overflow-hidden rounded-[14px] border border-white/10 bg-white/5 pt-[56.25%]">
                                    <iframe
                                        src={ipfsGatewayUrl(result.cid)}
                                        title="Proof File"
                                        className="absolute inset-0 h-full w-full border-none"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex gap-3 border-t border-white/5 pt-6">
                            <a
                                href={ipfsGatewayUrl(result.cid)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-transparent px-3.5 py-[7px] text-xs font-bold tracking-[-0.1px] text-zinc-400 backdrop-blur-sm transition-all duration-300 hover:-translate-y-px hover:border-white/25 hover:bg-white/5 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.03)]"
                            >
                                View on IPFS
                            </a>
                            {verifiedId !== null && (
                                <button
                                    className="relative inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-transparent px-3.5 py-[7px] text-xs font-bold tracking-[-0.1px] text-zinc-400 backdrop-blur-sm transition-all duration-300 hover:-translate-y-px hover:border-white/25 hover:bg-white/5 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.03)]"
                                    onClick={() => navigator.clipboard.writeText(verifyPageUrl(verifiedId))}
                                >
                                    Copy Shareable Link
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </>
    );
}

export default function VerifyPage() {
    return (
        <main className="w-full max-w-[860px] mx-auto">
            <div className="absolute inset-0 z-[-2] min-h-[100vh] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <Header />

            <section className="relative mb-9 py-10 pb-10 border-b border-white/5 animate-[fadeInUp_0.8s_ease] before:absolute before:right-0 before:top-5 before:h-[200px] before:w-[200px] before:rounded-full before:bg-[radial-gradient(circle,rgba(255,255,255,0.04)_0%,transparent_70%)] before:pointer-events-none before:animate-[float_8s_ease-in-out_infinite] after:absolute after:-left-7 after:bottom-2.5 after:h-[120px] after:w-[120px] after:rounded-full after:bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)] after:pointer-events-none after:animate-[float_6s_ease-in-out_infinite_1s]">
                <h1 className="mb-4 font-outfit text-4xl font-black leading-tight tracking-[-2px] text-transparent bg-clip-text bg-[linear-gradient(135deg,#ffffff_0%,#d4d4d8_25%,#ffffff_50%,#a1a1aa_75%,#ffffff_100%)] bg-[length:300%_auto] animate-[gradient-shift_6s_ease_infinite] sm:text-[44px]">Verify Submission</h1>
                <p className="max-w-[600px] text-[15px] leading-[1.7] text-zinc-500 animate-[fadeInUp_0.8s_ease_0.2s_both]">
                    Recruiters: enter a submission ID to verify work credentials
                    directly from the blockchain no intermediaries needed.
                </p>

                <div className="mt-6 flex flex-wrap gap-2.5 animate-[fadeInUp_0.8s_ease_0.4s_both]">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-zinc-400 backdrop-blur-md transition-all duration-300 hover:-translate-y-px hover:border-white/20 hover:bg-[rgba(255,255,255,0.06)] hover:text-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-[linear-gradient(135deg,#fff,#71717a)] animate-[pulse-glow_3s_ease-in-out_infinite]" />
                        On-Chain Verification
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-zinc-400 backdrop-blur-md transition-all duration-300 hover:-translate-y-px hover:border-white/20 hover:bg-[rgba(255,255,255,0.06)] hover:text-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-[linear-gradient(135deg,#fff,#71717a)] animate-[pulse-glow_3s_ease-in-out_infinite]" />
                        Tamper-Proof
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-zinc-400 backdrop-blur-md transition-all duration-300 hover:-translate-y-px hover:border-white/20 hover:bg-[rgba(255,255,255,0.06)] hover:text-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-[linear-gradient(135deg,#fff,#71717a)] animate-[pulse-glow_3s_ease-in-out_infinite]" />
                        Corporate Identity Verified
                    </span>
                </div>
            </section>

            <Suspense fallback={<p className="text-sm leading-[1.7] text-zinc-600">Loading...</p>}>
                <VerifyContent />
            </Suspense>
        </main>
    );
}
