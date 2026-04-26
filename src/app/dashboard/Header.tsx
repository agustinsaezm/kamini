'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'

interface HeaderProps {
  name: string
  specialty: string | null
}

export default function Header({ name, specialty }: HeaderProps) {
  return (
    <header className="bg-white sticky top-0 z-50" style={{ borderBottom: '1px solid #c2c6d4' }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#005EB8' }}>
            medication
          </span>
          <span className="text-xl font-bold" style={{ color: '#005EB8' }}>Kamini</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold" style={{ color: '#0b1c30' }}>{name}</p>
            {specialty && (
              <p className="text-xs" style={{ color: '#424752' }}>{specialty}</p>
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ color: '#424752' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#eff4ff')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  )
}
