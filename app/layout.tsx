import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Hub',
  description: 'Shared contact form for multiple sites.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
