'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    specialty: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          specialty: form.specialty || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al registrarse')
        setLoading(false)
        return
      }

      router.push('/?registered=1')
    } catch {
      setError('Error al conectar con el servidor')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-outline p-8" style={{ borderRadius: 12 }}>
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#005EB8' }}>
              medication
            </span>
            <span className="text-2xl font-bold" style={{ color: '#005EB8' }}>Kamini</span>
          </div>

          <h1 className="text-xl font-bold text-on-surface mb-1">Crear cuenta</h1>
          <p className="text-sm text-on-surface-variant mb-6">
            Regístrate como médico especialista
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border p-3 text-sm" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-on-surface mb-1">
                Nombre completo *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Dr. Juan Pérez"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-outline bg-white text-on-surface text-sm focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-on-surface mb-1">
                Especialidad <span className="text-on-surface-variant">(opcional)</span>
              </label>
              <input
                id="specialty"
                name="specialty"
                type="text"
                value={form.specialty}
                onChange={handleChange}
                placeholder="Ej: Cardiología"
                className="w-full px-4 py-2.5 rounded-lg border border-outline bg-white text-on-surface text-sm focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-on-surface mb-1">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="doctor@ejemplo.com"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-outline bg-white text-on-surface text-sm focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-on-surface mb-1">
                Contraseña *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-outline bg-white text-on-surface text-sm focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-on-surface mb-1">
                Confirmar contraseña *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-outline bg-white text-on-surface text-sm focus:outline-none focus:ring-2"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-white text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{ backgroundColor: '#005EB8' }}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-on-surface-variant">
            ¿Ya tienes cuenta?{' '}
            <Link href="/" className="font-semibold hover:underline" style={{ color: '#005EB8' }}>
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
