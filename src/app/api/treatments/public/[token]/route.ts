import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const treatment = await prisma.treatment.findUnique({
    where: { shareToken: token },
    include: { medications: { include: { dosesTaken: true } } },
  })

  if (!treatment) {
    return Response.json({ error: 'Tratamiento no encontrado' }, { status: 404 })
  }

  return Response.json(treatment)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const treatment = await prisma.treatment.findUnique({
    where: { shareToken: token },
  })

  if (!treatment) {
    return Response.json({ error: 'Tratamiento no encontrado' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const { medicationId, firstDoseTime } = body

    if (!medicationId || !firstDoseTime) {
      return Response.json({ error: 'Datos requeridos' }, { status: 400 })
    }

    const medication = await prisma.medication.findUnique({
      where: { id: medicationId },
    })

    if (!medication || medication.treatmentId !== treatment.id) {
      return Response.json({ error: 'Medicamento no encontrado' }, { status: 404 })
    }

    const updated = await prisma.medication.update({
      where: { id: medicationId },
      data: { firstDoseTime },
    })

    return Response.json(updated)
  } catch {
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
