# verifier

Decentralized work credential verification platform powered by IPFS, Solidity smart contracts, and Polygon Amoy testnet.

## Overview

- **Student Portal**: Upload work proofs directly to IPFS and record cryptographically verified CIDs on-chain.
- **Mentor Governance**: Verified corporate mentors audit submissions and sign off on credentials.
- **Verification Engine**: Recruiters and institutions query and verify credentials via submission ID or QR code.
- **Blockchain Resume**: Permanent, tamper-proof student profiles showcasing verified credentials.

## Tech Stack

- **Framework**: Next.js (App Router, Turbopack)
- **Styling**: Neo-Brutalism Design System with Tailwind CSS
- **Smart Contracts**: Solidity ^0.8.20 on Polygon Amoy
- **Storage**: Pinata IPFS
- **Web3 Integration**: Ethers.js v6

## Environment Variables

Configure the following variables in `.env`:

```env
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_AMOY_RPC=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your_wallet_private_key
RESEND_API_KEY=your_resend_api_key
```

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` in your browser.
