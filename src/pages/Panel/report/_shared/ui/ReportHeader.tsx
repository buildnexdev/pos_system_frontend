import {
  Search,
  Filter,
  Columns3,
  FileSpreadsheet,
  Download,
  FileText,
  Printer,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import type { ReportHeaderProps } from './reportUi.types';

export default function ReportHeader({
  title,
  icon,
  search,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = 'Search…',
  filterCount = 0,
  onOpenFilters,
  showColFilters,
  onToggleColFilters,
  onOpenColumns,
  downloadOpen,
  onToggleDownload,
  downloadRef,
  onExcel,
  onCsv,
  onPdf,
  onPrint,
  onClearAll,
  clearDisabled,
  extraActions,
}: ReportHeaderProps) {
  return (
    <div className="rs-header">
      <div className="rs-header-left">
        <span className="rs-header-icon" aria-hidden>
          {icon}
        </span>
        <h1 className="rs-header-title">{title}</h1>
      </div>

      <div className="rs-header-right">
        <label className="rs-search">
          <Search size={15} strokeWidth={1.75} />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSearchSubmit();
              }
            }}
            placeholder={searchPlaceholder}
          />
        </label>

        {onToggleColFilters && (
          <button
            type="button"
            className={`rs-btn ${showColFilters ? 'is-active' : ''}`}
            onClick={onToggleColFilters}
            title="Column filters"
          >
            <Filter size={14} strokeWidth={1.75} />
            <span>Column Filters</span>
          </button>
        )}

        {onOpenFilters && (
          <button
            type="button"
            className={`rs-btn ${filterCount ? 'is-active' : ''}`}
            onClick={onOpenFilters}
            title="Filters"
          >
            <Filter size={14} strokeWidth={1.75} />
            <span>Filters{filterCount ? ` (${filterCount})` : ''}</span>
          </button>
        )}

        {onOpenColumns && (
          <button type="button" className="rs-btn" onClick={onOpenColumns} title="Column visibility">
            <Columns3 size={14} strokeWidth={1.75} />
            <span>Columns</span>
          </button>
        )}

        <div className="rs-dl" ref={downloadRef as any}>
          <button type="button" className="rs-btn" onClick={onToggleDownload} title="Download">
            <FileSpreadsheet size={14} strokeWidth={1.75} />
            <span>Excel</span>
            <ChevronDown size={14} strokeWidth={1.75} />
          </button>
          {downloadOpen && (
            <div className="rs-dl-menu">
              {onExcel && (
                <button type="button" onClick={onExcel}>
                  <FileSpreadsheet size={14} /> Excel
                </button>
              )}
              {onCsv && (
                <button type="button" onClick={onCsv}>
                  <Download size={14} /> CSV
                </button>
              )}
              {onPdf && (
                <button type="button" onClick={onPdf}>
                  <FileText size={14} /> PDF
                </button>
              )}
              {onPrint && (
                <button type="button" onClick={onPrint}>
                  <Printer size={14} /> Print
                </button>
              )}
            </div>
          )}
        </div>

        {onClearAll && (
          <button
            type="button"
            className="rs-btn"
            onClick={onClearAll}
            disabled={clearDisabled}
            title="Clear all"
          >
            <RotateCcw size={14} strokeWidth={1.75} />
            <span>Clear</span>
          </button>
        )}

        {extraActions}
      </div>
    </div>
  );
}
