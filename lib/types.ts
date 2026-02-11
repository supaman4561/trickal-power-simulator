export interface Character {
  id: string
  gameId: string
  name: string
  role: string
  personality: string
  race: string
  raceType: string
  boardTemplate: BoardTemplate
}

export interface BoardTemplate {
  id: string
  raceType: string
  race: string
  boardType: string
  goldNodes: {
    board1: string[]
    board2: string[]
    board3: string[]
  }
}

export interface PlanCharacter {
  id: string
  planId: string
  characterId: string
  currentLevel: number
  targetLevel: number
  currentEquipRank: number
  targetEquipRank: number
  currentSkillLevel: number
  targetSkillLevel: number
  currentStar: number
  targetStar: number
  currentGoldProgress: Record<string, Record<string, number>>
  targetGoldProgress: Record<string, Record<string, number>>
}

export interface Plan {
  id: string
  name: string
  description: string | null
  characters: PlanCharacter[]
}
