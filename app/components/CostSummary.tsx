'use client'

import { ResourceCost } from '@/lib/calculations'

interface Props {
  cost: ResourceCost
  owned: ResourceCost | null
}

const labels: Record<keyof ResourceCost, string> = {
  coin: 'コイン',
  marshmallowGuardLow: 'マシュマロ(守備・下)',
  marshmallowGuardMid: 'マシュマロ(守備・中)',
  marshmallowGuardHigh: 'マシュマロ(守備・上)',
  marshmallowAttackLow: 'マシュマロ(攻撃・下)',
  marshmallowAttackMid: 'マシュマロ(攻撃・中)',
  marshmallowAttackHigh: 'マシュマロ(攻撃・上)',
  marshmallowSupportLow: 'マシュマロ(支援・下)',
  marshmallowSupportMid: 'マシュマロ(支援・中)',
  marshmallowSupportHigh: 'マシュマロ(支援・上)',
  purpleCrayon: '上級くれよん',
  goldCrayon: '特級くれよん',
}

export default function CostSummary({ cost, owned }: Props) {
  const entries = (Object.keys(labels) as (keyof ResourceCost)[]).filter(
    (key) => cost[key] > 0
  )

  if (entries.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">必要リソース</h3>
        <p className="text-sm text-muted-foreground">育成計画を設定するとリソース消費が表示されます</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">必要リソース</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {entries.map((key) => {
          const needed = cost[key]
          const have = owned?.[key] ?? 0
          const deficit = needed - have
          const isDeficit = deficit > 0

          return (
            <div key={key} className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{labels[key]}</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-sm font-medium ${isDeficit ? 'text-destructive' : 'text-success'}`}>
                  {needed.toLocaleString()}
                </span>
                {owned && (
                  <span className="text-xs text-muted-foreground">
                    / {have.toLocaleString()}
                    {isDeficit && (
                      <span className="text-destructive ml-1">(-{deficit.toLocaleString()})</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
