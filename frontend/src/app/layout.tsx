import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../../context/AuthContext';
import ConditionalNavbar from '../../components/ConditionalNavbar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ConditionalNavbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}/*// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '../../components/Navbar';
import { AuthProvider } from '../../context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}*/