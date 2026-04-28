'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface DoseCell {
  medId: string
  name: string
  dose: string
  taken: boolean
}

interface Patient {
  treatmentId: string
  patientName: string
  patientRut: string | null
  shareToken: string
  slots: Record<string, DoseCell[]>
}

interface WardData {
  date: string
  patients: Patient[]
}

function getTodayStr() {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return t.toISOString().split('T')[0]
}

function getCurrentTimeStr() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase())
}

function doseStatus(time: string, taken: boolean, dateStr: string, todayStr: string, currentTime: string) {
  if (taken) return 'taken'
  if (dateStr < todayStr) return 'overdue'
  if (dateStr === todayStr && time < currentTime) return 'overdue'
  return 'future'
}

export default function WardPage() {
  const [date, setDate] = useState(getTodayStr)
  const [data, setData] = useState<WardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(getCurrentTimeStr)

  // Update current time every minute
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(getCurrentTimeStr()), 60_000)
    return () => clearInterval(id)
  }, [])

  const fetchWard = useCallback(async (d: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/ward?date=${d}`)
      const json = await res.json()
      setData(json)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchWard(date) }, [date, fetchWard])

  const handleToggle = async (shareToken: string, medId: string, time: string) => {
    const key = `${medId}-${time}`
    if (toggling === key) return
    setToggling(key)

    // Optimistic update
    setData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        patients: prev.patients.map(p => {
          if (p.shareToken !== shareToken) return p
          return {
            ...p,
            slots: Object.fromEntries(
              Object.entries(p.slots).map(([t, meds]) => [
                t,
                meds.map(m => m.medId === medId && t === time ? { ...m, taken: !m.taken } : m),
              ])
            ),
          }
        }),
      }
    })

    try {
      await fetch(`/api/treatments/public/${shareToken}/doses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicationId: medId, date, time }),
      })
    } catch {
      // Revert on error
      setData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          patients: prev.patients.map(p => {
            if (p.shareToken !== shareToken) return p
            return {
              ...p,
              slots: Object.fromEntries(
                Object.entries(p.slots).map(([t, meds]) => [
                  t,
                  meds.map(m => m.medId === medId && t === time ? { ...m, taken: !m.taken } : m),
                ])
              ),
            }
          }),
        }
      })
    } finally {
      setToggling(null)
    }
  }

  const todayStr = getTodayStr()
  const isToday = date === todayStr
  const canCheck = date <= todayStr

  // Collect all unique time slots sorted
  const allTimes = data
    ? [...new Set(data.patients.flatMap(p => Object.keys(p.slots)))].sort()
    : []

  return (
    <div className="max-w-full px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg transition-colors"
            style={{ color: '#424752' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#eff4ff')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0b1c30' }}>Vista de turno</h1>
            <p className="text-sm mt-0.5 capitalize" style={{ color: '#424752' }}>{formatDateLabel(date)}</p>
          </div>
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-2">
          {!isToday && (
            <button
              onClick={() => setDate(todayStr)}
              className="px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{ backgroundColor: '#eff4ff', color: '#005EB8', border: '1px solid #c2c6d4' }}
            >
              Hoy
            </button>
          )}
          <button
            onClick={() => setDate(d => addDays(d, -1))}
            className="p-2 rounded-lg transition-colors"
            style={{ border: '1px solid #c2c6d4', backgroundColor: '#fff', color: '#424752' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8f9ff')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
          </button>
          <button
            onClick={() => setDate(d => addDays(d, 1))}
            className="p-2 rounded-lg transition-colors"
            style={{ border: '1px solid #c2c6d4', backgroundColor: '#fff', color: '#424752' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8f9ff')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#005EB8' }}>progress_activity</span>
          <p className="mt-3 text-sm" style={{ color: '#424752' }}>Cargando...</p>
        </div>
      ) : !data || data.patients.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-xl" style={{ border: '1px solid #c2c6d4' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#c2c6d4' }}>event_busy</span>
          <p className="mt-4 text-base font-semibold" style={{ color: '#0b1c30' }}>Sin pacientes con dosis este día</p>
          <p className="mt-1 text-sm" style={{ color: '#424752' }}>Ningún tratamiento activo tiene dosis programadas para esta fecha.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #c2c6d4' }}>
          <table className="border-collapse" style={{ minWidth: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: '#eff4ff', borderBottom: '1px solid #c2c6d4' }}>
                {/* Time column header */}
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: '#424752',
                    position: 'sticky',
                    left: 0,
                    backgroundColor: '#eff4ff',
                    zIndex: 10,
                    minWidth: 80,
                    borderRight: '1px solid #c2c6d4',
                  }}
                >
                  Hora
                </th>
                {/* Patient columns */}
                {data.patients.map(p => (
                  <th
                    key={p.treatmentId}
                    className="px-4 py-3 text-left text-xs font-semibold"
                    style={{ color: '#424752', minWidth: 200, borderRight: '1px solid #e5eeff' }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: '#005EB8' }}
                      >
                        {p.patientName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold truncate" style={{ color: '#0b1c30' }}>{p.patientName}</p>
                        {p.patientRut && <p className="text-xs font-normal" style={{ color: '#727783' }}>{p.patientRut}</p>}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allTimes.map((time, rowIdx) => {
                const isLast = rowIdx === allTimes.length - 1
                const status = doseStatus(time, false, date, todayStr, currentTime)
                const rowIsOverdue = status === 'overdue'

                return (
                  <tr
                    key={time}
                    style={{
                      borderBottom: isLast ? 'none' : '1px solid #e5eeff',
                      backgroundColor: rowIsOverdue && isToday ? '#fffbeb' : '#fff',
                    }}
                  >
                    {/* Time cell */}
                    <td
                      className="px-4 py-3"
                      style={{
                        position: 'sticky',
                        left: 0,
                        backgroundColor: rowIsOverdue && isToday ? '#fffbeb' : '#fff',
                        zIndex: 5,
                        borderRight: '1px solid #c2c6d4',
                      }}
                    >
                      <span className="text-sm font-bold" style={{ color: rowIsOverdue && isToday ? '#b45309' : '#005EB8' }}>
                        {time}
                      </span>
                    </td>

                    {/* Patient cells */}
                    {data.patients.map(p => {
                      const meds = p.slots[time]
                      return (
                        <td
                          key={p.treatmentId}
                          className="px-4 py-3"
                          style={{ verticalAlign: 'top', borderRight: '1px solid #e5eeff' }}
                        >
                          {meds ? (
                            <div className="space-y-2">
                              {meds.map(med => {
                                const s = doseStatus(time, med.taken, date, todayStr, currentTime)
                                const key = `${med.medId}-${time}`
                                const isToggling = toggling === key

                                return (
                                  <div key={med.medId} className="flex items-start gap-2">
                                    {/* Status indicator */}
                                    <div className="flex-shrink-0 mt-0.5">
                                      {s === 'taken' ? (
                                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#16a34a' }}>check_circle</span>
                                      ) : s === 'overdue' ? (
                                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#d97706' }}>schedule</span>
                                      ) : (
                                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#c2c6d4' }}>radio_button_unchecked</span>
                                      )}
                                    </div>

                                    {/* Med info */}
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className="text-xs font-semibold leading-tight"
                                        style={{
                                          color: s === 'taken' ? '#16a34a' : s === 'overdue' ? '#92400e' : '#0b1c30',
                                          textDecoration: s === 'taken' ? 'line-through' : 'none',
                                        }}
                                      >
                                        {med.name}
                                      </p>
                                      <p className="text-xs" style={{ color: s === 'taken' ? '#86efac' : '#727783' }}>
                                        {med.dose}
                                      </p>
                                    </div>

                                    {/* Check button */}
                                    {canCheck && (
                                      <button
                                        onClick={() => handleToggle(p.shareToken, med.medId, time)}
                                        disabled={isToggling}
                                        title={med.taken ? 'Desmarcar' : 'Marcar como administrado'}
                                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
                                        style={med.taken
                                          ? { backgroundColor: '#dcfce7', border: '1.5px solid #16a34a' }
                                          : { backgroundColor: '#f8f9ff', border: '1.5px solid #c2c6d4' }
                                        }
                                        onMouseEnter={e => { if (!med.taken) e.currentTarget.style.borderColor = '#005EB8' }}
                                        onMouseLeave={e => { if (!med.taken) e.currentTarget.style.borderColor = '#c2c6d4' }}
                                      >
                                        {isToggling
                                          ? <span className="material-symbols-outlined" style={{ fontSize: 12, color: '#9ca3af' }}>progress_activity</span>
                                          : <span className="material-symbols-outlined" style={{ fontSize: 12, color: med.taken ? '#16a34a' : '#c2c6d4' }}>check</span>
                                        }
                                      </button>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <span style={{ color: '#e5eeff' }}>—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
