'use client';

interface Step {
    label: string;
    status: 'waiting' | 'active' | 'done';
}

export default function BlockchainSteps({ currentStep }: { currentStep: number }) {
    const steps: Step[] = [
        { label: 'Uploading proof to IPFS', status: currentStep > 0 ? 'done' : currentStep === 0 ? 'active' : 'waiting' },
        { label: 'Awaiting wallet signature', status: currentStep > 1 ? 'done' : currentStep === 1 ? 'active' : 'waiting' },
        { label: 'Mining transaction on Polygon', status: currentStep > 2 ? 'done' : currentStep === 2 ? 'active' : 'waiting' },
        { label: 'Confirmed on Blockchain', status: currentStep > 3 ? 'done' : currentStep === 3 ? 'active' : 'waiting' },
    ];

    return (
        <div
            className="my-4 flex w-full max-w-[440px] flex-col p-5"
            style={{
                background: 'var(--nb-input-bg)',
                border: 'var(--nb-border)',
                borderRadius: 'var(--nb-radius)',
                boxShadow: 'var(--nb-shadow-sm)',
            }}
        >
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-4 flex items-center justify-between pb-2" style={{ borderBottom: '2px solid var(--nb-black)' }}>
                <span>Transaction Pipeline</span>
                <span className="font-mono">{Math.min(currentStep + 1, 4)} / 4</span>
            </div>

            {steps.map((step, i) => {
                const getStepStyle = () => {
                    if (step.status === 'done') {
                        return { bg: 'var(--nb-green)', border: '2px solid var(--nb-black)', color: 'var(--nb-black)' };
                    }
                    if (step.status === 'active') {
                        return { bg: 'var(--nb-yellow)', border: '2px solid var(--nb-black)', color: 'var(--nb-black)' };
                    }
                    return { bg: '#e5e5e5', border: '2px solid #aaa', color: '#888' };
                };

                const stepStyle = getStepStyle();

                return (
                    <div key={i} className="relative flex items-center gap-3.5 pb-5 last:pb-0">
                        <div
                            className="relative z-10 flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-full font-bold text-xs"
                            style={{
                                background: stepStyle.bg,
                                border: stepStyle.border,
                                color: stepStyle.color,
                            }}
                        >
                            {step.status === 'done' && (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                            {step.status === 'active' && (
                                <div className="h-3.5 w-3.5 rounded-full border-[2px] border-black border-t-transparent animate-spin" />
                            )}
                            {step.status === 'waiting' && (
                                <span className="font-mono text-[10px]">{i + 1}</span>
                            )}
                        </div>

                        <span
                            className="text-xs sm:text-[13px] font-bold tracking-tight"
                            style={{
                                color: step.status === 'waiting' ? '#888' : 'var(--nb-black)',
                            }}
                        >
                            {step.label}
                        </span>

                        {i < 3 && (
                            <div
                                className="absolute left-[13px] top-[26px] h-full w-[2px] -translate-x-1/2"
                                style={{
                                    background: step.status === 'done' ? 'var(--nb-black)' : '#ccc',
                                }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
