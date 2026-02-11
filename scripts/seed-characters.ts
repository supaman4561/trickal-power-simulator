import { PrismaClient } from '@prisma/client'
import { parseCharacterCSV } from './parse-csv'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting character seeding...')

  const rows = parseCharacterCSV()
  console.log(`Parsed ${rows.length} characters from CSV`)

  // Group by raceType to create BoardTemplates
  const raceTypeMap = new Map<string, typeof rows[0]>()

  for (const row of rows) {
    if (!raceTypeMap.has(row.raceType)) {
      raceTypeMap.set(row.raceType, row)
    }
  }

  console.log(`Found ${raceTypeMap.size} unique race types`)

  // Create BoardTemplates
  for (const [raceType, row] of raceTypeMap) {
    await prisma.boardTemplate.upsert({
      where: { raceType },
      update: {},
      create: {
        raceType,
        race: row.race,
        boardType: row.boardType,
        goldNodes: {
          board1: [row.board1_1, row.board1_2],
          board2: [row.board2_1, row.board2_2, row.board2_3],
          board3: [row.board3_1, row.board3_2, row.board3_3, row.board3_4].filter((v): v is string => Boolean(v)),
        },
      },
    })
  }

  console.log('BoardTemplates created')

  // Create Characters
  let characterCount = 0
  for (const row of rows) {
    const boardTemplate = await prisma.boardTemplate.findUnique({
      where: { raceType: row.raceType },
    })

    if (!boardTemplate) {
      console.error(`BoardTemplate not found for ${row.raceType}`)
      continue
    }

    await prisma.character.upsert({
      where: { gameId: `char_${row.name}` },
      update: {},
      create: {
        gameId: `char_${row.name}`,
        name: row.name,
        role: row.role,
        personality: row.personality,
        race: row.race,
        raceType: row.raceType,
        boardTemplateId: boardTemplate.id,
        baseHp: 1000,
        basePhysAtk: 200,
        baseMagicAtk: 200,
        basePhysDef: 100,
        baseMagicDef: 100,
      },
    })
    characterCount++
  }

  console.log(`Seeded ${characterCount} characters`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
