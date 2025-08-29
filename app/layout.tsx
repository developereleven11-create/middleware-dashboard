import './globals.css';
import Header from '@/components/Header';

export const metadata = {
  title: 'Middleware Insights',
  description: 'Shopify × Shipment Providers Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="container-page py-8 space-y-8">{children}</main>
      </body>
    </html>
  );
}
