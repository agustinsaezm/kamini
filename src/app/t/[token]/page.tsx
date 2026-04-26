'use client'

import { useState, useEffect, use } from 'react'
import { generateSchedule, getEndDate, getDoseTimesForDay } from '@/lib/schedule'

interface Medication {
  id: string
  name: string
  dose: string
  startDate: string
  frequencyDays: number
  timesPerDay: number
  firstDoseTime: string
  durationDays: number
  note: string | null
}

interface Treatment {
  id: string
  patientName: string
  patientRut: string | null
  shareToken: string
  createdAt: string
  medications: Medication[]
}

interface DoseSlot {
  time: string
  meds: { name: string; dose: string }[]
}

interface DayGroup {
  dateStr: string
  label: string
  isToday: boolean
  isTomorrow: boolean
  slots: DoseSlot[]
}

const TIME_OPTIONS: string[] = []
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }
}

function getTodayStr() {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return t.toISOString().split('T')[0]
}

function formatDayLabel(dateStr: string): { label: string; isToday: boolean; isTomorrow: boolean } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const d = new Date(dateStr + 'T00:00:00')
  const dayName = d.toLocaleDateString('es-CL', { weekday: 'long' })
  const dayCapital = dayName.charAt(0).toUpperCase() + dayName.slice(1)
  const monthName = d.toLocaleDateString('es-CL', { month: 'long' })
  const shortLabel = `${dayCapital} ${d.getDate()} de ${monthName}`

  if (d.toDateString() === today.toDateString()) {
    return { label: shortLabel, isToday: true, isTomorrow: false }
  }
  if (d.toDateString() === tomorrow.toDateString()) {
    return { label: shortLabel, isToday: false, isTomorrow: true }
  }
  return { label: shortLabel, isToday: false, isTomorrow: false }
}

function buildDayGroups(medications: Medication[], showAll: boolean): DayGroup[] {
  const todayStr = getTodayStr()
  const map: Map<string, Map<string, { name: string; dose: string }[]>> = new Map()

  for (const med of medications) {
    const doses = generateSchedule(med)
    for (const dose of doses) {
      if (!showAll && dose.date < todayStr) continue
      if (!map.has(dose.date)) map.set(dose.date, new Map())
      const timeMap = map.get(dose.date)!
      if (!timeMap.has(dose.time)) timeMap.set(dose.time, [])
      timeMap.get(dose.time)!.push({ name: med.name, dose: med.dose })
    }
  }

  const sortedDates = [...map.keys()].sort()
  const filtered = showAll
    ? sortedDates
    : sortedDates.filter(d => {
        const maxDate = new Date(todayStr + 'T00:00:00')
        maxDate.setDate(maxDate.getDate() + 30)
        return d <= maxDate.toISOString().split('T')[0]
      })

  return filtered.map(dateStr => {
    const timeMap = map.get(dateStr)!
    const sortedTimes = [...timeMap.keys()].sort()
    const { label, isToday, isTomorrow } = formatDayLabel(dateStr)
    return {
      dateStr,
      label,
      isToday,
      isTomorrow,
      slots: sortedTimes.map(time => ({ time, meds: timeMap.get(time)! })),
    }
  })
}

