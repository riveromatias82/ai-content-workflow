import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ApolloWrapper } from '@/components/providers/apollo-wrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Content Workflow - ACME Global Media',
  description: 'AI-powered content creation and review workflow system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ApolloWrapper>
          {children}
        </ApolloWrapper>
      </body>
    </html>
  );
}
