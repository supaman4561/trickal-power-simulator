import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const plans = await prisma.plan.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { characters: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(plans)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, description } = await request.json()

  const plan = await prisma.plan.create({
    data: {
      userId: session.user.id,
      name: name || '新しいプラン',
      description,
    },
  })

  return NextResponse.json(plan, { status: 201 })
}
