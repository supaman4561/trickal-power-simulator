'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Header from '@/app/components/Header'
import CharacterTable from '@/app/components/CharacterTable'
import AddCharacterModal from '@/app/components/AddCharacterModal'
import { Plan, Character } from '@/lib/types'

export default function PlanDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const planId = params.id as string

  const [plan, setPlan] = useState<Plan | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [planName, setPlanName] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  const fetchPlan = useCallback(async () => {
    const [planRes, charsRes] = await Promise.all([
      fetch(`/api/plans/${planId}`),
      fetch('/api/characters'),
    ])
    if (planRes.ok) {
      const planData = await planRes.json()
      setPlan(planData)
      setPlanName(planData.name)
    }
    if (charsRes.ok) {
      setCharacters(await charsRes.json())
    }
    setLoading(false)
  }, [planId])

  useEffect(() => {
    if (session) fetchPlan()
  }, [session, fetchPlan])

  const updatePlanName = async () => {
    setEditingName(false)
    if (planName !== plan?.name) {
      await fetch(`/api/plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: planName }),
      })
    }
  }

  const addCharacter = async (characterId: string) => {
    const res = await fetch(`/api/plans/${planId}/characters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId, targetLevel: 1, targetEquipRank: 1, targetSkillLevel: 1, targetStar: 1 }),
    })
    if (res.ok) fetchPlan()
  }

  const updateCharacter = async (charId: string, field: string, value: number) => {
    await fetch(`/api/plans/${planId}/characters/${charId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    setPlan((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        characters: prev.characters.map((c) =>
          c.id === charId ? { ...c, [field]: value } : c
        ),
      }
    })
  }

  const removeCharacter = async (charId: string) => {
    await fetch(`/api/plans/${planId}/characters/${charId}`, { method: 'DELETE' })
    setPlan((prev) => {
      if (!prev) return prev
      return { ...prev, characters: prev.characters.filter((c) => c.id !== charId) }
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-muted-foreground">読み込み中...</p>
        </main>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-destructive">プランが見つかりません</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/plans')}
            className="text-muted-foreground hover:text-foreground transition"
          >
            ← 戻る
          </button>
          {editingName ? (
            <input
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              onBlur={updatePlanName}
              onKeyDown={(e) => e.key === 'Enter' && updatePlanName()}
              className="text-2xl font-bold bg-input border border-border rounded px-2 py-1 text-foreground"
              autoFocus
            />
          ) : (
            <h2
              onClick={() => setEditingName(true)}
              className="text-2xl font-bold text-foreground cursor-pointer hover:text-primary transition"
            >
              {plan.name}
            </h2>
          )}
        </div>

        <div className="mb-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition"
          >
            + キャラクター追加
          </button>
        </div>

        <CharacterTable
          planCharacters={plan.characters}
          characters={characters}
          onUpdate={updateCharacter}
          onRemove={removeCharacter}
        />

        <AddCharacterModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={addCharacter}
          existingCharacterIds={plan.characters.map((c) => c.characterId)}
        />
      </main>
    </div>
  )
}
