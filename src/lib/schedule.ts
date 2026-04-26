export interface MedicationInput {
  startDate: string
  frequencyDays: number
  timesPerDay: number
  firstDoseTime: string
  durationDays: number
}

export interface DoseEntry {
  date: string
  time: string
}

export function getEndDate(startDate: string, durationDays: number): string {
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(start)
  end.setDate(end.getDate() + durationDays - 1)
  return end.toISOString().split('T')[0]
}

export function generateSchedule(medication: MedicationInput): DoseEntry[] {
  const { startDate, frequencyDays, timesPerDay, firstDoseTime, durationDays } =
    medication

  const endDate = getEndDate(startDate, durationDays)
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')

  const [firstHourStr, firstMinStr] = firstDoseTime.split(':')
  const firstHour = parseInt(firstHourStr, 10)
  const firstMin = parseInt(firstMinStr, 10)

  const intervalHours = 24 / timesPerDay

  const doses: DoseEntry[] = []

  let current = new Date(start)
  while (current <= end) {
    for (let k = 0; k < timesPerDay; k++) {
      const totalMinutes = firstHour * 60 + firstMin + k * intervalHours * 60
      const doseDate = new Date(current)
      const extraDays = Math.floor(totalMinutes / (24 * 60))
      const minutesInDay = totalMinutes % (24 * 60)
      doseDate.setDate(doseDate.getDate() + extraDays)

      const h = Math.floor(minutesInDay / 60)
      const m = minutesInDay % 60

      const dateStr = doseDate.toISOString().split('T')[0]
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`

      doses.push({ date: dateStr, time: timeStr })
    }

    current.setDate(current.getDate() + frequencyDays)
  }

  doses.sort((a, b) => {
    const cmp = a.date.localeCompare(b.date)
    if (cmp !== 0) return cmp
    return a.time.localeCompare(b.time)
  })

  return doses
}

export function getTreatmentStatus(
  medications: MedicationInput[]
): 'Activa' | 'Completada' {
  if (medications.length === 0) return 'Completada'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  for (const med of medications) {
    const endDate = getEndDate(med.startDate, med.durationDays)
    if (endDate >= todayStr) return 'Activa'
  }

  return 'Completada'
}

export function getDoseTimesForDay(medication: MedicationInput): string[] {
  const { firstDoseTime, timesPerDay } = medication
  const [firstHourStr, firstMinStr] = firstDoseTime.split(':')
  const firstHour = parseInt(firstHourStr, 10)
  const firstMin = parseInt(firstMinStr, 10)
  const intervalHours = 24 / timesPerDay

  const times: string[] = []
  for (let k = 0; k < timesPerDay; k++) {
    const totalMinutes = firstHour * 60 + firstMin + k * intervalHours * 60
    const minutesInDay = totalMinutes % (24 * 60)
    const h = Math.floor(minutesInDay / 60)
    const m = minutesInDay % 60
    times.push(
      `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    )
  }
  return times
}
