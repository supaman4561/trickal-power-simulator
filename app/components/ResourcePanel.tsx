'use client'

import { useState, useEffect } from 'react'

interface Resources {
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

const defaultResources: Resources = {
  coin: 0,
  marshmallowGuardLow: 0, marshmallowGuardMid: 0, marshmallowGuardHigh: 0,
  marshmallowAttackLow: 0, marshmallowAttackMid: 0, marshmallowAttackHigh: 0,
  marshmallowSupportLow: 0, marshmallowSupportMid: 0, marshmallowSupportHigh: 0,
  purpleCrayon: 0, goldCrayon: 0,
}

const resourceLabels: Record<keyof Resources, string> = {
  coin: 'コイン',
  marshmallowGuardLow: 'マシュマロ(守備・下級)',
  marshmallowGuardMid: 'マシュマロ(守備・中級)',
  marshmallowGuardHigh: 'マシュマロ(守備・上級)',
  marshmallowAttackLow: 'マシュマロ(攻撃・下級)',
  marshmallowAttackMid: 'マシュマロ(攻撃・中級)',
  marshmallowAttackHigh: 'マシュマロ(攻撃・上級)',
  marshmallowSupportLow: 'マシュマロ(支援・下級)',
  marshmallowSupportMid: 'マシュマロ(支援・中級)',
  marshmallowSupportHigh: 'マシュマロ(支援・上級)',
  purpleCrayon: '上級くれよん',
  goldCrayon: '特級くれよん',
}

export default function ResourcePanel() {
  const [resources, setResources] = useState<Resources>(defaultResources)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/user/resources')
      .then((res) => res.ok ? res.json() : defaultResources)
      .then((data) => {
        const { id, userId, updatedAt, ...rest } = data
        setResources(rest)
      })
      .catch(() => {})
  }, [])

  const updateResource = async (key: keyof Resources, value: number) => {
    setResources((prev) => ({ ...prev, [key]: value }))
    setSaving(true)
    await fetch('/api/user/resources', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value }),
    })
    setSaving(false)
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-foreground">所持リソース</h3>
        {saving && <span className="text-xs text-muted-foreground">保存中...</span>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {(Object.keys(resourceLabels) as (keyof Resources)[]).map((key) => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">{resourceLabels[key]}</label>
            <input
              type="number"
              min={0}
              value={resources[key]}
              onChange={(e) => updateResource(key, parseInt(e.target.value) || 0)}
              className="px-2 py-1 bg-input border border-border rounded text-sm text-foreground w-full"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
