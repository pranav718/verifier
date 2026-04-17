'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import {
    approveWork,
    getSubmission,
    getSubmissionCount,
    getMentorDomain,
    isMentorVerified,
    selfRegisterMentor,
    ipfsGatewayUrl,
    OnChainSubmission
} from '../lib/contract';

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

    const [isVerified, setIsVerified] = useState(false);
    const [mentorDomain, setMentorDomain] = useState('');
    const [checkingVerification, setCheckingVerification] = useState(false);

    const [showRegister, setShowRegister] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [registering, setRegistering] = useState(false);
    const [registerError, setRegisterError] = useState<string | null>(null);

    useEffect(() => {
        if (!account) {
            setIsVerified(false);
            setMentorDomain('');
            return;
        }
        checkMentorStatus();
    }, [account]);

    const checkMentorStatus = async () => {
        if (!account) return;
        setCheckingVerification(true);
        try {
            const verified = await isMentorVerified(account);
            setIsVerified(verified);
            if (verified) {
                const domain = await getMentorDomain(account);
                setMentorDomain(domain);
            }
        } catch {
            setIsVerified(false);
        } finally {
            setCheckingVerification(false);
        }
    };

    const handleSendOtp = async () => {
        if (!emailInput.includes('@') || !emailInput.includes('.')) {
            setRegisterError('Enter a valid corporate email address.');
            return;
        }
        setRegisterError(null);
        setRegistering(true);

        try {
            const res = await fetch('/api/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send code');
            setOtpSent(true);
        } catch (err: unknown) {
            setRegisterError(err instanceof Error ? err.message : 'Failed to send verification code');
        } finally {
            setRegistering(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otpInput.length < 4) {
            setRegisterError('Enter the verification code.');
            return;
        }

        setRegistering(true);
        setRegisterError(null);

        try {
            const verifyRes = await fetch('/api/verify-email', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput, code: otpInput }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Invalid code');

            const domain = verifyData.domain;
            await selfRegisterMentor(domain);
            setIsVerified(true);
            setMentorDomain(domain);
            setShowRegister(false);
            setOtpSent(false);
            setEmailInput('');
            setOtpInput('');
            setSuccessMsg(`Verified as ${domain} mentor on-chain!`);
        } catch (err: unknown) {
            setRegisterError(err instanceof Error ? err.message : 'Verification failed');
        } finally {
            setRegistering(false);
        }
    };

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
            await fetchSubmissions();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Approval failed');
        } finally {
            setApprovingId(null);
        }
    };

    if (!account) {
        return (
            <section className="mt-2 animate-[fadeInUp_0.8s_ease_0.4s_both]">
                <div className="group relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all duration-400 hover:border-white/10 hover:shadow-[0_8px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] before:absolute before:-left-full before:top-0 before:h-px before:w-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] before:transition-[left] before:duration-600 hover:before:left-full">
                    <h2 className="mb-6 font-outfit text-lg font-extrabold tracking-[-0.4px] text-white">Mentor Verification</h2>
                    <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4 text-[13px] font-medium leading-[1.6] text-zinc-400 backdrop-blur-md animate-[fadeInUp_0.4s_ease]">
                        Connect your MetaMask wallet to access the mentor panel.
                    </div>
                </div>
            </section>
        );
    }

    if (checkingVerification) {
        return (
            <section className="mt-2 animate-[fadeInUp_0.8s_ease_0.4s_both]">
                <div className="group relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all duration-400 hover:border-white/10 hover:shadow-[0_8px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] before:absolute before:-left-full before:top-0 before:h-px before:w-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] before:transition-[left] before:duration-600 hover:before:left-full">
                    <h2 className="mb-6 font-outfit text-lg font-extrabold tracking-[-0.4px] text-white">Mentor Verification</h2>
                    <p className="text-sm leading-[1.7] text-zinc-600">Checking verification status...</p>
                </div>
            </section>
        );
    }

    if (!isVerified && !showRegister) {
        return (
            <section className="mt-2 animate-[fadeInUp_0.8s_ease_0.4s_both]">
                <div className="group relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all duration-400 hover:border-white/10 hover:shadow-[0_8px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] before:absolute before:-left-full before:top-0 before:h-px before:w-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] before:transition-[left] before:duration-600 hover:before:left-full">
                    <h2 className="mb-6 font-outfit text-lg font-extrabold tracking-[-0.4px] text-white">Mentor Verification Required</h2>
                    <p className="text-sm leading-[1.7] text-zinc-600 mb-5">
                        You must verify your corporate identity before approving submissions.
                        This ensures only real employees from verified organizations can act as mentors.
                    </p>
                    <button className="relative inline-flex overflow-hidden items-center gap-1.5 rounded-lg border-none bg-white px-5 py-2.5 text-[13px] font-bold tracking-[-0.1px] text-black shadow-[0_0_20px_rgba(255,255,255,0.1),_0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-300 before:absolute before:-left-full before:top-0 before:h-full before:w-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] before:transition-[left] before:duration-500 hover:before:left-full hover:bg-zinc-100 hover:-translate-y-px hover:shadow-[0_0_30px_rgba(255,255,255,0.2),_0_4px_16px_rgba(0,0,0,0.3)] active:translate-y-0" onClick={() => setShowRegister(true)}>
                        Verify Corporate Identity
                    </button>
                </div>
            </section>
        );
    }

    if (!isVerified && showRegister) {
        return (
            <section className="mt-2 animate-[fadeInUp_0.8s_ease_0.4s_both]">
                <div className="group relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all duration-400 hover:border-white/10 hover:shadow-[0_8px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] before:absolute before:-left-full before:top-0 before:h-px before:w-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] before:transition-[left] before:duration-600 hover:before:left-full">
                    <h2 className="mb-6 font-outfit text-lg font-extrabold tracking-[-0.4px] text-white">Corporate Email Verification</h2>

                    {!otpSent ? (
                        <div className="flex flex-col gap-[22px]">
                            <label className="flex flex-col text-[13px] font-medium tracking-normal text-zinc-500">
                                Corporate Email Address
                                <input
                                    className="mt-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-zinc-200 backdrop-blur-sm transition-all duration-300 placeholder-zinc-700 focus:border-white/25 focus:bg-[rgba(255,255,255,0.05)] focus:outline-none focus:ring-[3px] focus:ring-white/5 disabled:opacity-50"
                                    type="email"
                                    value={emailInput}
                                    onChange={e => setEmailInput(e.target.value)}
                                    placeholder="name@company.com"
                                    disabled={registering}
                                />
                            </label>
                            <p className="text-xs leading-[1.7] text-zinc-600">
                                We will send a verification code to this email to confirm your affiliation.
                            </p>
                            {registerError && <div className="rounded-lg border border-red-500/10 bg-white/5 p-4 text-[13px] font-medium leading-[1.6] text-red-500 backdrop-blur-md animate-[fadeInUp_0.4s_ease]">{registerError}</div>}
                            <div className="mt-3 flex gap-3">
                                <button className="relative inline-flex overflow-hidden items-center gap-1.5 rounded-lg border-none bg-white px-5 py-2.5 text-[13px] font-bold tracking-[-0.1px] text-black shadow-[0_0_20px_rgba(255,255,255,0.1),_0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-300 before:absolute before:-left-full before:top-0 before:h-full before:w-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] before:transition-[left] before:duration-500 hover:before:left-full hover:bg-zinc-100 hover:-translate-y-px hover:shadow-[0_0_30px_rgba(255,255,255,0.2),_0_4px_16px_rgba(0,0,0,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-35" onClick={handleSendOtp} disabled={registering}>
                                    Send Verification Code
                                </button>
                                <button className="relative inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-transparent px-5 py-2.5 text-[13px] font-bold tracking-[-0.1px] text-zinc-400 backdrop-blur-sm transition-all duration-300 hover:-translate-y-px hover:border-white/25 hover:bg-white/5 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] disabled:cursor-not-allowed disabled:opacity-35" onClick={() => { setShowRegister(false); setRegisterError(null); }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-[22px]">
                            <div className="mb-2 rounded-lg border border-green-500/10 bg-white/5 p-4 text-[13px] font-medium leading-[1.6] text-green-500 backdrop-blur-md animate-[fadeInUp_0.4s_ease]">
                                Verification code sent to {emailInput}
                            </div>
                            <label className="flex flex-col text-[13px] font-medium tracking-normal text-zinc-500">
                                Verification Code
                                <input
                                    className="mt-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-zinc-200 backdrop-blur-sm transition-all duration-300 placeholder-zinc-700 focus:border-white/25 focus:bg-[rgba(255,255,255,0.05)] focus:outline-none focus:ring-[3px] focus:ring-white/5 disabled:opacity-50"
                                    type="text"
                                    value={otpInput}
                                    onChange={e => setOtpInput(e.target.value)}
                                    placeholder="Enter code"
                                    disabled={registering}
                                />
                            </label>
                            {registerError && <div className="rounded-lg border border-red-500/10 bg-white/5 p-4 text-[13px] font-medium leading-[1.6] text-red-500 backdrop-blur-md animate-[fadeInUp_0.4s_ease]">{registerError}</div>}
                            <div className="mt-3 flex gap-3">
                                <button className="relative inline-flex overflow-hidden items-center gap-1.5 rounded-lg border-none bg-white px-5 py-2.5 text-[13px] font-bold tracking-[-0.1px] text-black shadow-[0_0_20px_rgba(255,255,255,0.1),_0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-300 before:absolute before:-left-full before:top-0 before:h-full before:w-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] before:transition-[left] before:duration-500 hover:before:left-full hover:bg-zinc-100 hover:-translate-y-px hover:shadow-[0_0_30px_rgba(255,255,255,0.2),_0_4px_16px_rgba(0,0,0,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-35" onClick={handleVerifyOtp} disabled={registering}>
                                    {registering ? 'Registering on Blockchain...' : 'Verify & Register'}
                                </button>
                                <button className="relative inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-transparent px-5 py-2.5 text-[13px] font-bold tracking-[-0.1px] text-zinc-400 backdrop-blur-sm transition-all duration-300 hover:-translate-y-px hover:border-white/25 hover:bg-white/5 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] disabled:cursor-not-allowed disabled:opacity-35" onClick={() => { setOtpSent(false); setRegisterError(null); }}>
                                    Back
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        );
    }
    return (
        <section className="mt-2 animate-[fadeInUp_0.8s_ease_0.4s_both]">
            <div className="group relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all duration-400 hover:border-white/10 hover:shadow-[0_8px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] before:absolute before:-left-full before:top-0 before:h-px before:w-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] before:transition-[left] before:duration-600 hover:before:left-full">
                <h2 className="mb-6 font-outfit text-lg font-extrabold tracking-[-0.4px] text-white">Approve Submissions</h2>

                <div className="mb-4 flex">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-500">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                            <path d="m9 12 2 2 4-4" />
                        </svg>
                        Verified Mentor — {mentorDomain}
                    </div>
                </div>

                <button
                    className="relative inline-flex overflow-hidden items-center gap-1.5 rounded-lg border-none bg-white px-5 py-2.5 text-[13px] font-bold tracking-[-0.1px] text-black shadow-[0_0_20px_rgba(255,255,255,0.1),_0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-300 before:absolute before:-left-full before:top-0 before:h-full before:w-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] before:transition-[left] before:duration-500 hover:before:left-full hover:bg-zinc-100 hover:-translate-y-px hover:shadow-[0_0_30px_rgba(255,255,255,0.2),_0_4px_16px_rgba(0,0,0,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-35 mt-4"
                    onClick={fetchSubmissions}
                    disabled={loadingList}
                >
                    {loadingList ? 'Loading...' : 'Load Submissions from Blockchain'}
                </button>

                {error && <div className="mt-3.5 rounded-lg border border-red-500/10 bg-white/5 p-4 text-[13px] font-medium leading-[1.6] text-red-500 backdrop-blur-md animate-[fadeInUp_0.4s_ease]">{error}</div>}
                {successMsg && <div className="mt-3.5 rounded-lg border border-green-500/10 bg-white/5 p-4 text-[13px] font-medium leading-[1.6] text-green-500 backdrop-blur-md animate-[fadeInUp_0.4s_ease]">{successMsg}</div>}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.01)] p-7 backdrop-blur-md">
                <h3 className="mb-4 font-outfit text-[17px] font-extrabold tracking-[-0.3px] text-white">All On-Chain Submissions</h3>

                {submissions.length === 0 && !loadingList && (
                    <p className="text-sm leading-[1.7] text-zinc-600">Click above to load submissions from the blockchain.</p>
                )}

                {submissions.map(sub => {
                    const statusConfig = sub.approved
                        ? '!border-green-500/20 hover:!border-green-500/35 hover:!shadow-[0_12px_40px_rgba(0,0,0,0.4),_0_0_30px_rgba(34,197,94,0.05)] text-green-500'
                        : '!border-yellow-400/15 hover:!border-yellow-400/30 hover:!shadow-[0_12px_40px_rgba(0,0,0,0.4),_0_0_30px_rgba(250,204,21,0.03)] text-yellow-400';
                        
                    return (
                        <div key={sub.id} className={`relative mt-3.5 overflow-hidden rounded-[14px] border border-white/5 bg-white/5 p-5 backdrop-blur-md transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] animate-[fadeInUp_0.5s_ease_both] before:absolute before:inset-0 before:h-px before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)] before:opacity-0 before:transition-opacity before:duration-300 hover:-translate-y-0.5 hover:border-white/10 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4),_0_0_30px_rgba(255,255,255,0.02)] hover:before:opacity-1 ${statusConfig}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-outfit text-[15px] font-extrabold tracking-[-0.2px] text-white">{sub.title}</div>
                                    <div className="mt-1 text-xs text-zinc-500 w-full flex gap-1">
                                        Student: <span className="font-mono text-[11px] tracking-[0.2px]">{sub.student.slice(0, 6)}...{sub.student.slice(-4)}</span>
                                    </div>
                                    <div className={`mt-1.5 text-xs font-bold tracking-[0.2px] ${sub.approved ? 'text-green-500' : 'text-yellow-400'}`}>
                                        {sub.approved ? 'Approved' : 'Pending'}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {!sub.approved && account && (
                                        <button
                                            className="relative inline-flex overflow-hidden items-center gap-1.5 rounded-lg border-none bg-white px-3.5 py-[7px] text-xs font-bold tracking-[-0.1px] text-black shadow-[0_0_20px_rgba(255,255,255,0.1),_0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-300 before:absolute before:-left-full before:top-0 before:h-full before:w-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] before:transition-[left] before:duration-500 hover:before:left-full hover:bg-zinc-100 hover:-translate-y-px hover:shadow-[0_0_30px_rgba(255,255,255,0.2),_0_4px_16px_rgba(0,0,0,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-35"
                                            onClick={() => handleApprove(sub.id)}
                                            disabled={approvingId === sub.id}
                                        >
                                            {approvingId === sub.id ? 'Approving...' : 'Approve'}
                                        </button>
                                    )}
                                    {sub.approved && <div className="inline-flex items-center rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-1 font-outfit text-[11px] font-bold tracking-[0.2px] text-green-500 uppercase">Approved</div>}
                                </div>
                            </div>

                            <div className="mt-3 flex flex-col gap-1.5 border-t border-white/5 pt-3 text-xs text-zinc-500">
                                <div>
                                    CID:{' '}
                                    <a href={ipfsGatewayUrl(sub.cid)} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] tracking-[0.2px] text-zinc-400 underline decoration-white/10 underline-offset-2 transition-colors duration-300 hover:text-white hover:decoration-white/30">
                                        {sub.cid.slice(0, 20)}...
                                    </a>
                                </div>
                                {sub.mentor !== '0x0000000000000000000000000000000000000000' && (
                                    <div>Mentor: <span className="font-mono text-[11px] tracking-[0.2px]">{sub.mentor.slice(0, 6)}...{sub.mentor.slice(-4)}</span></div>
                                )}
                                <div>Submitted: {new Date(sub.submittedAt * 1000).toLocaleString()}</div>
                                {sub.approvedAt > 0 && (
                                    <div>Approved: {new Date(sub.approvedAt * 1000).toLocaleString()}</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
