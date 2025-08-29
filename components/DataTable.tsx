'use client';
import React from 'react';

type Row = Record<string, any>;
type Column = { key: string; label: string; render?: (row:Row)=>React.ReactNode };

export default function DataTable({ rows, columns }:{ rows:Row[]; columns:Column[] }){
  return (
    <div className="card p-4 overflow-auto">
      <table className="table">
        <thead>
          <tr>
            {columns.map(col => <th key={col.key}>{col.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
