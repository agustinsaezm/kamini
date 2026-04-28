'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.replace('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-on-surface-variant">Cargando...</div>
      </div>
    )
  }

  if (status === 'authenticated') return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Credenciales inválidas. Verifica tu email y contraseña.')
      setLoading(false)
    } else {
      router.replace('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Brand */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12"
        style={{ backgroundColor: '#005EB8' }}
      >
        <div className="max-w-md text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="material-symbols-outlined text-white" style={{ fontSize: 48 }}>
              medication
            </span>
            <span className="text-5xl font-bold tracking-tight">Kimki</span>
          </div>
          <p className="text-xl font-medium leading-relaxed" style={{ color: '#bfdbfe' }}>
            Planes de tratamiento claros para tus pacientes
          </p>
          <p className="mt-4 text-sm" style={{ color: '#93c5fd' }}>
            Crea, organiza y comparte planes de medicación de forma simple y segura.
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#005EB8' }}>
              medication
            </span>
            <span className="text-3xl font-bold" style={{ color: '#005EB8' }}>Kimki</span>
          </div>

          <h1 className="text-2xl font-bold text-on-surface mb-2">Iniciar sesión</h1>
          <p className="text-on-surface-variant text-sm mb-8">
            Ingresa a tu cuenta de médico
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border p-3 text-sm" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}>
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-on-surface mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@ejemplo.com"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-outline bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#005EB8' } as React.CSSProperties}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-on-surface mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-outline bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-white text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#005EB8' }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            ¿No tienes cuenta?{' '}
            <Link
              href="/register"
              className="font-semibold hover:underline"
              style={{ color: '#005EB8' }}
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
