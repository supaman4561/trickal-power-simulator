import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'

export interface CharacterCSVRow {
  name: string
  role: string
  personality: string
  race: string
  board1_1: string
  board1_2: string
  board2_1: string
  board2_2: string
  board2_3: string
  board3_1: string
  board3_2: string
  board3_3: string
  board3_4: string | undefined
  boardType: string
  raceType: string
}

export function parseCharacterCSV(): CharacterCSVRow[] {
  const csvPath = path.join(process.cwd(), 'trickal_board.csv')
  const fileContent = fs.readFileSync(csvPath, 'utf-8')

  const records = parse(fileContent, {
    skip_empty_lines: true,
    from_line: 3, // Skip header rows
    relax_column_count: true,
  })

  return records
    .filter((r: string[]) => r[1] && r[1].trim() !== '' && r[22] && r[22].trim() !== '')
    .map((r: string[]) => ({
      name: r[1]?.trim(),
      role: r[2]?.trim(),
      personality: r[3]?.trim(),
      race: r[4]?.trim(),
      board1_1: r[6]?.trim(),
      board1_2: r[8]?.trim(),
      board2_1: r[10]?.trim(),
      board2_2: r[12]?.trim(),
      board2_3: r[14]?.trim(),
      board3_1: r[16]?.trim(),
      board3_2: r[18]?.trim(),
      board3_3: r[20]?.trim(),
      board3_4: r[22]?.trim() === '' ? undefined : r[22]?.trim(),
      boardType: r[23]?.trim(),
      raceType: r[24]?.trim(),
    }))
    .filter((r: CharacterCSVRow) => r.raceType && r.raceType !== '')
}
