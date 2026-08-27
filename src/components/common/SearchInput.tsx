import React, { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '../ui/Input'

interface SearchInputProps {
  value: string
  placeholder?: string
  onChange: (value: string) => void
  className?: string
  debounceMs?: number
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  placeholder = 'Search...',
  onChange,
  className,
  debounceMs = 300,
}) => {
  const [internalValue, setInternalValue] = useState(value)

  useEffect(() => {
    setInternalValue(value)
  }, [value])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue)
      }
    }, debounceMs)

    return () => window.clearTimeout(timer)
  }, [internalValue, debounceMs, onChange, value])

  return (
    <div className={className}>
      <Input
        placeholder={placeholder}
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        leftIcon={<Search className="w-4 h-4" />}
        aria-label="Search"
      />
    </div>
  )
}

export default SearchInput
