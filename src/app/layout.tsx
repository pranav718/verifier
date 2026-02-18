import type { Metadata } from 'next';
import { WalletProvider } from '../context/WalletContext';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'verifier',
  description: 'Decentralized work verification using IPFS, Solidity smart contracts, and Polygon Amoy testnet. Submit, approve, and verify credentials on-chain.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        <WalletProvider>
          <div className="page-shell">{children}</div>
        </WalletProvider>
      </body>
    </html>
  );
}
