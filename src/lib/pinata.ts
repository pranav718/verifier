/** Upload a file to IPFS via our Next.js API route (keeps Pinata keys server-side) */
export async function uploadToIPFS(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'IPFS upload failed');
    }

    const data = await res.json();
    return data.cid; // e.g. "QmXyz..." or "bafy..."
}
