import './globals.css';
import Header from '@/components/Header';
export const metadata = { title: 'Middleware Dashboard' };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang='en'><body><Header/><main className='p-4'>{children}</main></body></html>;
}
