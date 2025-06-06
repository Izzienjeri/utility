// File: ./app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner'; // Import Toaster

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
                    <Toaster richColors /> {/* Add Toaster here */}
                    {/* Add a footer here if needed */}
                </div>
            </body>
        </html>
    );
}