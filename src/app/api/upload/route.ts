import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.PINATA_API_KEY;
        const secretKey = process.env.PINATA_SECRET_KEY;

        if (!apiKey || !secretKey) {
            return NextResponse.json(
                { error: 'Pinata API keys not configured. Add PINATA_API_KEY and PINATA_SECRET_KEY to .env' },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const pinataForm = new FormData();
        pinataForm.append('file', file);

        const pinataRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                pinata_api_key: apiKey,
                pinata_secret_api_key: secretKey,
            },
            body: pinataForm,
        });

        if (!pinataRes.ok) {
            const errText = await pinataRes.text();
            return NextResponse.json(
                { error: `Pinata upload failed: ${errText}` },
                { status: 502 }
            );
        }

        const pinataData = await pinataRes.json();
        return NextResponse.json({ cid: pinataData.IpfsHash });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
