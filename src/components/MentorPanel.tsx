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
            let message = 'Approval failed';
            if (err instanceof Error) {
                if (err.message.includes('gas required exceeds allowance') || err.message.includes('insufficient funds')) {
                    message = 'Insufficient POL in wallet to pay for gas. Please add testnet POL to your account.';
                } else if (err.message.includes('user rejected action') || err.message.includes('ACTION_REJECTED')) {
                    message = 'Transaction rejected in MetaMask.';
                } else if (err.message.includes('Cannot self-approve')) {
                    message = 'Cannot approve your own submission.';
                } else if (err.message.includes('Not a verified mentor')) {
                    message = 'Wallet is not registered as a verified mentor.';
                } else {
                    message = err.message;
                }
            }
            setError(message);
        } finally {
            setApprovingId(null);
        }
    };

    if (!account) {
        return (
            <section style={{ marginTop: '8px', animation: 'fadeInUp 0.6s ease 0.3s both' }}>
                <div className="nb-card" style={{ padding: '36px 40px', marginBottom: '48px' }}>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ marginBottom: '24px' }}>Mentor Access Gateway</h2>
                    <div className="nb-alert-info flex items-start sm:items-center text-sm leading-relaxed" style={{ padding: '16px 20px', gap: '12px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5 sm:mt-0">
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
            <section style={{ marginTop: '8px', animation: 'fadeInUp 0.6s ease 0.3s both' }}>
                <div className="nb-card text-center" style={{ padding: '36px 48px', marginBottom: '48px' }}>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ marginBottom: '16px' }}>Checking Mentor Credentials</h2>
                    <p className="text-sm font-bold text-zinc-600 animate-pulse">Querying verified mentor status on Polygon blockchain...</p>
                </div>
            </section>
        );
    }

    if (!isVerified && !showRegister) {
        return (
            <section style={{ marginTop: '8px', animation: 'fadeInUp 0.6s ease 0.3s both' }}>
                <div className="nb-card" style={{ padding: '36px 40px', marginBottom: '48px' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '2px solid var(--nb-black)' }}>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Corporate Affiliation Required</h2>
                        <span className="nb-badge" style={{ background: 'var(--nb-yellow)', padding: '5px 12px' }}>Unverified</span>
                    </div>

                    <p className="text-sm sm:text-[15px] leading-relaxed text-zinc-700" style={{ marginBottom: '32px' }}>
                        To approve student work submissions, you must prove your organizational identity through corporate email validation. This prevents unauthorized approvals and preserves on-chain integrity.
                    </p>

                    <button className="nb-btn nb-btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }} onClick={() => setShowRegister(true)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
            <section style={{ marginTop: '8px', animation: 'fadeInUp 0.6s ease 0.3s both' }}>
                <div className="nb-card" style={{ padding: '36px 40px', marginBottom: '48px' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '2px solid var(--nb-black)' }}>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Corporate Email Verification</h2>
                        <span className="nb-badge" style={{ background: 'var(--nb-blue)', padding: '5px 12px' }}>Step {!otpSent ? '1 of 2' : '2 of 2'}</span>
                    </div>

                    {!otpSent ? (
                        <div className="flex flex-col" style={{ gap: '24px' }}>
                            <label className="flex flex-col text-xs font-bold uppercase tracking-wider text-zinc-700" style={{ gap: '10px' }}>
                                Corporate Email Address (@google.com, @microsoft.com, etc.)
                                <input
                                    className="nb-input"
                                    style={{ padding: '14px 16px' }}
                                    type="email"
                                    value={emailInput}
                                    onChange={e => setEmailInput(e.target.value)}
                                    placeholder="name@company.com"
                                    disabled={registering}
                                />
                            </label>

                            <p className="text-xs sm:text-sm leading-relaxed text-zinc-600">
                                A 6-digit verification code will be dispatched to your corporate inbox.
                            </p>

                            {registerError && <div className="nb-alert-error p-4">{registerError}</div>}

                            <div className="flex flex-wrap" style={{ gap: '16px', marginTop: '8px' }}>
                                <button className="nb-btn nb-btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }} onClick={handleSendOtp} disabled={registering}>
                                    {registering ? 'Sending Code...' : 'Send Verification OTP'}
                                </button>
                                <button className="nb-btn nb-btn-outline" style={{ padding: '12px 20px', fontSize: '14px' }} onClick={() => { setShowRegister(false); setRegisterError(null); }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col" style={{ gap: '24px' }}>
                            <div className="nb-alert-success flex items-center" style={{ padding: '16px 20px', gap: '10px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>One-time passcode sent to <span className="font-bold underline">{emailInput}</span></span>
                            </div>

                            <label className="flex flex-col text-xs font-bold uppercase tracking-wider text-zinc-700" style={{ gap: '10px' }}>
                                Enter 6-Digit Verification Code
                                <input
                                    className="nb-input font-mono text-lg tracking-widest text-center"
                                    style={{ padding: '14px 16px' }}
                                    type="text"
                                    value={otpInput}
                                    onChange={e => setOtpInput(e.target.value)}
                                    placeholder="123456"
                                    disabled={registering}
                                    maxLength={6}
                                />
                            </label>

                            {registerError && <div className="nb-alert-error p-4">{registerError}</div>}

                            <div className="flex flex-wrap" style={{ gap: '16px', marginTop: '8px' }}>
                                <button className="nb-btn nb-btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }} onClick={handleVerifyOtp} disabled={registering}>
                                    {registering ? 'Registering on Blockchain...' : 'Verify & Register on Chain'}
                                </button>
                                <button className="nb-btn nb-btn-outline" style={{ padding: '12px 20px', fontSize: '14px' }} onClick={() => { setOtpSent(false); setRegisterError(null); }}>
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
        <section style={{ marginTop: '8px', animation: 'fadeInUp 0.6s ease 0.3s both' }}>
            <div className="nb-card" style={{ padding: '36px 40px', marginBottom: '48px' }}>
                <div className="flex flex-wrap items-center justify-between" style={{ gap: '16px', marginBottom: '32px', paddingBottom: '20px', borderBottom: '2px solid var(--nb-black)' }}>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Mentor Governance Dashboard</h2>
                        <p className="text-xs sm:text-sm text-zinc-600 mt-1.5">Review student proof submissions and sign off on credentials.</p>
                    </div>

                    <div className="nb-badge" style={{ background: 'var(--nb-green)', padding: '8px 16px', fontSize: '13px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                            <path d="m9 12 2 2 4-4" />
                        </svg>
                        Verified Mentor — {mentorDomain}
                    </div>
                </div>

                <div className="flex flex-wrap" style={{ gap: '16px' }}>
                    <button
                        className="nb-btn nb-btn-primary"
                        style={{ padding: '12px 24px', fontSize: '14px' }}
                        onClick={fetchSubmissions}
                        disabled={loadingList}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10" />
                            <polyline points="1 20 1 14 7 14" />
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                        </svg>
                        {loadingList ? 'Querying Polygon...' : 'Fetch All Submissions from Blockchain'}
                    </button>
                </div>

                {error && <div className="nb-alert-error" style={{ marginTop: '20px', padding: '16px 20px' }}>{error}</div>}
                {successMsg && <div className="nb-alert-success" style={{ marginTop: '20px', padding: '16px 20px' }}>{successMsg}</div>}
            </div>

            <div className="nb-card" style={{ padding: '36px 40px', marginBottom: '48px' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '2px solid var(--nb-black)' }}>
                    <h3 className="text-xl font-bold tracking-tight">All On-Chain Records</h3>
                    <span className="nb-badge" style={{ background: 'var(--nb-input-bg)', padding: '5px 12px' }}>{submissions.length} Total</span>
                </div>

                {submissions.length === 0 && !loadingList && (
                    <p className="text-sm leading-relaxed text-zinc-600 text-center" style={{ padding: '32px 0' }}>
                        Click "Fetch All Submissions from Blockchain" above to load global student submissions.
                    </p>
                )}

                <div className="flex flex-col" style={{ gap: '20px' }}>
                    {submissions.map(sub => {
                        return (
                            <div
                                key={sub.id}
                                style={{
                                    background: sub.approved ? '#F8FFF9' : '#FFFDF5',
                                    border: 'var(--nb-border)',
                                    borderRadius: 'var(--nb-radius)',
                                    boxShadow: 'var(--nb-shadow-sm)',
                                    padding: '24px 28px',
                                }}
                            >
                                <div className="flex flex-wrap items-center justify-between" style={{ gap: '16px', paddingBottom: '16px', borderBottom: '2px solid var(--nb-black)' }}>
                                    <div>
                                        <h4 className="text-base sm:text-lg font-bold tracking-tight">{sub.title}</h4>
                                        <div className="mt-1.5 text-xs text-zinc-600 flex items-center gap-2">
                                            Student: <span className="font-mono font-bold bg-white px-2 py-0.5 border border-black rounded text-[11px]">{sub.student.slice(0, 6)}...{sub.student.slice(-4)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {!sub.approved && account && (
                                            <button
                                                className="nb-btn nb-btn-primary"
                                                style={{ padding: '8px 16px', fontSize: '12px' }}
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
                                                padding: '5px 12px',
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {sub.approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 text-xs" style={{ marginTop: '20px', gap: '12px' }}>
                                    <div className="p-3" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                                        <span className="font-bold text-zinc-500 block mb-1">IPFS Artifact</span>
                                        <a href={ipfsGatewayUrl(sub.cid)} target="_blank" rel="noopener noreferrer" className="font-mono font-bold underline hover:bg-[var(--nb-yellow)]">
                                            {sub.cid.slice(0, 16)}... ↗
                                        </a>
                                    </div>

                                    {sub.mentor !== '0x0000000000000000000000000000000000000000' && (
                                        <div className="p-3" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                                            <span className="font-bold text-zinc-500 block mb-1">Verified Mentor</span>
                                            <span className="font-mono font-bold">{sub.mentor.slice(0, 6)}...{sub.mentor.slice(-4)}</span>
                                        </div>
                                    )}

                                    <div className="p-3" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                                        <span className="font-bold text-zinc-500 block mb-1">Submitted At</span>
                                        <span>{new Date(sub.submittedAt * 1000).toLocaleString()}</span>
                                    </div>

                                    {sub.approvedAt > 0 && (
                                        <div className="p-3" style={{ background: 'var(--nb-input-bg)', border: '1px solid var(--nb-black)', borderRadius: 'var(--nb-radius)' }}>
                                            <span className="font-bold text-zinc-500 block mb-1">Approved At</span>
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
