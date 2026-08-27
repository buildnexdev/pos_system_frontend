import React from 'react'
import { cn } from '../../common/cn.tsx'

interface StatusBadgeProps {
  label: string
  variant?: 'success' | 'warning' | 'danger' | 'info'
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ label, variant = 'info' }) => {
  const variants = {
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-sky-100 text-sky-800',
  }

  return (
    <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', variants[variant])}>
      {label}
    </span>
  )
}

export default StatusBadge
