import React from 'react'
import { Heart } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="mt-10 bg-gray-100 text-center text-sm text-gray-600 py-4">
      <div className="flex flex-col items-center gap-2">
        <p>© 2026 DS Nidhi. All Rights Reserved.</p>
        <p className="flex items-center gap-2">
          Developed with
          <span className="inline-flex items-center justify-center text-red-500 animate-heartbeat">
            <Heart className="w-4 h-4" />
          </span>
          by Nandhakumar
        </p>
      </div>
    </footer>
  )
}

export default Footer
