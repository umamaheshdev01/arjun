import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { ThemeProvider } from '@/context/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CMR Cafeteria',
  description: 'College-based food ordering system for CMR students',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} dark:bg-gray-900 dark:text-white min-h-screen`}>
        <ThemeProvider>
          <Navbar />
          <main className="transition-colors duration-200">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
