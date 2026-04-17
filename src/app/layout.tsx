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
      <body className="bg-black text-zinc-200 min-h-screen font-sans antialiased overflow-x-hidden">
        <WalletProvider>
          <div className="fixed top-[-40%] left-[-20%] w-[80%] h-[80%] bg-[radial-gradient(ellipse,_rgba(255,255,255,0.03)_0%,_transparent_70%)] pointer-events-none -z-10" />
          <div className="fixed bottom-[-30%] right-[-15%] w-[60%] h-[60%] bg-[radial-gradient(ellipse,_rgba(255,255,255,0.02)_0%,_transparent_70%)] pointer-events-none -z-10" />
          <div className="relative flex justify-center p-4 min-h-screen">
            {children}
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
