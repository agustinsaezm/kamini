import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params

  const treatment = await prisma.treatment.findUnique({
    where: { id },
    include: { medications: true },
  })

  if (!treatment) {
    return Response.json({ error: 'Tratamiento no encontrado' }, { status: 404 })
  }

  if (treatment.doctorId !== session.user.id) {
    return Response.json({ error: 'No autorizado' }, { status: 403 })
  }

  return Response.json(treatment)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.treatment.findUnique({ where: { id } })
  if (!existing) {
    return Response.json({ error: 'Tratamiento no encontrado' }, { status: 404 })
  }
  if (existing.doctorId !== session.user.id) {
    return Response.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { patientName, patientRut, medications } = body

    await prisma.medication.deleteMany({ where: { treatmentId: id } })

    const treatment = await prisma.treatment.update({
      where: { id },
      data: {
        patientName,
        patientRut: patientRut || null,
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

    return Response.json(treatment)
  } catch {
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.treatment.findUnique({ where: { id } })
  if (!existing) {
    return Response.json({ error: 'Tratamiento no encontrado' }, { status: 404 })
  }
  if (existing.doctorId !== session.user.id) {
    return Response.json({ error: 'No autorizado' }, { status: 403 })
  }

  await prisma.treatment.delete({ where: { id } })

  return Response.json({ success: true })
}
