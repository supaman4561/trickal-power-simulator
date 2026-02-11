'use client'

import { useState, useEffect } from 'react'
import { Character } from '@/lib/types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onAdd: (characterId: string) => void
  existingCharacterIds: string[]
}

export default function AddCharacterModal({ isOpen, onClose, onAdd, existingCharacterIds }: Props) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetch('/api/characters')
        .then((res) => res.json())
        .then(setCharacters)
    }
  }, [isOpen])

  if (!isOpen) return null

  const filtered = characters.filter(
    (c) =>
      !existingCharacterIds.includes(c.id) &&
      (c.name.includes(search) || c.role.includes(search) || c.race.includes(search))
  )

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-foreground">キャラクター追加</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
          <input
            type="text"
            placeholder="キャラ名で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="overflow-y-auto p-4 flex-1">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => { onAdd(c.id); onClose() }}
              className="w-full text-left px-3 py-2 rounded hover:bg-secondary/50 flex justify-between items-center transition"
            >
              <span className="text-foreground">{c.name}</span>
              <span className="text-xs text-muted-foreground">{c.role} / {c.race}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground text-center py-4">該当するキャラがいません</p>
          )}
        </div>
      </div>
    </div>
  )
}
