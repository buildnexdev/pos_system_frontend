import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Search,
  Filter,
  Columns3,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { ReportColumn } from './reportUi.types';
import {
  cellAlign,
  columnShouldTotal,
  compareValues,
  formatReportCell,
  isMoneyKey,
  moneyInr,
  sumColumn,
} from './reportUi.utils';

const PAGE_SIZES = [10, 25, 50, 100];

type Props = {
  title: string;
  columns: ReportColumn[];
  rows: any[];
  /** Optional custom cell renderer */
  renderCell?: (key: string, row: any, formatted: string) => ReactNode;
  getRowKey?: (row: any, index: number) => string | number;
  emptyText?: string;
  /** Increment to open the columns menu (header Columns button) */
  columnsMenuSignal?: number;
  showColFilters?: boolean;
  onShowColFiltersChange?: (v: boolean) => void;
};

export default function ReportTable({
  title,
  columns,
  rows,
  renderCell,
  getRowKey,
  emptyText = 'No records found.',
  columnsMenuSignal = 0,
  showColFilters: showColFiltersProp,
  onShowColFiltersChange,
}: Props) {
  const [tableSearch, setTableSearch] = useState('');
  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const [showColFiltersInner, setShowColFiltersInner] = useState(true);
  const showColFilters = showColFiltersProp ?? showColFiltersInner;
  const setShowColFilters = (v: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof v === 'function' ? v(showColFilters) : v;
    onShowColFiltersChange?.(next);
    if (showColFiltersProp === undefined) setShowColFiltersInner(next);
  };
  const [visibleKeys, setVisibleKeys] = useState<string[]>(() => columns.map((c) => c.key));
  const [colsOpen, setColsOpen] = useState(false);
  const colsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (columnsMenuSignal > 0) setColsOpen(true);
  }, [columnsMenuSignal]);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    setVisibleKeys(columns.map((c) => c.key));
    setColFilters({});
    setSortKey('');
    setPage(1);
    setTableSearch('');
  }, [columns.map((c) => c.key).join('|')]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!colsRef.current?.contains(e.target as Node)) setColsOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const visibleColumns = useMemo(
    () => columns.filter((c) => visibleKeys.includes(c.key)),
    [columns, visibleKeys]
  );

  const filteredRows = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    return rows.filter((row) => {
      if (q) {
        const hit = visibleColumns.some((c) =>
          formatReportCell(c.key, row[c.key]).toLowerCase().includes(q)
        );
        if (!hit) return false;
      }
      return visibleColumns.every((c) => {
        const f = String(colFilters[c.key] || '')
          .trim()
          .toLowerCase();
        if (!f) return true;
        return formatReportCell(c.key, row[c.key]).toLowerCase().includes(f);
      });
    });
  }, [rows, visibleColumns, tableSearch, colFilters]);

  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows;
    const copy = [...filteredRows];
    copy.sort((a, b) => {
      const cmp = compareValues(a[sortKey], b[sortKey]);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [filteredRows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [tableSearch, colFilters, pageSize, rows.length]);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [safePage, page]);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, safePage, pageSize]);

  const from = sortedRows.length ? (safePage - 1) * pageSize + 1 : 0;
  const to = Math.min(safePage * pageSize, sortedRows.length);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleColumn = (key: string) => {
    setVisibleKeys((prev) => {
      if (prev.includes(key)) {
        if (prev.length <= 1) return prev;
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  };

  const footerTotals = useMemo(() => {
    const map: Record<string, string> = {};
    visibleColumns.forEach((c) => {
      if (!columnShouldTotal(c)) return;
      const sum = sumColumn(sortedRows, c.key);
      map[c.key] = c.money || isMoneyKey(c.key) ? moneyInr(sum) : String(sum);
    });
    return map;
  }, [visibleColumns, sortedRows]);

  const hasFooter = Object.keys(footerTotals).length > 0;

  const pageButtons = useMemo(() => {
    const buttons: number[] = [];
    const max = 5;
    let start = Math.max(1, safePage - 2);
    let end = Math.min(totalPages, start + max - 1);
    start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i += 1) buttons.push(i);
    return buttons;
  }, [safePage, totalPages]);

  return (
    <div className="rs-table-section">
      <div className="rs-table-toolbar">
        <div className="rs-table-toolbar-left">
          <h2>{title}</h2>
          <span className="rs-table-count">{sortedRows.length} records</span>
        </div>
        <div className="rs-table-toolbar-right">
          <label className="rs-search rs-search-sm">
            <Search size={14} strokeWidth={1.75} />
            <input
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Search table…"
            />
          </label>
          <button
            type="button"
            className={`rs-btn ${showColFilters ? 'is-active' : ''}`}
            onClick={() => setShowColFilters(!showColFilters)}
          >
            <Filter size={14} strokeWidth={1.75} />
            <span>Column Filters</span>
          </button>
          <div className="rs-dl" ref={colsRef}>
            <button type="button" className="rs-btn" onClick={() => setColsOpen((v) => !v)}>
              <Columns3 size={14} strokeWidth={1.75} />
              <span>Columns</span>
            </button>
            {colsOpen && (
              <div className="rs-dl-menu rs-cols-menu">
                {columns.map((c) => (
                  <label key={c.key} className="rs-cols-item">
                    <input
                      type="checkbox"
                      checked={visibleKeys.includes(c.key)}
                      onChange={() => toggleColumn(c.key)}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rs-table-wrap">
        {!sortedRows.length ? (
          <div className="rs-empty">{emptyText}</div>
        ) : (
          <table className="rs-table">
            <thead>
              <tr>
                <th className="rs-sno">S.No</th>
                {visibleColumns.map((c) => {
                  const active = sortKey === c.key;
                  return (
                    <th
                      key={c.key}
                      className={`is-sortable align-${cellAlign(c.key, c)}`}
                      onClick={() => toggleSort(c.key)}
                    >
                      <span className="rs-th-inner">
                        {c.label}
                        {active ? (
                          sortDir === 'asc' ? (
                            <ChevronUp size={13} />
                          ) : (
                            <ChevronDown size={13} />
                          )
                        ) : (
                          <ChevronsUpDown size={13} className="rs-sort-muted" />
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
              {showColFilters && (
                <tr className="rs-filter-row">
                  <th />
                  {visibleColumns.map((c) => (
                    <th key={`f-${c.key}`}>
                      <input
                        className="rs-col-filter"
                        value={colFilters[c.key] || ''}
                        onChange={(e) =>
                          setColFilters((prev) => ({ ...prev, [c.key]: e.target.value }))
                        }
                        placeholder="Filter…"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </th>
                  ))}
                </tr>
              )}
            </thead>
            <tbody>
              {pageRows.map((row, idx) => {
                const sno = (safePage - 1) * pageSize + idx + 1;
                const key = getRowKey ? getRowKey(row, idx) : row.id || row.order_number || row.invoice_no || sno;
                return (
                  <tr key={key}>
                    <td className="rs-sno">{sno}</td>
                    {visibleColumns.map((c) => {
                      const formatted = formatReportCell(c.key, row[c.key]);
                      return (
                        <td key={c.key} className={`align-${cellAlign(c.key, c)}`}>
                          {renderCell ? renderCell(c.key, row, formatted) : formatted}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            {hasFooter && (
              <tfoot>
                <tr>
                  <td className="rs-sno">Σ</td>
                  {visibleColumns.map((c) => (
                    <td key={`t-${c.key}`} className={`align-${cellAlign(c.key, c)}`}>
                      {footerTotals[c.key] ?? ''}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>

      <div className="rs-pagination">
        <div className="rs-page-info">
          Showing {from} to {to} of {sortedRows.length} records
        </div>
        <div className="rs-page-controls">
          <label className="rs-page-size">
            Rows
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="rs-page-btn"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={15} /> Prev
          </button>
          {pageButtons.map((n) => (
            <button
              key={n}
              type="button"
              className={`rs-page-num ${n === safePage ? 'is-active' : ''}`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className="rs-page-btn"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