function EditDoseTimeModal({
  med, token, onSave, onClose,
}: {
  med: Medication; token: string
  onSave: (medId: string, newTime: string) => void; onClose: () => void
}) {
  const [time, setTime] = useState(med.firstDoseTime)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const doseTimes = getDoseTimesForDay({ ...med, firstDoseTime: time })

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/treatments/public/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicationId: med.id, firstDoseTime: time }),
      })
      if (!res.ok) { setError('No se pudo guardar. Intenta de nuevo.'); setSaving(false); return }
      onSave(med.id, time); onClose()
    } catch { setError('Error de conexión.'); setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(11,28,48,0.5)' }} onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-sm"
        style={{ border: '1px solid #c2c6d4' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold" style={{ color: '#0b1c30' }}>Editar hora de primera dosis</h2>
          <button onClick={onClose} style={{ color: '#424752' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>
        <p className="text-sm mb-4 font-medium" style={{ color: '#005EB8' }}>{med.name} · {med.dose}</p>
        <div className="mb-4">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: '#424752' }}>
            Hora de la primera dosis
          </label>
          <select value={time} onChange={e => setTime(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ border: '1px solid #c2c6d4', backgroundColor: '#fff', color: '#0b1c30' }}>
            {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="mb-5">
          <p className="text-xs font-semibold mb-1.5" style={{ color: '#424752' }}>
            Horarios resultantes ({med.timesPerDay} {med.timesPerDay === 1 ? 'toma' : 'tomas'} al día):
          </p>
          <div className="flex gap-2 flex-wrap">
            {doseTimes.map(t => (
              <span key={t} className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: '#e5eeff', color: '#005EB8' }}>{t}</span>
            ))}
          </div>
        </div>
        {error && <p className="text-xs mb-4" style={{ color: '#b91c1c' }}>{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
            style={{ border: '1px solid #c2c6d4', color: '#424752' }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: '#005EB8' }}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Sidebar: medication details card
function MedDetailCard({
  med, onEdit,
}: {
  med: Medication; onEdit: (med: Medication) => void
}) {
  const endDate = getEndDate(med.startDate, med.durationDays)
  const todayStr = getTodayStr()
  const isActive = endDate >= todayStr
  const startFormatted = new Date(med.startDate + 'T00:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
  const endFormatted = new Date(endDate + 'T00:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
  const doseTimes = getDoseTimesForDay(med)

  return (
    <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #c2c6d4' }}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3 className="font-bold text-sm leading-tight" style={{ color: '#0b1c30' }}>{med.name}</h3>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
              style={isActive
                ? { backgroundColor: '#dcfce7', color: '#166534' }
                : { backgroundColor: '#f1f5f9', color: '#475569' }}
            >
              {isActive ? 'Activo' : 'Completado'}
            </span>
          </div>
          <p className="text-xs" style={{ color: '#424752' }}>{med.dose}</p>
        </div>
      </div>

      {/* Dose times */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        {doseTimes.map(t => (
          <span key={t} className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#e5eeff', color: '#005EB8' }}>{t}</span>
        ))}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-3 text-xs">
        <div>
          <span style={{ color: '#727783' }}>Inicio </span>
          <span className="font-semibold" style={{ color: '#0b1c30' }}>{startFormatted}</span>
        </div>
        <div>
          <span style={{ color: '#727783' }}>Término </span>
          <span className="font-semibold" style={{ color: '#0b1c30' }}>{endFormatted}</span>
        </div>
        <div>
          <span style={{ color: '#727783' }}>Frecuencia </span>
          <span className="font-semibold" style={{ color: '#0b1c30' }}>
            {med.frequencyDays === 1 ? 'Cada día' : `c/${med.frequencyDays} días`}
          </span>
        </div>
        <div>
          <span style={{ color: '#727783' }}>Tomas/día </span>
          <span className="font-semibold" style={{ color: '#0b1c30' }}>{med.timesPerDay}</span>
        </div>
      </div>

      {med.note && (
        <div className="flex items-start gap-1.5 px-2.5 py-2 rounded-lg text-xs mb-3"
          style={{ backgroundColor: '#eff4ff', color: '#424752' }}>
          <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: 14, color: '#005EB8' }}>info</span>
          {med.note}
        </div>
      )}

      <button
        onClick={() => onEdit(med)}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
        style={{ backgroundColor: '#eff4ff', color: '#005EB8', border: '1px solid #c2c6d4' }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e5eeff')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#eff4ff')}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
        Editar horario de primera dosis
      </button>
    </div>
  )
}

export default function PatientView({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [treatment, setTreatment] = useState<Treatment | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [editingMed, setEditingMed] = useState<Medication | null>(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    fetch(`/api/treatments/public/${token}`)
      .then(res => { if (!res.ok) { setNotFound(true); return null } return res.json() })
      .then(data => { if (data) setTreatment(data); setLoading(false) })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [token])

  const handleDoseTimeSaved = (medId: string, newTime: string) => {
    setTreatment(prev => prev
      ? { ...prev, medications: prev.medications.map(m => m.id === medId ? { ...m, firstDoseTime: newTime } : m) }
      : prev)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f9ff' }}>
        <div className="text-center">
          <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#005EB8' }}>progress_activity</span>
          <p className="mt-3 text-sm" style={{ color: '#424752' }}>Cargando tratamiento...</p>
        </div>
      </div>
    )
  }

  if (notFound || !treatment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f8f9ff' }}>
        <div className="text-center max-w-sm">
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#c2c6d4' }}>link_off</span>
          <h1 className="mt-4 text-lg font-bold" style={{ color: '#0b1c30' }}>Enlace no válido</h1>
          <p className="mt-2 text-sm" style={{ color: '#424752' }}>Este enlace de tratamiento no existe o fue eliminado.</p>
        </div>
      </div>
    )
  }

  const todayStr = getTodayStr()
  const allCompleted = treatment.medications.every(m => getEndDate(m.startDate, m.durationDays) < todayStr)
  const dayGroups = buildDayGroups(treatment.medications, showAll || allCompleted)
  const createdAt = new Date(treatment.createdAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9ff' }}>
      {/* Header */}
      <header className="bg-white sticky top-0 z-40" style={{ borderBottom: '1px solid #c2c6d4' }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#005EB8' }}>medication</span>
          <span className="text-lg font-bold" style={{ color: '#005EB8' }}>Kamini</span>
          <span className="text-sm ml-1" style={{ color: '#424752' }}>· Plan de Tratamiento</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Patient card */}
        <div className="bg-white rounded-xl p-4 mb-6 flex items-center gap-4"
          style={{ border: '1px solid #c2c6d4' }}>
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: '#005EB8' }}>
            {treatment.patientName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base leading-tight" style={{ color: '#0b1c30' }}>{treatment.patientName}</p>
            <p className="text-xs mt-0.5" style={{ color: '#727783' }}>
              {treatment.patientRut ? `RUT ${treatment.patientRut} · ` : ''}Plan generado el {createdAt}
            </p>
          </div>
          {allCompleted && (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
              Completado
            </span>
          )}
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* LEFT: Calendar */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold mb-4" style={{ color: '#0b1c30' }}>
              {allCompleted ? 'Historial de tomas' : 'Calendario de tomas'}
            </h2>

            {dayGroups.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl" style={{ border: '1px solid #c2c6d4' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#c2c6d4' }}>event_available</span>
                <p className="mt-3 text-sm" style={{ color: '#424752' }}>No hay tomas programadas próximamente.</p>
                <button onClick={() => setShowAll(true)}
                  className="mt-3 text-sm font-semibold underline" style={{ color: '#005EB8' }}>
                  Ver historial completo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {dayGroups.map(day => (
                  <div key={day.dateStr}
                    className={day.isToday ? 'rounded-2xl p-4' : ''}
                    style={day.isToday ? { backgroundColor: '#e5eeff', border: '1.5px solid #005EB8' } : {}}>

                    {/* Day header */}
                    <div className="flex items-center gap-2 mb-2.5">
                      {day.isToday && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: '#005EB8' }}>
                          HOY
                        </span>
                      )}
                      {day.isTomorrow && (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                          style={{ backgroundColor: '#e5eeff', color: '#005EB8' }}>
                          MAÑANA
                        </span>
                      )}
                      <p className={`text-xs font-bold uppercase tracking-wide ${day.isToday ? '' : ''}`}
                        style={{ color: day.isToday ? '#005EB8' : '#424752' }}>
                        {day.label}
                      </p>
                    </div>

                    {/* Dose slots */}
                    <div className="space-y-2">
                      {day.slots.map(slot => (
                        <div key={slot.time}
                          className="bg-white rounded-xl px-4 py-3.5 flex items-start gap-4"
                          style={{
                            border: day.isToday ? '1.5px solid #005EB8' : '1px solid #e5eeff',
                            boxShadow: day.isToday ? '0 1px 6px rgba(0,94,184,0.10)' : 'none',
                          }}>
                          <div className="flex-shrink-0 w-12 text-center">
                            <p className="text-base font-bold" style={{ color: '#005EB8' }}>{slot.time}</p>
                          </div>
                          <div className="flex-1 space-y-1.5">
                            {slot.meds.map((med, i) => (
                              <div key={i} className="flex items-baseline gap-2">
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                                  style={{ backgroundColor: '#005EB8' }} />
                                <p className="text-sm font-semibold" style={{ color: '#0b1c30' }}>
                                  {med.name}
                                  <span className="font-normal ml-1" style={{ color: '#424752' }}>· {med.dose}</span>
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {!showAll && !allCompleted && (
                  <button onClick={() => setShowAll(true)}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    style={{ border: '1px solid #c2c6d4', color: '#005EB8', backgroundColor: '#fff' }}>
                    Ver todo el calendario
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Sticky sidebar - Medication details */}
          <div className="w-full lg:w-80 xl:w-96 lg:sticky lg:top-20 lg:self-start" style={{ maxHeight: 'calc(100vh - 88px)', overflowY: 'auto' }}>
            <h2 className="text-base font-bold mb-4" style={{ color: '#0b1c30' }}>
              Medicamentos
            </h2>
            <div className="space-y-3">
              {treatment.medications.map(med => (
                <MedDetailCard key={med.id} med={med} onEdit={setEditingMed} />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Edit modal */}
      {editingMed && (
        <EditDoseTimeModal
          med={editingMed} token={token}
          onSave={handleDoseTimeSaved}
          onClose={() => setEditingMed(null)}
        />
      )}
    </div>
  )
}
