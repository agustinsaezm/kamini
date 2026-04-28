import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateSchedule } from '@/lib/schedule'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dateStr = searchParams.get('date') ?? today.toISOString().split('T')[0]

  const treatments = await prisma.treatment.findMany({
    where: { doctorId: session.user.id },
    include: {
      medications: {
        include: { dosesTaken: { where: { date: dateStr } } },
      },
    },
  })

  const patients: {
    treatmentId: string
    patientName: string
    patientRut: string | null
    shareToken: string
    slots: Record<string, { medId: string; name: string; dose: string; taken: boolean }[]>
  }[] = []

  for (const treatment of treatments) {
    const slots: Record<string, { medId: string; name: string; dose: string; taken: boolean }[]> = {}

    for (const med of treatment.medications) {
      const schedule = generateSchedule(med)
      for (const dose of schedule.filter(d => d.date === dateStr)) {
        if (!slots[dose.time]) slots[dose.time] = []
        slots[dose.time].push({
          medId: med.id,
          name: med.name,
          dose: med.dose,
          taken: med.dosesTaken.some(dt => dt.time === dose.time),
        })
      }
    }

    if (Object.keys(slots).length > 0) {
      patients.push({
        treatmentId: treatment.id,
        patientName: treatment.patientName,
        patientRut: treatment.patientRut,
        shareToken: treatment.shareToken,
        slots,
      })
    }
  }

  patients.sort((a, b) => a.patientName.localeCompare(b.patientName))

  return Response.json({ date: dateStr, patients })
}
