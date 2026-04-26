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

  const treatment = await prisma.treatment.findUnique({ where: { id } })

  if (!treatment) {
    return Response.json({ error: 'Tratamiento no encontrado' }, { status: 404 })
  }

  if (treatment.doctorId !== session.user.id) {
    return Response.json({ error: 'No autorizado' }, { status: 403 })
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const url = `${baseUrl}/t/${treatment.shareToken}`

  return Response.json({ url })
}
