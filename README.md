# Blockchain-Based Work Verification System

A decentralized system for verifying freelance and internship work using **IPFS**, **Solidity smart contracts**, and **Polygon Amoy testnet**.

> Built for academic PBL project — Manipal University Jaipur, Dept. of Computer Science & Engineering.

---

## 🏗 Architecture

```
┌─────────────┐     ┌──────────┐     ┌──────────────────┐
│   Frontend   │────▶│  Pinata  │────▶│   IPFS Network   │
│  (Next.js)   │     │   API    │     │  (file storage)  │
│              │     └──────────┘     └──────────────────┘
│              │
│              │     ┌──────────────────────────────────┐
│              │────▶│  Smart Contract (Polygon Amoy)   │
│              │     │  WorkVerification.sol             │
└─────────────┘     └──────────────────────────────────┘
```

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, TypeScript, CSS |
| Wallet | MetaMask + ethers.js v6 |
| Smart Contract | Solidity 0.8.20, Hardhat |
| File Storage | IPFS via Pinata API |
| Blockchain | Polygon Amoy Testnet |

---

## 📁 Project Structure

```
/contracts
  Verification.sol          # Solidity smart contract

/scripts
  deploy.ts                 # Hardhat deployment script

/src
  app/
    page.tsx                # Main page (Student/Mentor tabs)
    verify/page.tsx         # Recruiter verification page
    api/upload/route.ts     # IPFS upload API (server-side)
    layout.tsx              # Root layout with WalletProvider
  components/
    Header.tsx              # Navigation + wallet button
    WalletButton.tsx        # MetaMask connect/disconnect
    VerificationForm.tsx    # Student submission form
    SubmissionCard.tsx      # Submission display card
    MentorPanel.tsx         # Mentor approval panel
  context/
    WalletContext.tsx        # Wallet state management
  lib/
    contract.ts             # Smart contract ABI + helpers
    pinata.ts               # IPFS upload client helper

hardhat.config.ts
.env.example
```

---

## 🚀 Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Where to get it |
|----------|----------------|
| `PINATA_API_KEY` | [pinata.cloud](https://pinata.cloud) → API Keys |
| `PINATA_SECRET_KEY` | Same as above |
| `PRIVATE_KEY` | MetaMask → Account Details → Export Private Key |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Set after deploying contract (step 3) |
| `NEXT_PUBLIC_AMOY_RPC` | Default: `https://rpc-amoy.polygon.technology` |

### 3. Deploy smart contract

Get testnet MATIC from [Polygon Faucet](https://faucet.polygon.technology/), then:

```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network amoy
```

Copy the printed contract address into `.env` as `NEXT_PUBLIC_CONTRACT_ADDRESS`.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 👤 User Flows

### Student
1. Connect MetaMask wallet
2. Switch to "Student" tab
3. Enter project title + select proof file
4. Click "Submit to Blockchain"
5. File uploads to IPFS → CID submitted to smart contract → real tx hash displayed

### Mentor
1. Connect MetaMask wallet (different account)
2. Switch to "Mentor" tab
3. Click "Load Submissions from Blockchain"
4. Click "Approve" on any pending submission
5. Approval recorded on-chain

### Recruiter
1. Navigate to `/verify`
2. Enter submission ID (0, 1, 2, ...)
3. View student address, IPFS CID, approval status, timestamps
4. Click through to IPFS file or Polygonscan

---

## 📊 Completion Status

| Feature | Status |
|---------|--------|
| Smart contract (Solidity) | ✅ Complete |
| Hardhat deployment config | ✅ Complete |
| MetaMask wallet integration | ✅ Complete |
| IPFS upload (Pinata) | ✅ Complete |
| Student submission flow | ✅ Complete |
| Mentor approval flow | ✅ Complete |
| Recruiter verification page | ✅ Complete |
| Polygonscan tx links | ✅ Complete |
| Contract verified on Polygonscan | ⬜ Pending |
| Advanced error handling / toasts | ⬜ Pending |
| Mobile responsive polish | ⬜ Pending |
| Production security hardening | ⬜ Not in scope |

**Current completion: ~85%**

---

## 🔮 Future Work

- Verify contract source on Polygonscan
- Add toast notifications for better UX
- Mobile-responsive design polish
- Event-based submission list (listen for `WorkSubmitted` events)
- Mentor authorization (restrict who can approve)
- Batch verification for recruiters

---

## 📜 License

Academic project — MIT License.
