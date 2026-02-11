import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const plan = await prisma.plan.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  const body = await request.json()

  const planCharacter = await prisma.planCharacter.create({
    data: {
      planId: id,
      characterId: body.characterId,
      currentLevel: body.currentLevel ?? 1,
      targetLevel: body.targetLevel ?? 1,
      currentEquipRank: body.currentEquipRank ?? 1,
      targetEquipRank: body.targetEquipRank ?? 1,
      currentSkillLevel: body.currentSkillLevel ?? 1,
      targetSkillLevel: body.targetSkillLevel ?? 1,
      currentStar: body.currentStar ?? 1,
      targetStar: body.targetStar ?? 1,
      currentGoldProgress: body.currentGoldProgress ?? {},
      targetGoldProgress: body.targetGoldProgress ?? {},
    },
  })

  return NextResponse.json(planCharacter, { status: 201 })
}
