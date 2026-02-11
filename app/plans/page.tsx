'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/app/components/Header'
import PlanCard from '@/app/components/PlanCard'

interface Plan {
  id: string
  name: string
  description: string | null
  updatedAt: string
  _count: { characters: number }
}

export default function PlansPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchPlans()
    }
  }, [session])

  const fetchPlans = async () => {
    const res = await fetch('/api/plans')
    if (res.ok) {
      const data = await res.json()
      setPlans(data)
    }
    setLoading(false)
  }

  const createPlan = async () => {
    const res = await fetch('/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '新しいプラン' }),
    })
    if (res.ok) {
      const plan = await res.json()
      router.push(`/plans/${plan.id}`)
    }
  }

  const deletePlan = async (id: string) => {
    if (!confirm('このプランを削除しますか？')) return
    const res = await fetch(`/api/plans/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPlans(plans.filter((p) => p.id !== id))
    }
  }

  const duplicatePlan = async (id: string) => {
    const res = await fetch(`/api/plans/${id}/duplicate`, { method: 'POST' })
    if (res.ok) {
      fetchPlans()
    }
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">育成プラン</h2>
          <button
            onClick={createPlan}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition"
          >
            + 新規プラン作成
          </button>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground mb-4">
              まだプランがありません
            </p>
            <button
              onClick={createPlan}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition"
            >
              最初のプランを作成する
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onDelete={deletePlan}
                onDuplicate={duplicatePlan}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
