import type { ReactNode } from 'react';

export type ReportColumn = {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  /** Include in footer sum when numeric */
  total?: boolean;
  /** Treat as currency in footer */
  money?: boolean;
};

export type ReportKpi = {
  key: string;
  label: string;
  value: string | number;
};

export type ReportHeaderProps = {
  title: string;
  icon?: ReactNode;
  search: string;
  onSearchChange: (v: string) => void;
  onSearchSubmit: () => void;
  searchPlaceholder?: string;
  filterCount?: number;
  onOpenFilters?: () => void;
  showColFilters?: boolean;
  onToggleColFilters?: () => void;
  onOpenColumns?: () => void;
  downloadOpen?: boolean;
  onToggleDownload?: () => void;
  downloadRef?: React.RefObject<HTMLDivElement | null>;
  onExcel?: () => void;
  onCsv?: () => void;
  onPdf?: () => void;
  onPrint?: () => void;
  onClearAll?: () => void;
  clearDisabled?: boolean;
  extraActions?: ReactNode;
};
