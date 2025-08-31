'use client';
import useSWR from 'swr';
import KPI from '@/components/KPI';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function InsightsPage() {
  const { data, error, isLoading } = useSWR('/api/insights', fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-400">Failed to load insights.</div>;

  // Defensive: handle missing or error response
  if (!data || !data.rto || !data.ofd || !data.inTransit) {
    return (
      <div className="text-red-400">
        Insights API did not return expected data.
        <pre className="mt-2 text-xs text-gray-400">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPI label="RTO" valu
