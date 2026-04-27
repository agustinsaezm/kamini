import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const treatment = await prisma.treatment.findUnique({
    where: { shareToken: token },
    include: { medications: true },
  })

  if (!treatment) {
    return Response.json({ error: 'Tratamiento no encontrado' }, { status: 404 })
  }

  try {
    const { medicationId, date, time } = await request.json()

    if (!medicationId || !date || !time) {
      return Response.json({ error: 'Datos requeridos' }, { status: 400 })
    }

    const belongsToTreatment = treatment.medications.some(m => m.id === medicationId)
    if (!belongsToTreatment) {
      return Response.json({ error: 'Medicamento no encontrado' }, { status: 404 })
    }

    const existing = await prisma.doseTaken.findUnique({
      where: { medicationId_date_time: { medicationId, date, time } },
    })

    if (existing) {
      await prisma.doseTaken.delete({ where: { id: existing.id } })
      return Response.json({ taken: false })
    } else {
      const created = await prisma.doseTaken.create({ data: { medicationId, date, time } })
      return Response.json({ taken: true, id: created.id })
    }
  } catch {
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
