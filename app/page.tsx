import Link from 'next/link';

export default function HomePage(){
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Welcome</h2>
      <p className="text-white/70">Head to <Link href="/insights" className="text-brand-400 underline">Insights</Link> to view your modules.</p>
    </div>
  );
}
