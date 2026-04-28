'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { getTreatmentStatus } from '@/lib/schedule'

interface Medication {
  id: string
  name: string
  startDate: string
  durationDays: number
}

interface Treatment {
  id: string
  patientName: string
  patientRut: string | null
  shareToken: string
  createdAt: string
  medications: Medication[]
}

// ── Share modal ──────────────────────────────────────────────────────────────

function ShareModal({
  treatment,
  onClose,
}: {
  treatment: Treatment
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/t/${treatment.shareToken}`
      : `/t/${treatment.shareToken}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // fallback for browsers that block clipboard
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(11,28,48,0.55)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden"
        style={{ border: '1px solid #c2c6d4', boxShadow: '0 20px 60px rgba(0,94,184,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #e5eeff' }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ color: '#0b1c30' }}>
              Compartir tratamiento
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#424752' }}>
              {treatment.patientName}
              {treatment.patientRut ? ` · ${treatment.patientRut}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#424752' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#eff4ff')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        {/* QR code */}
        <div className="flex flex-col items-center px-5 py-6 gap-4">
          <p className="text-xs text-center" style={{ color: '#424752' }}>
            El paciente puede escanear este código para acceder a su plan de tratamiento.
          </p>

          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: '#fff', border: '1px solid #c2c6d4' }}
          >
            <QRCodeSVG
              value={url}
              size={192}
              bgColor="#ffffff"
              fgColor="#0b1c30"
              level="M"
            />
          </div>

          {/* URL display */}
          <div
            className="w-full rounded-lg px-3 py-2.5 flex items-center gap-2"
            style={{ backgroundColor: '#f8f9ff', border: '1px solid #e5eeff' }}
          >
            <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: 16, color: '#005EB8' }}>
              link
            </span>
            <span
              className="text-xs flex-1 min-w-0 truncate font-medium"
              style={{ color: '#424752' }}
            >
              {url}
            </span>
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ backgroundColor: copied ? '#16a34a' : '#005EB8' }}
            onMouseEnter={e => {
              if (!copied) e.currentTarget.style.backgroundColor = '#00478d'
            }}
            onMouseLeave={e => {
              if (!copied) e.currentTarget.style.backgroundColor = '#005EB8'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {copied ? 'check_circle' : 'content_copy'}
            </span>
            {copied ? '¡Enlace copiado!' : 'Copiar enlace'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Dashboard page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [loading, setLoading] = useState(true)
  const [sharingTreatment, setSharingTreatment] = useState<Treatment | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchTreatments = useCallback(async () => {
    try {
      const res = await fetch('/api/treatments')
      const data = await res.json()
      setTreatments(Array.isArray(data) ? data : [])
    } catch {
      setTreatments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTreatments()
  }, [fetchTreatments])

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este tratamiento? Esta acción no se puede deshacer.')) return
    setDeletingId(id)
    try {
      await fetch(`/api/treatments/${id}`, { method: 'DELETE' })
      setTreatments(prev => prev.filter(t => t.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0b1c30' }}>Tratamientos</h1>
          <p className="text-sm mt-1" style={{ color: '#424752' }}>
            Administra y comparte los planes de tratamiento de tus pacientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/ward"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={{ border: '1px solid #c2c6d4', color: '#424752', backgroundColor: '#fff' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8f9ff')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>table_view</span>
            Vista de turno
          </Link>
          <Link
            href="/dashboard/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: '#005EB8' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#00478d')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#005EB8')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Nuevo Tratamiento
          </Link>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #c2c6d4' }}>
        {loading ? (
          <div className="py-16 text-center" style={{ color: '#424752' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#005EB8' }}>
              progress_activity
            </span>
            <p className="mt-3 text-sm">Cargando tratamientos...</p>
          </div>
        ) : treatments.length === 0 ? (
          <div className="py-16 text-center px-4">
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#c2c6d4' }}>
              medical_services
            </span>
            <h3 className="mt-4 text-base font-semibold" style={{ color: '#0b1c30' }}>
              No tienes tratamientos aún
            </h3>
            <p className="mt-1 text-sm" style={{ color: '#424752' }}>
              Crea el primer plan de tratamiento para un paciente.
            </p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: '#005EB8' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
              Crear tratamiento
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead style={{ backgroundColor: '#eff4ff', borderBottom: '1px solid #c2c6d4' }}>
                <tr>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#424752' }}>
                    Paciente
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#424752' }}>
                    RUT
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide hidden sm:table-cell" style={{ color: '#424752' }}>
                    Fecha creación
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide hidden md:table-cell" style={{ color: '#424752' }}>
                    Medicamentos
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#424752' }}>
                    Estado
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-right" style={{ color: '#424752' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {treatments.map((treatment, idx) => {
                  const status = getTreatmentStatus(
                    treatment.medications.map(m => ({
                      startDate: m.startDate,
                      durationDays: m.durationDays,
                      frequencyDays: 1,
                      timesPerDay: 1,
                      firstDoseTime: '08:00',
                    }))
                  )
                  const isActive = status === 'Activa'
                  const medNames = treatment.medications.map(m => m.name).join(', ')
                  const shortMedNames = medNames.length > 40 ? medNames.slice(0, 37) + '...' : medNames

                  return (
                    <tr
                      key={treatment.id}
                      style={{
                        borderBottom: idx < treatments.length - 1 ? '1px solid #e5eeff' : 'none',
                      }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ backgroundColor: '#005EB8' }}
                          >
                            {treatment.patientName.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-sm" style={{ color: '#0b1c30' }}>
                            {treatment.patientName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: '#424752' }}>
                        {treatment.patientRut || '—'}
                      </td>
                      <td className="px-5 py-4 text-sm hidden sm:table-cell" style={{ color: '#424752' }}>
                        {formatDate(treatment.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-sm hidden md:table-cell" style={{ color: '#424752' }}>
                        <span title={medNames}>
                          {treatment.medications.length} ({shortMedNames})
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={
                            isActive
                              ? { backgroundColor: '#dcfce7', color: '#166534' }
                              : { backgroundColor: '#f1f5f9', color: '#475569' }
                          }
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: isActive ? '#16a34a' : '#94a3b8' }}
                          />
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* View patient page */}
                          <Link
                            href={`/t/${treatment.shareToken}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg transition-colors"
                            title="Ver vista del paciente"
                            style={{ color: '#424752' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#eff4ff')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>open_in_new</span>
                          </Link>

                          {/* Share → opens modal */}
                          <button
                            onClick={() => setSharingTreatment(treatment)}
                            className="p-2 rounded-lg transition-colors"
                            title="Compartir con paciente"
                            style={{ color: '#005EB8' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#eff4ff')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>share</span>
                          </button>

                          {/* Edit */}
                          <Link
                            href={`/dashboard/${treatment.id}/edit`}
                            className="p-2 rounded-lg transition-colors"
                            title="Editar tratamiento"
                            style={{ color: '#424752' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#eff4ff')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                          </Link>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(treatment.id)}
                            disabled={deletingId === treatment.id}
                            className="p-2 rounded-lg transition-colors disabled:opacity-50"
                            title="Eliminar tratamiento"
                            style={{ color: '#b91c1c' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                              {deletingId === treatment.id ? 'progress_activity' : 'delete'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Share modal */}
      {sharingTreatment && (
        <ShareModal
          treatment={sharingTreatment}
          onClose={() => setSharingTreatment(null)}
        />
      )}
    </div>
  )
}
