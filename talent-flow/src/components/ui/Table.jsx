import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export function Table({
  data,
  columns,
  rowHeight = 48,
  headerHeight = 48,
  className = '',
  onRowClick,
  selectedId,
  enableVirtualization = true,
}) {
  const parentRef = React.useRef(null);
  
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
    enabled: enableVirtualization,
  });

  return (
    <div className={`w-full overflow-auto ${className}`} ref={parentRef}>
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-white shadow-sm z-10">
          <tr className="text-left">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-2 font-medium text-gray-600 border-b"
                style={{ height: headerHeight }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {enableVirtualization ? (
            <tr>
              <td colSpan={columns.length} className="p-0 border-none">
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                    <tr
                      key={data[virtualRow.index].id}
                      className={`absolute top-0 left-0 w-full hover:bg-gray-50 cursor-pointer ${
                        selectedId === data[virtualRow.index].id ? 'bg-blue-50' : ''
                      }`}
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      onClick={() => onRowClick?.(data[virtualRow.index])}
                    >
                      {columns.map((column) => (
                        <td key={column.key} className="px-4 py-2 border-b">
                          {column.render
                            ? column.render(data[virtualRow.index])
                            : data[virtualRow.index][column.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </div>
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id}
                className={`hover:bg-gray-50 cursor-pointer ${
                  selectedId === row.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-2 border-b">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}