'use client';

interface Step {
    label: string;
    status: 'waiting' | 'active' | 'done';
}

export default function BlockchainSteps({ currentStep }: { currentStep: number }) {
    const steps: Step[] = [
        { label: 'Uploading to IPFS', status: currentStep > 0 ? 'done' : currentStep === 0 ? 'active' : 'waiting' },
        { label: 'Awaiting Signature', status: currentStep > 1 ? 'done' : currentStep === 1 ? 'active' : 'waiting' },
        { label: 'Writing to Polygon', status: currentStep > 2 ? 'done' : currentStep === 2 ? 'active' : 'waiting' },
        { label: 'Confirmed on Chain', status: currentStep > 3 ? 'done' : currentStep === 3 ? 'active' : 'waiting' },
    ];

    return (
        <div className="mt-5 mb-5 flex w-full max-w-[400px] flex-col gap-0 rounded-xl border border-white/5 bg-black/40 p-5 backdrop-blur-md">
            {steps.map((step, i) => {
                const iconClass = step.status === 'done' 
                    ? 'border border-green-500/30 bg-green-500/10 text-green-500 shadow-[0_0_12px_rgba(34,197,94,0.2)]' 
                    : step.status === 'active' 
                    ? 'border border-white/20 bg-white/5' 
                    : 'border border-white/10 opacity-40';
                    
                const labelClass = step.status === 'done'
                    ? 'text-zinc-200'
                    : step.status === 'active'
                    ? 'text-white animate-pulse'
                    : 'text-zinc-600';
                    
                return (
                    <div key={i} className="relative flex items-center gap-3.5 pb-6 last:pb-0">
                        <div className={`relative z-10 flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full bg-black transition-all duration-500 ${iconClass}`}>
                            {step.status === 'done' && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                            {step.status === 'active' && <div className="h-3.5 w-3.5 rounded-full border-[2px] border-white/10 border-t-white animate-spin" />}
                            {step.status === 'waiting' && <div className="h-1.5 w-1.5 rounded-full bg-zinc-600" />}
                        </div>
                        <span className={`text-[13px] font-semibold tracking-[-0.1px] transition-all duration-300 ${labelClass}`}>{step.label}</span>
                        {i < 3 && <div className={`absolute left-[13px] top-[26px] h-full w-[2px] -translate-x-1/2 ${step.status === 'done' ? 'bg-[linear-gradient(to_bottom,rgba(34,197,94,0.5),rgba(34,197,94,0.1))]' : 'bg-white/5'}`} />}
                    </div>
                );
            })}
        </div>
    );
}
