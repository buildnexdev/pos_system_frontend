import React from 'react'
import Logo from '../../assets/Logo/buildnex-shopos-logo.png'
import { cn } from '../../common/cn.tsx'

interface SpinnerLoaderProps {
  isOpen: boolean
  message?: string
}

const SpinnerLoader: React.FC<SpinnerLoaderProps> = ({ isOpen, message }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6">
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-white/90 p-6 shadow-xl ring-1 ring-black/5">
        <img
          src={Logo}
          alt="Loading"
          className="h-16 w-16 animate-spin-slow"
        />
        {message && <p className="text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  )
}

export default SpinnerLoader
