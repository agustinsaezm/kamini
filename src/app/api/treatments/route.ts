import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { v4 as uuidv4 } from 'uuid'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const treatments = await prisma.treatment.findMany({
    where: { doctorId: session.user.id },
    include: { medications: true },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json(treatments)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { patientName, patientRut, medications } = body

    if (!patientName) {
      return Response.json({ error: 'Nombre del paciente requerido' }, { status: 400 })
    }

    if (!medications || medications.length === 0) {
      return Response.json({ error: 'Al menos un medicamento es requerido' }, { status: 400 })
    }

    const shareToken = uuidv4()

    const treatment = await prisma.treatment.create({
      data: {
        doctorId: session.user.id,
        patientName,
        patientRut: patientRut || null,
        shareToken,
        medications: {
          create: medications.map((med: {
            name: string
            dose: string
            startDate: string
            frequencyDays: number
            timesPerDay: number
            firstDoseTime: string
            durationDays: number
            note?: string
          }) => ({
            name: med.name,
            dose: med.dose,
            startDate: med.startDate,
            frequencyDays: med.frequencyDays,
            timesPerDay: med.timesPerDay,
            firstDoseTime: med.firstDoseTime,
            durationDays: med.durationDays,
            note: med.note || null,
          })),
        },
      },
      include: { medications: true },
    })

    return Response.json(treatment, { status: 201 })
  } catch {
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
