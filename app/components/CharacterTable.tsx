'use client'

import { useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { PlanCharacter, Character } from '@/lib/types'

interface Props {
  planCharacters: PlanCharacter[]
  characters: Character[]
  onUpdate: (charId: string, field: string, value: number) => void
  onRemove: (charId: string) => void
}

type TableRow = PlanCharacter & { characterName: string; role: string; race: string }

const columnHelper = createColumnHelper<TableRow>()

function EditableCell({
  value,
  onChange,
}: {
  value: number
  onChange: (val: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [localValue, setLocalValue] = useState(String(value))

  if (editing) {
    return (
      <input
        type="number"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => {
          setEditing(false)
          const num = parseInt(localValue)
          if (!isNaN(num) && num !== value) onChange(num)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setEditing(false)
            const num = parseInt(localValue)
            if (!isNaN(num) && num !== value) onChange(num)
          }
        }}
        className="w-16 px-1 py-0.5 bg-input border border-primary rounded text-foreground text-center text-sm"
        autoFocus
      />
    )
  }

  return (
    <span
      onClick={() => { setEditing(true); setLocalValue(String(value)) }}
      className="cursor-pointer px-2 py-0.5 rounded hover:bg-secondary/50 text-sm"
    >
      {value}
    </span>
  )
}

export default function CharacterTable({ planCharacters, characters, onUpdate, onRemove }: Props) {
  const charMap = new Map(characters.map((c) => [c.id, c]))

  const data: TableRow[] = planCharacters.map((pc) => {
    const char = charMap.get(pc.characterId)
    return {
      ...pc,
      characterName: char?.name ?? '不明',
      role: char?.role ?? '',
      race: char?.race ?? '',
    }
  })

  const columns = [
    columnHelper.accessor('characterName', {
      header: 'キャラ名',
      cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
    }),
    columnHelper.accessor('role', {
      header: '役割',
      cell: (info) => <span className="text-xs text-muted-foreground">{info.getValue()}</span>,
    }),
    columnHelper.accessor('currentLevel', {
      header: '現在Lv',
      cell: (info) => (
        <EditableCell value={info.getValue()} onChange={(v) => onUpdate(info.row.original.id, 'currentLevel', v)} />
      ),
    }),
    columnHelper.accessor('targetLevel', {
      header: '目標Lv',
      cell: (info) => (
        <EditableCell value={info.getValue()} onChange={(v) => onUpdate(info.row.original.id, 'targetLevel', v)} />
      ),
    }),
    columnHelper.accessor('currentEquipRank', {
      header: '現在装備',
      cell: (info) => (
        <EditableCell value={info.getValue()} onChange={(v) => onUpdate(info.row.original.id, 'currentEquipRank', v)} />
      ),
    }),
    columnHelper.accessor('targetEquipRank', {
      header: '目標装備',
      cell: (info) => (
        <EditableCell value={info.getValue()} onChange={(v) => onUpdate(info.row.original.id, 'targetEquipRank', v)} />
      ),
    }),
    columnHelper.accessor('currentSkillLevel', {
      header: '現在スキル',
      cell: (info) => (
        <EditableCell value={info.getValue()} onChange={(v) => onUpdate(info.row.original.id, 'currentSkillLevel', v)} />
      ),
    }),
    columnHelper.accessor('targetSkillLevel', {
      header: '目標スキル',
      cell: (info) => (
        <EditableCell value={info.getValue()} onChange={(v) => onUpdate(info.row.original.id, 'targetSkillLevel', v)} />
      ),
    }),
    columnHelper.accessor('currentStar', {
      header: '現在★',
      cell: (info) => (
        <EditableCell value={info.getValue()} onChange={(v) => onUpdate(info.row.original.id, 'currentStar', v)} />
      ),
    }),
    columnHelper.accessor('targetStar', {
      header: '目標★',
      cell: (info) => (
        <EditableCell value={info.getValue()} onChange={(v) => onUpdate(info.row.original.id, 'targetStar', v)} />
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <button
          onClick={() => onRemove(info.row.original.id)}
          className="text-destructive/70 hover:text-destructive text-xs transition"
        >
          削除
        </button>
      ),
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-x-auto border border-border rounded-lg">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border bg-secondary/30">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-border/50 hover:bg-secondary/20 transition">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-muted-foreground">
                キャラクターを追加してください
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
