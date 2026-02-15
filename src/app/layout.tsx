import type { Metadata } from 'next';
import { WalletProvider } from '../context/WalletContext';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Work Verifier — Blockchain Verification System',
  description: 'Blockchain-based freelance & internship work verification using IPFS and Polygon',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <div className="page-shell">{children}</div>
        </WalletProvider>
      </body>
    </html>
  );
}
