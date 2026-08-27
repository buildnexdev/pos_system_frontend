import React from 'react'
import { cn } from '../../common/cn.tsx'
import { Button } from '../ui/Button'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions, className }) => {
  return (
    <div className={cn('sticky top-0 z-20 bg-white border-b border-gray-200', className)}>
      <div className="mx-auto flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:px-10 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
          {actions}
        </div>
      </div>
    </div>
  )
}

export default PageHeader
