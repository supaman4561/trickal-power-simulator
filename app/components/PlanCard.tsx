'use client'

import Link from 'next/link'

interface PlanCardProps {
  plan: {
    id: string
    name: string
    description: string | null
    updatedAt: string
    _count: { characters: number }
  }
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}

export default function PlanCard({ plan, onDelete, onDuplicate }: PlanCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition">
      <div className="flex justify-between items-start mb-3">
        <Link href={`/plans/${plan.id}`} className="text-lg font-semibold text-foreground hover:text-primary transition">
          {plan.name}
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => onDuplicate(plan.id)}
            className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition"
          >
            複製
          </button>
          <button
            onClick={() => onDelete(plan.id)}
            className="px-3 py-1 text-xs bg-destructive/20 text-destructive rounded hover:bg-destructive/30 transition"
          >
            削除
          </button>
        </div>
      </div>
      {plan.description && (
        <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
      )}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{plan._count.characters}体のキャラクター</span>
        <span>更新: {new Date(plan.updatedAt).toLocaleDateString('ja-JP')}</span>
      </div>
    </div>
  )
}
