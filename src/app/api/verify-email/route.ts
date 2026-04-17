import { NextResponse } from 'next/server';

const otpStore = new Map<string, { code: string; expires: number }>();

export async function POST(request: Request) {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { code, expires: Date.now() + 10 * 60 * 1000 });

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
        return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Verifier <onboarding@resend.dev>',
                to: [email],
                subject: 'Mentor Verification Code',
                html: `
                    <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
                        <h2 style="color: #000; margin-bottom: 8px;">Verification Code</h2>
                        <p style="color: #666; font-size: 14px;">Use this code to verify your corporate identity on the Verifier platform:</p>
                        <div style="background: #000; color: #fff; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
                            ${code}
                        </div>
                        <p style="color: #999; font-size: 12px;">This code expires in 10 minutes. Do not share it with anyone.</p>
                    </div>
                `,
            }),
        });

        if (!res.ok) {
            const err = await res.json();
            return NextResponse.json({ error: err.message || 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Email delivery failed' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const { email, code } = await request.json();

    if (!email || !code) {
        return NextResponse.json({ error: 'Email and code required' }, { status: 400 });
    }

    const stored = otpStore.get(email);

    if (!stored) {
        return NextResponse.json({ error: 'No verification code found. Request a new one.' }, { status: 400 });
    }

    if (Date.now() > stored.expires) {
        otpStore.delete(email);
        return NextResponse.json({ error: 'Code expired. Request a new one.' }, { status: 400 });
    }

    if (stored.code !== code) {
        return NextResponse.json({ error: 'Invalid code. Try again.' }, { status: 400 });
    }

    otpStore.delete(email);
    return NextResponse.json({ verified: true, domain: '@' + email.split('@')[1] });
}
