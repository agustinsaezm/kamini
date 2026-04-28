import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TreatmentForm from '../../TreatmentForm'

export const metadata = {
  title: 'Editar Tratamiento · Kimki',
}

export default async function EditTreatmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session) {
    return notFound()
  }

  const treatment = await prisma.treatment.findUnique({
    where: { id },
    include: { medications: true },
  })

  if (!treatment || treatment.doctorId !== session.user.id) {
    return notFound()
  }

  return (
    <TreatmentForm
      mode="edit"
      treatmentId={treatment.id}
      initialPatientName={treatment.patientName}
      initialPatientRut={treatment.patientRut ?? ''}
      initialMedications={treatment.medications.map(m => ({
        id: m.id,
        name: m.name,
        dose: m.dose,
        startDate: m.startDate,
        frequencyDays: m.frequencyDays,
        timesPerDay: m.timesPerDay,
        firstDoseTime: m.firstDoseTime,
        durationDays: m.durationDays,
        note: m.note ?? '',
      }))}
    />
  )
}
