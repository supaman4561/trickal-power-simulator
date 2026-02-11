import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const original = await prisma.plan.findFirst({
    where: { id, userId: session.user.id },
    include: { characters: true },
  })

  if (!original) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  const duplicate = await prisma.plan.create({
    data: {
      userId: session.user.id,
      name: `${original.name} (コピー)`,
      description: original.description,
      characters: {
        create: original.characters.map((c) => ({
          characterId: c.characterId,
          currentLevel: c.currentLevel,
          targetLevel: c.targetLevel,
          currentEquipRank: c.currentEquipRank,
          targetEquipRank: c.targetEquipRank,
          currentSkillLevel: c.currentSkillLevel,
          targetSkillLevel: c.targetSkillLevel,
          currentStar: c.currentStar,
          targetStar: c.targetStar,
          currentGoldProgress: c.currentGoldProgress as object,
          targetGoldProgress: c.targetGoldProgress as object,
          currentPurpleProgress: c.currentPurpleProgress as object | undefined,
          targetPurpleProgress: c.targetPurpleProgress as object | undefined,
        })),
      },
    },
    include: { characters: true },
  })

  return NextResponse.json(duplicate, { status: 201 })
}
