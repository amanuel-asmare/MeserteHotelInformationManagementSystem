import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../../context/AuthContext';
import { LanguageProvider } from '../../context/LanguageContext';
import { HotelConfigProvider } from '../../context/HotelConfigContext'; // 1. Import this
import ConditionalNavbar from '../../components/ConditionalNavbar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            {/* 2. Wrap your application content with HotelConfigProvider */}
            <HotelConfigProvider>
              <ConditionalNavbar />
             
              <main>{children}</main>
             
            </HotelConfigProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}/*import './globals.css';
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
}*/