import { type ReactNode, useState, useMemo, useRef, useEffect } from 'react';
import { SearchX, ArrowUp, ArrowDown, ArrowUpDown, Filter, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { EmptyState } from '@/shared/components/feedback/EmptyState';

// === Tipos ===

export type FilterType = 'text' | 'select' | 'number-range' | 'date-range';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: FilterType;
  filterOptions?: { label: string; value: string }[];
  accessor?: (item: T) => string | number | null | undefined;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  mobileRender?: (item: T) => ReactNode;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  key: string;
  direction: SortDirection;
}

interface FilterValue {
  type: FilterType;
  text?: string;
  selected?: string[];
  min?: string;
  max?: string;
}

// === Componente de Filtro por Coluna ===

function ColumnFilter<T>({
  column,
  data,
  value,
  onChange,
  onClose,
}: {
  column: Column<T>;
  data: T[];
  value: FilterValue | undefined;
  onChange: (val: FilterValue | undefined) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const filterType = column.filterType ?? 'text';

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  // Opções auto-detectadas para filtro select
  const autoOptions = useMemo(() => {
    if (filterType !== 'select' || column.filterOptions) return [];
    const vals = new Set<string>();
    for (const item of data) {
      const raw = column.accessor ? column.accessor(item) : (item as Record<string, unknown>)[column.key];
      if (raw != null && raw !== '') vals.add(String(raw));
    }
    return Array.from(vals).sort().map((v) => ({ label: v, value: v }));
  }, [data, column, filterType]);

  const options = column.filterOptions ?? autoOptions;

  function handleClear() {
    onChange(undefined);
    onClose();
  }

  if (filterType === 'text') {
    return (
      <div ref={ref} className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border border-[var(--color-neutral-200)] bg-white p-3 shadow-lg">
        <input
          type="text"
          autoFocus
          placeholder="Filtrar..."
          value={value?.text ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v ? { type: 'text', text: v } : undefined);
          }}
          className="flex h-8 w-full rounded-md border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
        {value?.text && (
          <button type="button" onClick={handleClear} className="mt-2 text-xs text-red-500 hover:underline">
            Limpar filtro
          </button>
        )}
      </div>
    );
  }

  if (filterType === 'select') {
    const selected = value?.selected ?? [];
    return (
      <div ref={ref} className="absolute left-0 top-full z-50 mt-1 max-h-60 w-56 overflow-y-auto rounded-lg border border-[var(--color-neutral-200)] bg-white p-3 shadow-lg">
        <div className="space-y-1">
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-[var(--color-neutral-50)]">
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selected, opt.value]
                    : selected.filter((v) => v !== opt.value);
                  onChange(next.length > 0 ? { type: 'select', selected: next } : undefined);
                }}
                className="rounded border-[var(--color-neutral-300)]"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {selected.length > 0 && (
          <button type="button" onClick={handleClear} className="mt-2 text-xs text-red-500 hover:underline">
            Limpar filtro
          </button>
        )}
      </div>
    );
  }

  if (filterType === 'number-range') {
    return (
      <div ref={ref} className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border border-[var(--color-neutral-200)] bg-white p-3 shadow-lg">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={value?.min ?? ''}
            onChange={(e) => {
              const min = e.target.value;
              const max = value?.max;
              onChange(min || max ? { type: 'number-range', min: min || undefined, max } : undefined);
            }}
            className="flex h-8 w-full rounded-md border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <input
            type="number"
            placeholder="Max"
            value={value?.max ?? ''}
            onChange={(e) => {
              const max = e.target.value;
              const min = value?.min;
              onChange(min || max ? { type: 'number-range', min, max: max || undefined } : undefined);
            }}
            className="flex h-8 w-full rounded-md border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        {(value?.min || value?.max) && (
          <button type="button" onClick={handleClear} className="mt-2 text-xs text-red-500 hover:underline">
            Limpar filtro
          </button>
        )}
      </div>
    );
  }

  if (filterType === 'date-range') {
    return (
      <div ref={ref} className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-[var(--color-neutral-200)] bg-white p-3 shadow-lg">
        <div className="space-y-2">
          <div>
            <label className="text-xs text-[var(--color-neutral-500)]">De</label>
            <input
              type="date"
              value={value?.min ?? ''}
              onChange={(e) => {
                const min = e.target.value;
                const max = value?.max;
                onChange(min || max ? { type: 'date-range', min: min || undefined, max } : undefined);
              }}
              className="flex h-8 w-full rounded-md border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--color-neutral-500)]">Até</label>
            <input
              type="date"
              value={value?.max ?? ''}
              onChange={(e) => {
                const max = e.target.value;
                const min = value?.min;
                onChange(min || max ? { type: 'date-range', min, max: max || undefined } : undefined);
              }}
              className="flex h-8 w-full rounded-md border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>
        {(value?.min || value?.max) && (
          <button type="button" onClick={handleClear} className="mt-2 text-xs text-red-500 hover:underline">
            Limpar filtro
          </button>
        )}
      </div>
    );
  }

  return null;
}

