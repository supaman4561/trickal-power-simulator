import { PlanCharacter } from './types'

export interface ResourceCost {
  coin: number
  marshmallowGuardLow: number
  marshmallowGuardMid: number
  marshmallowGuardHigh: number
  marshmallowAttackLow: number
  marshmallowAttackMid: number
  marshmallowAttackHigh: number
  marshmallowSupportLow: number
  marshmallowSupportMid: number
  marshmallowSupportHigh: number
  purpleCrayon: number
  goldCrayon: number
}

const emptyResources = (): ResourceCost => ({
  coin: 0,
  marshmallowGuardLow: 0, marshmallowGuardMid: 0, marshmallowGuardHigh: 0,
  marshmallowAttackLow: 0, marshmallowAttackMid: 0, marshmallowAttackHigh: 0,
  marshmallowSupportLow: 0, marshmallowSupportMid: 0, marshmallowSupportHigh: 0,
  purpleCrayon: 0, goldCrayon: 0,
})

const COIN_PER_LEVEL = 1000
const COIN_PER_EQUIP_RANK = 5000
const MARSHMALLOW_PER_SKILL_LOW = 5
const MARSHMALLOW_PER_SKILL_MID = 3
const MARSHMALLOW_PER_SKILL_HIGH = 1

const GOLD_CRAYON_COSTS: Record<string, number> = {
  board1: 2,
  board2: 4,
  board3: 6,
}

export function calculateCharacterCost(
  pc: PlanCharacter,
  role: string
): ResourceCost {
  const cost = emptyResources()

  const levelDiff = Math.max(0, pc.targetLevel - pc.currentLevel)
  cost.coin += levelDiff * COIN_PER_LEVEL

  const equipDiff = Math.max(0, pc.targetEquipRank - pc.currentEquipRank)
  cost.coin += equipDiff * COIN_PER_EQUIP_RANK

  const skillDiff = Math.max(0, pc.targetSkillLevel - pc.currentSkillLevel)
  const rolePrefix = role === 'タンク' ? 'Guard' : role === 'アタッカー' ? 'Attack' : 'Support'

  const lowKey = `marshmallow${rolePrefix}Low` as keyof ResourceCost
  const midKey = `marshmallow${rolePrefix}Mid` as keyof ResourceCost
  const highKey = `marshmallow${rolePrefix}High` as keyof ResourceCost

  cost[lowKey] += skillDiff * MARSHMALLOW_PER_SKILL_LOW
  cost[midKey] += skillDiff * MARSHMALLOW_PER_SKILL_MID
  cost[highKey] += skillDiff * MARSHMALLOW_PER_SKILL_HIGH

  for (const board of ['board1', 'board2', 'board3']) {
    const current = pc.currentGoldProgress?.[board] ?? {}
    const target = pc.targetGoldProgress?.[board] ?? {}

    for (const node of Object.keys(target)) {
      const diff = Math.max(0, (target[node] ?? 0) - (current[node] ?? 0))
      cost.goldCrayon += diff * (GOLD_CRAYON_COSTS[board] ?? 2)
    }
  }

  return cost
}

export function calculateTotalCost(
  planCharacters: PlanCharacter[],
  characterRoles: Map<string, string>
): ResourceCost {
  const total = emptyResources()

  for (const pc of planCharacters) {
    const role = characterRoles.get(pc.characterId) ?? 'アタッカー'
    const cost = calculateCharacterCost(pc, role)

    for (const key of Object.keys(total) as (keyof ResourceCost)[]) {
      total[key] += cost[key]
    }
  }

  return total
}

export function calculatePower(
  level: number,
  equipRank: number,
  skillLevel: number,
  star: number
): number {
  const basePower = level * 100
  const equipPower = equipRank * 500
  const skillPower = skillLevel * 200
  const starPower = star * 1000
  return basePower + equipPower + skillPower + starPower
}
