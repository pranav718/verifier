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
        <meta name="theme-color" content="#FFFDF7" />
      </head>
      <body className="min-h-screen antialiased overflow-x-hidden">
        <WalletProvider>
          <div className="relative flex justify-center p-4 sm:p-6 min-h-screen">
            {children}
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
