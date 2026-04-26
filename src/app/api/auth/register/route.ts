import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, specialty } = body

    if (!name || !email || !password) {
      return Response.json(
        { error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const existing = await prisma.doctor.findUnique({ where: { email } })
    if (existing) {
      return Response.json(
        { error: 'Email ya registrado' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const doctor = await prisma.doctor.create({
      data: {
        name,
        email,
        password: hashedPassword,
        specialty: specialty || null,
      },
    })

    return Response.json(
      { id: doctor.id, name: doctor.name, email: doctor.email },
      { status: 201 }
    )
  } catch {
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
