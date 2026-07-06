import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TableSkeleton } from "@/components/shared/LoadingSkeletons";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  sortAccessor?: (row: T) => string | number;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  searchQuery?: string;
  searchAccessor?: (row: T) => string;
  emptyState?: ReactNode;
  isLoading?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  onRowClick,
  searchQuery,
  searchAccessor,
  emptyState,
  isLoading,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery || !searchAccessor) return data;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => searchAccessor(row).toLowerCase().includes(q));
  }, [data, searchQuery, searchAccessor]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortAccessor) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = column.sortAccessor!(a);
      const bv = column.sortAccessor!(b);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.direction === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sort, columns]);

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  };

  if (isLoading) {
    return <TableSkeleton columns={columns.length} />;
  }

  if (sorted.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "sticky top-0 bg-background px-4 py-2.5 text-left font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase",
                  column.className
                )}
              >
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(column.key)}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    {column.header}
                    {sort?.key === column.key ? (
                      sort.direction === "asc" ? (
                        <ArrowUp className="size-3" />
                      ) : (
                        <ArrowDown className="size-3" />
                      )
                    ) : (
                      <ChevronsUpDown className="size-3 opacity-40" />
                    )}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map((row) => (
            <tr
              key={getRowId(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "transition-colors",
                onRowClick && "cursor-pointer hover:bg-muted/50"
              )}
            >
              {columns.map((column) => (
                <td key={column.key} className={cn("px-4 py-3 align-middle", column.className)}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
