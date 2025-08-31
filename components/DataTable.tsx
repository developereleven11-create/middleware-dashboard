type Row = Record<string, any>;
type Column = {
  key: string;
  label: string;
  render?: (row: Row) => React.ReactNode;
};

export default function DataTable({
  rows,
  columns,
}: {
  rows: Row[];
  columns: Column[];
}) {
  return (
    <table className="w-full text-sm border border-gray-700">
      <thead className="bg-gray-800">
        <tr>
          {columns.map((c) => (
            <th key={c.key} className="text-left p-2">
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-gray-700">
            {columns.map((c) => (
              <td key={c.key} className="p-2">
                {c.render ? c.render(r) : String(r[c.key] ?? '—')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
