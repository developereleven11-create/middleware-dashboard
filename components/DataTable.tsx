type Row = Record<string,any>;
export default function DataTable({rows,columns}:{rows:Row[],columns:{key:string,label:string}[]}) {
  return <table className='w-full text-sm'>
    <thead><tr>{columns.map(c=><th key={c.key} className='text-left p-2'>{c.label}</th>)}</tr></thead>
    <tbody>{rows.map((r,i)=><tr key={i}>{columns.map(c=><td key={c.key} className='p-2'>{String(r[c.key]??'')}</td>)}</tr>)}</tbody>
  </table>;
}
