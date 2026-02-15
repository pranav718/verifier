import { BrowserProvider, Contract, ethers } from 'ethers';

// ---- ABI (only the functions we call) ----
export const CONTRACT_ABI = [
    "function submitWork(string calldata _title, string calldata _cid) external",
    "function approveWork(uint256 _id) external",
    "function getSubmission(uint256 _id) external view returns (address student, string title, string cid, address mentor, bool approved, uint256 submittedAt, uint256 approvedAt)",
    "function getSubmissionCount() external view returns (uint256)",
    "event WorkSubmitted(uint256 indexed id, address indexed student, string title, string cid)",
    "event WorkApproved(uint256 indexed id, address indexed mentor)"
];

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

// ---- Types ----
export interface OnChainSubmission {
    student: string;
    title: string;
    cid: string;
    mentor: string;
    approved: boolean;
    submittedAt: number;
    approvedAt: number;
}

// ---- Helpers ----

/** Get a read-only provider (works without wallet) */
export function getReadOnlyProvider() {
    const rpc = process.env.NEXT_PUBLIC_AMOY_RPC || 'https://rpc-amoy.polygon.technology';
    return new ethers.JsonRpcProvider(rpc);
}

/** Get a contract instance connected to MetaMask signer */
export async function getSignedContract(): Promise<Contract> {
    if (!window.ethereum) throw new Error('MetaMask not found');
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

/** Get a read-only contract instance (no wallet needed) */
export function getReadOnlyContract(): Contract {
    const provider = getReadOnlyProvider();
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

/** Student submits work → returns tx hash */
export async function submitWork(title: string, cid: string): Promise<string> {
    const contract = await getSignedContract();
    const tx = await contract.submitWork(title, cid);
    const receipt = await tx.wait();
    return receipt.hash;
}

/** Mentor approves work → returns tx hash */
export async function approveWork(submissionId: number): Promise<string> {
    const contract = await getSignedContract();
    const tx = await contract.approveWork(submissionId);
    const receipt = await tx.wait();
    return receipt.hash;
}

/** Fetch submission details (read-only, no wallet needed) */
export async function getSubmission(id: number): Promise<OnChainSubmission> {
    const contract = getReadOnlyContract();
    const [student, title, cid, mentor, approved, submittedAt, approvedAt] =
        await contract.getSubmission(id);
    return {
        student,
        title,
        cid,
        mentor,
        approved,
        submittedAt: Number(submittedAt),
        approvedAt: Number(approvedAt),
    };
}

/** Total number of submissions on-chain */
export async function getSubmissionCount(): Promise<number> {
    const contract = getReadOnlyContract();
    const count = await contract.getSubmissionCount();
    return Number(count);
}

/** Build an Amoy Polygonscan link for a tx hash */
export function polygonscanTxUrl(txHash: string): string {
    return `https://amoy.polygonscan.com/tx/${txHash}`;
}

/** Build an IPFS gateway link for a CID */
export function ipfsGatewayUrl(cid: string): string {
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
}
