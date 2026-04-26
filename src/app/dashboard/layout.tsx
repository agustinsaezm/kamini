import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Header from './Header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f9ff' }}>
      <Header
        name={session.user.name ?? ''}
        specialty={session.user.specialty ?? null}
      />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
