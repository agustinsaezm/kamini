'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getEndDate, getDoseTimesForDay } from '@/lib/schedule'

export interface MedicationFormData {
  id?: string
  name: string
  dose: string
  startDate: string
  frequencyDays: number
  timesPerDay: number
  firstDoseTime: string
  durationDays: number
  note: string
}

interface TreatmentFormProps {
  initialPatientName?: string
  initialPatientRut?: string
  initialMedications?: MedicationFormData[]
  treatmentId?: string
  mode: 'new' | 'edit'
}

const EMPTY_MEDICATION: MedicationFormData = {
  name: '',
  dose: '',
  startDate: new Date().toISOString().split('T')[0],
  frequencyDays: 1,
  timesPerDay: 1,
  firstDoseTime: '08:00',
  durationDays: 7,
  note: '',
}

const TIME_OPTIONS: string[] = []
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    TIME_OPTIONS.push(
      `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    )
  }
}

function MedicationBlock({
  med,
  index,
  total,
  onChange,
  onRemove,
}: {
  med: MedicationFormData
  index: number
  total: number
  onChange: (index: number, field: keyof MedicationFormData, value: string | number) => void
  onRemove: (index: number) => void
}) {
  const endDate = med.startDate && med.durationDays
    ? getEndDate(med.startDate, Number(med.durationDays))
    : ''

  const doseTimes = getDoseTimesForDay({
    firstDoseTime: med.firstDoseTime,
    timesPerDay: med.timesPerDay,
    startDate: med.startDate,
    frequencyDays: med.frequencyDays,
    durationDays: med.durationDays,
  })

  const inputClass = "w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const inputStyle = { border: '1px solid #c2c6d4', backgroundColor: '#fff', color: '#0b1c30' }
  const labelClass = "block text-xs font-semibold mb-1.5"
  const labelStyle = { color: '#424752' }

  return (
    <div
      className="rounded-xl p-5 relative"
      style={{ border: '1px solid #c2c6d4', backgroundColor: '#fff' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold" style={{ color: '#005EB8' }}>
          <span className="material-symbols-outlined align-middle mr-1.5" style={{ fontSize: 18 }}>medication</span>
          Medicamento {index + 1}
        </h3>
        {total > 1 && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
            style={{ color: '#b91c1c', backgroundColor: '#fef2f2' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
            Eliminar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelClass} style={labelStyle}>Nombre del medicamento *</label>
          <input
            type="text"
            value={med.name}
            onChange={e => onChange(index, 'name', e.target.value)}
            placeholder="Ej: Amoxicilina 500mg"
            required
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Dosis *</label>
          <input
            type="text"
            value={med.dose}
            onChange={e => onChange(index, 'dose', e.target.value)}
            placeholder="Ej: 1 comprimido"
            required
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Timing group */}
      <div
        className="rounded-lg p-4 mb-4"
        style={{ backgroundColor: '#f8f9ff', border: '1px solid #e5eeff' }}
      >
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#005EB8' }}>
          Programación
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass} style={labelStyle}>Fecha de inicio *</label>
            <input
              type="date"
              value={med.startDate}
              onChange={e => onChange(index, 'startDate', e.target.value)}
              required
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>Cada cuántos días *</label>
            <select
              value={med.frequencyDays}
              onChange={e => onChange(index, 'frequencyDays', Number(e.target.value))}
              className={inputClass}
              style={inputStyle}
            >
              {[1, 2, 3, 4, 5, 6, 7].map(d => (
                <option key={d} value={d}>
                  {d === 1 ? 'Cada día' : `Cada ${d} días`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>Veces al día *</label>
            <select
              value={med.timesPerDay}
              onChange={e => onChange(index, 'timesPerDay', Number(e.target.value))}
              className={inputClass}
              style={inputStyle}
            >
              <option value={1}>1 vez</option>
              <option value={2}>2 veces</option>
              <option value={3}>3 veces</option>
              <option value={4}>4 veces</option>
            </select>
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>Hora primera dosis *</label>
            <select
              value={med.firstDoseTime}
              onChange={e => onChange(index, 'firstDoseTime', e.target.value)}
              className={inputClass}
              style={inputStyle}
            >
              {TIME_OPTIONS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>Duración (días) *</label>
            <input
              type="number"
              value={med.durationDays}
              onChange={e => onChange(index, 'durationDays', Number(e.target.value))}
              min={1}
              required
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div>
            <label className={labelClass} style={labelStyle}>Fecha de término</label>
            <input
              type="text"
              value={endDate}
              readOnly
              placeholder="Auto-calculada"
              className={inputClass}
              style={{ ...inputStyle, backgroundColor: '#eff4ff', cursor: 'not-allowed', color: '#424752' }}
            />
          </div>
        </div>

        {/* Dose times preview */}
        {doseTimes.length > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold" style={{ color: '#424752' }}>Horarios de toma:</span>
            {doseTimes.map(t => (
              <span
                key={t}
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#e5eeff', color: '#005EB8' }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Nota (opcional)</label>
        <textarea
          value={med.note}
          onChange={e => onChange(index, 'note', e.target.value)}
          placeholder="Ej: Tomar después de comer algo"
          rows={2}
          className={inputClass}
          style={{ ...inputStyle, resize: 'none' }}
        />
      </div>
    </div>
  )
}

export default function TreatmentForm({
  initialPatientName = '',
  initialPatientRut = '',
  initialMedications = [{ ...EMPTY_MEDICATION }],
  treatmentId,
  mode,
}: TreatmentFormProps) {
  const router = useRouter()
  const [patientName, setPatientName] = useState(initialPatientName)
  const [patientRut, setPatientRut] = useState(initialPatientRut)
  const [medications, setMedications] = useState<MedicationFormData[]>(initialMedications)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleMedChange = useCallback(
    (index: number, field: keyof MedicationFormData, value: string | number) => {
      setMedications(prev => {
        const updated = [...prev]
        updated[index] = { ...updated[index], [field]: value }
        return updated
      })
    },
    []
  )

  const handleMedRemove = useCallback((index: number) => {
    setMedications(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleAddMedication = () => {
    setMedications(prev => [...prev, { ...EMPTY_MEDICATION }])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!patientName.trim()) {
      setError('El nombre del paciente es requerido')
      return
    }

    for (const med of medications) {
      if (!med.name.trim() || !med.dose.trim() || !med.startDate || !med.durationDays) {
        setError('Todos los campos obligatorios de cada medicamento deben estar completos')
        return
      }
    }

    setLoading(true)

    try {
      const body = {
        patientName: patientName.trim(),
        patientRut: patientRut.trim() || undefined,
        medications: medications.map(m => ({
          name: m.name.trim(),
          dose: m.dose.trim(),
          startDate: m.startDate,
          frequencyDays: Number(m.frequencyDays),
          timesPerDay: Number(m.timesPerDay),
          firstDoseTime: m.firstDoseTime,
          durationDays: Number(m.durationDays),
          note: m.note.trim() || undefined,
        })),
      }

      const url = mode === 'edit' ? `/api/treatments/${treatmentId}` : '/api/treatments'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al guardar el tratamiento')
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Error al conectar con el servidor')
      setLoading(false)
    }
  }

  const inputClass = "w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const inputStyle = { border: '1px solid #c2c6d4', backgroundColor: '#fff', color: '#0b1c30' }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#0b1c30' }}>
          {mode === 'new' ? 'Nuevo Tratamiento' : 'Editar Tratamiento'}
        </h1>
        <p className="text-sm mt-1" style={{ color: '#424752' }}>
          {mode === 'new'
            ? 'Completa los datos del paciente y añade los medicamentos del plan.'
            : 'Modifica los datos del plan de tratamiento.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div
            className="rounded-lg p-3 text-sm"
            style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}
          >
            {error}
          </div>
        )}

        {/* Patient section */}
        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #c2c6d4' }}>
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#0b1c30' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#005EB8' }}>person</span>
            Datos del Paciente
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#424752' }}>
                Nombre completo *
              </label>
              <input
                type="text"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                placeholder="Ej: Juan Pérez González"
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#424752' }}>
                RUT <span style={{ color: '#727783' }}>(opcional)</span>
              </label>
              <input
                type="text"
                value={patientRut}
                onChange={e => setPatientRut(e.target.value)}
                placeholder="Ej: 12.345.678-9"
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Medications */}
        <div>
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#0b1c30' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#005EB8' }}>vaccines</span>
            Medicamentos
          </h2>

          <div className="space-y-4">
            {medications.map((med, idx) => (
              <MedicationBlock
                key={idx}
                med={med}
                index={idx}
                total={medications.length}
                onChange={handleMedChange}
                onRemove={handleMedRemove}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddMedication}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={{ border: '2px dashed #c2c6d4', color: '#005EB8', backgroundColor: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#eff4ff')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Añadir otro medicamento
          </button>
        </div>

        {/* Actions */}
        <div
          className="flex flex-col sm:flex-row gap-3 pt-4"
          style={{ borderTop: '1px solid #c2c6d4' }}
        >
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors"
            style={{ border: '1px solid #c2c6d4', color: '#424752', backgroundColor: '#fff' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#eff4ff')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#005EB8' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#00478d' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = '#005EB8' }}
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>
                Guardando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
                {mode === 'new' ? 'Crear Tratamiento' : 'Guardar Cambios'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
