export default function KPI({label,value}:{label:string,value:string|number}){return <div className='p-4 bg-gray-800 rounded'><div>{label}</div><div className='text-2xl'>{value}</div></div>}
