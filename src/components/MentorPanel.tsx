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
            <section className="mt-2" style={{ animation: 'fadeInUp 0.6s ease 0.3s both' }}>
                <div className="nb-card p-6 sm:p-8 mb-8">
                    <h2 className="text-xl font-bold mb-4 tracking-tight">Mentor Access Gateway</h2>
                    <div className="nb-alert-info flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        Connect your Web3 MetaMask wallet above to access the mentor dashboard.
                    </div>
                </div>
            </section>
        );
    }

    if (checkingVerification) {
        return (
            <section className="mt-2" style={{ animation: 'fadeInUp 0.6s ease 0.3s both' }}>
                <div className="nb-card p-6 sm:p-8 mb-8 text-center">
                    <h2 className="text-xl font-bold mb-4 tracking-tight">Checking Mentor Credentials</h2>
                    <p className="text-sm font-bold text-zinc-600 animate-pulse">Querying verified mentor status on Polygon blockchain...</p>
                </div>
            </section>
        );
    }

    if (!isVerified && !showRegister) {
        return (
            <section className="mt-2" style={{ animation: 'fadeInUp 0.6s ease 0.3s both' }}>
                <div className="nb-card p-6 sm:p-8 mb-8">
                    <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '2px solid var(--nb-black)' }}>
                        <h2 className="text-xl font-bold tracking-tight">Corporate Affiliation Required</h2>
                        <span className="nb-badge" style={{ background: 'var(--nb-yellow)' }}>Unverified</span>
                    </div>

                    <p className="text-sm leading-relaxed text-zinc-700 mb-6">
                        To approve student work submissions, you must prove your organizational identity through corporate email validation. This prevents unauthorized approvals and preserves on-chain integrity.
                    </p>

                    <button className="nb-btn nb-btn-primary" onClick={() => setShowRegister(true)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Verify Corporate Identity (OTP)
                    </button>
                </div>
            </section>
        );
    }

    if (!isVerified && showRegister) {
        return (
            <section className="mt-2" style={{ animation: 'fadeInUp 0.6s ease 0.3s both' }}>
                <div className="nb-card p-6 sm:p-8 mb-8">
                    <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '2px solid var(--nb-black)' }}>
                        <h2 className="text-xl font-bold tracking-tight">Corporate Email Verification</h2>
                        <span className="nb-badge" style={{ background: 'var(--nb-blue)' }}>Step {!otpSent ? '1 of 2' : '2 of 2'}</span>
                    </div>

                    {!otpSent ? (
                        <div className="flex flex-col gap-5">
                            <label className="flex flex-col text-xs font-bold uppercase tracking-wider text-zinc-700">
                                Corporate Email Address (@google.com, @microsoft.com, etc.)
                                <input
                                    className="nb-input mt-2"
                                    type="email"
                                    value={emailInput}
                                    onChange={e => setEmailInput(e.target.value)}
                                    placeholder="name@company.com"
                                    disabled={registering}
                                />
                            </label>

                            <p className="text-xs leading-relaxed text-zinc-600">
                                A 6-digit verification code will be dispatched to your corporate inbox.
                            </p>

                            {registerError && <div className="nb-alert-error">{registerError}</div>}

                            <div className="flex gap-3 mt-2">
                                <button className="nb-btn nb-btn-primary" onClick={handleSendOtp} disabled={registering}>
                                    {registering ? 'Sending Code...' : 'Send Verification OTP'}
                                </button>
                                <button className="nb-btn nb-btn-outline" onClick={() => { setShowRegister(false); setRegisterError(null); }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5">
                            <div className="nb-alert-success flex items-center gap-2">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                One-time passcode sent to <span className="font-bold underline">{emailInput}</span>
                            </div>

                            <label className="flex flex-col text-xs font-bold uppercase tracking-wider text-zinc-700">
                                Enter 6-Digit Verification Code
                                <input
                                    className="nb-input mt-2 font-mono text-base tracking-widest text-center"
                                    type="text"
                                    value={otpInput}
                                    onChange={e => setOtpInput(e.target.value)}
                                    placeholder="123456"
                                    disabled={registering}
                                    maxLength={6}
                                />
                            </label>

                            {registerError && <div className="nb-alert-error">{registerError}</div>}

                            <div className="flex gap-3 mt-2">
                                <button className="nb-btn nb-btn-primary" onClick={handleVerifyOtp} disabled={registering}>
                                    {registering ? 'Registering on Blockchain...' : 'Verify & Register on Chain'}
                                </button>
                                <button className="nb-btn nb-btn-outline" onClick={() => { setOtpSent(false); setRegisterError(null); }}>
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
        <section className="mt-2" style={{ animation: 'fadeInUp 0.6s ease 0.3s both' }}>
            <div className="nb-card p-6 sm:p-8 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4" style={{ borderBottom: '2px solid var(--nb-black)' }}>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Mentor Governance Dashboard</h2>
                        <p className="text-xs text-zinc-600 mt-1">Review student proof submissions and sign off on credentials.</p>
                    </div>

                    <div className="nb-badge" style={{ background: 'var(--nb-green)', padding: '6px 14px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                            <path d="m9 12 2 2 4-4" />
                        </svg>
                        Verified Mentor — {mentorDomain}
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        className="nb-btn nb-btn-primary"
                        onClick={fetchSubmissions}
                        disabled={loadingList}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10" />
                            <polyline points="1 20 1 14 7 14" />
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                        </svg>
                        {loadingList ? 'Querying Polygon...' : 'Fetch All Submissions from Blockchain'}
                    </button>
                </div>

                {error && <div className="nb-alert-error mt-4">{error}</div>}
                {successMsg && <div className="nb-alert-success mt-4">{successMsg}</div>}
            </div>

            <div className="nb-card p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '2px solid var(--nb-black)' }}>
                    <h3 className="text-lg font-bold">All On-Chain Records</h3>
                    <span className="nb-badge" style={{ background: 'var(--nb-input-bg)' }}>{submissions.length} Total</span>
                </div>

                {submissions.length === 0 && !loadingList && (
                    <p className="text-sm leading-relaxed text-zinc-600 py-6 text-center">
                        Click "Fetch All Submissions from Blockchain" above to load global student submissions.
                    </p>
                )}

                <div className="flex flex-col gap-4">
                    {submissions.map(sub => {
                        return (
                            <div
                                key={sub.id}
                                className="p-5"
                                style={{
                                    background: sub.approved ? '#F8FFF9' : '#FFFDF5',
                                    border: 'var(--nb-border)',
                                    borderRadius: 'var(--nb-radius)',
                                    boxShadow: 'var(--nb-shadow-sm)',
                                }}
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3 pb-3" style={{ borderBottom: '2px solid var(--nb-black)' }}>
                                    <div>
                                        <h4 className="text-base font-bold tracking-tight">{sub.title}</h4>
                                        <div className="mt-1 text-xs text-zinc-600 flex items-center gap-1.5">
                                            Student: <span className="font-mono font-bold bg-white px-1.5 py-0.5 border border-black rounded text-[11px]">{sub.student.slice(0, 6)}...{sub.student.slice(-4)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!sub.approved && account && (
                                            <button
                                                className="nb-btn nb-btn-primary"
                                                style={{ padding: '6px 14px', fontSize: '12px' }}
                                                onClick={() => handleApprove(sub.id)}
                                                disabled={approvingId === sub.id}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                                    <path d="m9 12 2 2 4-4" />
                                                </svg>
                                                {approvingId === sub.id ? 'Approving on Chain...' : 'Approve Submission'}
                                            </button>
                                        )}

                                        <span
                                            className="nb-badge"
                                            style={{
                                                background: sub.approved ? 'var(--nb-green)' : 'var(--nb-pink)',
                                                fontSize: '11px',
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {sub.approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    <div className="p-2" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                                        <span className="font-bold text-zinc-500 block mb-0.5">IPFS Artifact</span>
                                        <a href={ipfsGatewayUrl(sub.cid)} target="_blank" rel="noopener noreferrer" className="font-mono font-bold underline hover:bg-[var(--nb-yellow)]">
                                            {sub.cid.slice(0, 16)}... ↗
                                        </a>
                                    </div>

                                    {sub.mentor !== '0x0000000000000000000000000000000000000000' && (
                                        <div className="p-2" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                                            <span className="font-bold text-zinc-500 block mb-0.5">Verified Mentor</span>
                                            <span className="font-mono font-bold">{sub.mentor.slice(0, 6)}...{sub.mentor.slice(-4)}</span>
                                        </div>
                                    )}

                                    <div className="p-2" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                                        <span className="font-bold text-zinc-500 block mb-0.5">Submitted At</span>
                                        <span>{new Date(sub.submittedAt * 1000).toLocaleString()}</span>
                                    </div>

                                    {sub.approvedAt > 0 && (
                                        <div className="p-2" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                                            <span className="font-bold text-zinc-500 block mb-0.5">Approved At</span>
                                            <span>{new Date(sub.approvedAt * 1000).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
