export default function StatusBadge({ status }: { status: string }) {
  let color = 'bg-gray-600';
  if (/RTO/i.test(status)) color = 'bg-red-500';
  else if (/Transit/i.test(status)) color = 'bg-orange-500';
  else if (/OFD|Delivery/i.test(status)) color = 'bg-green-500';
  else if (/Not Settled/i.test(status)) color = 'bg-yellow-500';

  return (
    <span className={`${color} text-xs px-2 py-1 rounded-full text-white`}>
      {status}
    </span>
  );
}
