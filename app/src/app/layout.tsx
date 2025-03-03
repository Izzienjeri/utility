import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Billing App',
  description: 'A Next.js billing application with Flask backend.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {/* Add a header/navigation here if needed */}
          <main className="flex-grow">{children}</main>
          {/* Add a footer here if needed */}
        </div>
      </body>
    </html>
  );
}