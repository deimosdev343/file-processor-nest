import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import type { OutputProfile } from '#/types/api.types';

const col = createColumnHelper<OutputProfile>();

const columns = [
  col.accessor('name', {
    header: 'Column',
    cell: (c: any) => <span className="font-medium text-slate-900">{c.getValue()}</span>,
  }),
  col.accessor('inferredType', { header: 'Type' }),
  col.accessor('semanticRole', { header: 'Role' }),
  col.accessor('unit', { header: 'Unit', cell: (c: any) => c.getValue() ?? '—' }),
  col.accessor('nullFraction', {
    header: 'Null %',
    cell: (c: any) => `${(c.getValue() * 100).toFixed(1)}%`,
  }),
  col.accessor('distinctCount', { header: 'Distinct' }),
  col.accessor('isPii', {
    header: 'PII',
    cell: (c: any) =>
      c.getValue() ? (
        <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">PII</span>
      ) : (
        '—'
      ),
  }),
];

export function ColumnsTable({ data }: { data: OutputProfile[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          {table.getHeaderGroups().map((hg: any) => (
            <tr key={hg.id}>
              {hg.headers.map((h: any) => (
                <th
                  key={h.id}
                  onClick={h.column.getToggleSortingHandler()}
                  className="cursor-pointer select-none px-4 py-2 font-medium whitespace-nowrap"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                  {{ asc: ' ↑', desc: ' ↓' }[h.column.getIsSorted() as string] ?? ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row: any) => (
            <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50">
              {row.getVisibleCells().map((cell: any) => (
                <td key={cell.id} className="px-4 py-2 whitespace-nowrap text-slate-700">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}