// === Componente Principal ===

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'Nenhum registro encontrado',
  loading,
  mobileRender,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>({ key: '', direction: null });
  const [filters, setFilters] = useState<Record<string, FilterValue>>({});
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  // Filtragem client-side
  const filteredData = useMemo(() => {
    let result = [...data];

    for (const [key, filterVal] of Object.entries(filters)) {
      const col = columns.find((c) => c.key === key);
      if (!col || !filterVal) continue;

      const getRaw = (item: T) => {
        if (col.accessor) return col.accessor(item);
        return (item as Record<string, unknown>)[key];
      };

      if (filterVal.type === 'text' && filterVal.text) {
        const search = filterVal.text.toLowerCase();
        result = result.filter((item) => {
          const raw = getRaw(item);
          return raw != null && String(raw).toLowerCase().includes(search);
        });
      }

      if (filterVal.type === 'select' && filterVal.selected && filterVal.selected.length > 0) {
        result = result.filter((item) => {
          const raw = getRaw(item);
          return raw != null && filterVal.selected!.includes(String(raw));
        });
      }

      if (filterVal.type === 'number-range') {
        if (filterVal.min) {
          const min = Number(filterVal.min);
          result = result.filter((item) => {
            const raw = getRaw(item);
            return raw != null && Number(raw) >= min;
          });
        }
        if (filterVal.max) {
          const max = Number(filterVal.max);
          result = result.filter((item) => {
            const raw = getRaw(item);
            return raw != null && Number(raw) <= max;
          });
        }
      }

      if (filterVal.type === 'date-range') {
        if (filterVal.min) {
          result = result.filter((item) => {
            const raw = getRaw(item);
            return raw != null && String(raw) >= filterVal.min!;
          });
        }
        if (filterVal.max) {
          result = result.filter((item) => {
            const raw = getRaw(item);
            return raw != null && String(raw) <= filterVal.max!;
          });
        }
      }
    }

    return result;
  }, [data, filters, columns]);

  // Ordenação client-side
  const sortedData = useMemo(() => {
    if (!sort.key || !sort.direction) return filteredData;

    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filteredData;

    const getRaw = (item: T) => {
      if (col.accessor) return col.accessor(item);
      return (item as Record<string, unknown>)[sort.key];
    };

    return [...filteredData].sort((a, b) => {
      const aVal = getRaw(a);
      const bVal = getRaw(b);
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let cmp = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal), 'pt-BR', { numeric: true });
      }
      return sort.direction === 'desc' ? -cmp : cmp;
    });
  }, [filteredData, sort, columns]);

  function handleSort(key: string) {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return { key: '', direction: null };
    });
  }

  function handleFilterChange(key: string, val: FilterValue | undefined) {
    setFilters((prev) => {
      const next = { ...prev };
      if (val) next[key] = val;
      else delete next[key];
      return next;
    });
  }

  const activeFilterCount = Object.keys(filters).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-500" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        icon={<SearchX size={28} strokeWidth={1.5} />}
      />
    );
  }

  return (
    <div>
      {/* Indicador de filtros ativos */}
      {activeFilterCount > 0 && (
        <div className="mb-2 flex items-center gap-2 text-xs text-[var(--color-neutral-500)]">
          <Filter size={12} />
          <span>{activeFilterCount} filtro(s) ativo(s)</span>
          <span>· {sortedData.length} de {data.length} registros</span>
          <button
            type="button"
            onClick={() => setFilters({})}
            className="ml-1 flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs text-red-500 hover:bg-red-50"
          >
            <X size={10} /> Limpar todos
          </button>
        </div>
      )}

      {/* Desktop: Tabela */}
      <div className="hidden overflow-x-auto rounded-lg border border-[var(--color-neutral-200)]/60 bg-[var(--surface-card)] shadow-card sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'relative px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--color-neutral-500)]',
                    col.className,
                  )}
                >
                  <div className="flex items-center gap-1">
                    {col.sortable ? (
                      <button
                        type="button"
                        className="flex items-center gap-1 hover:text-[var(--color-neutral-700)]"
                        onClick={() => handleSort(col.key)}
                      >
                        {col.header}
                        {sort.key === col.key && sort.direction === 'asc' && <ArrowUp size={12} />}
                        {sort.key === col.key && sort.direction === 'desc' && <ArrowDown size={12} />}
                        {(sort.key !== col.key || !sort.direction) && <ArrowUpDown size={12} className="opacity-30" />}
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}

                    {col.filterable && (
                      <button
                        type="button"
                        className={cn(
                          'ml-auto rounded p-0.5 transition-colors hover:bg-[var(--color-neutral-200)]',
                          filters[col.key] ? 'text-primary-600' : 'text-[var(--color-neutral-400)]',
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenFilter(openFilter === col.key ? null : col.key);
                        }}
                      >
                        <Filter size={12} />
                      </button>
                    )}
                  </div>

                  {openFilter === col.key && col.filterable && (
                    <ColumnFilter
                      column={col}
                      data={data}
                      value={filters[col.key]}
                      onChange={(val) => handleFilterChange(col.key, val)}
                      onClose={() => setOpenFilter(null)}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-neutral-100)]">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-[var(--color-neutral-400)]">
                  Nenhum registro corresponde aos filtros aplicados
                </td>
              </tr>
            ) : (
              sortedData.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className={cn(
                    'transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-primary-50/35',
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-sm text-[var(--color-neutral-700)]',
                        col.className,
                      )}
                    >
                      {col.render
                        ? col.render(item)
                        : String((item as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: Cards */}
      {mobileRender && (
        <div className="space-y-2 sm:hidden">
          {sortedData.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--color-neutral-400)]">
              Nenhum registro corresponde aos filtros
            </div>
          ) : (
            sortedData.map((item) => (
              <div key={keyExtractor(item)} onClick={() => onRowClick?.(item)}>
                {mobileRender(item)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
