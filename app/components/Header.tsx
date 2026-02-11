'use client'

import { signIn, signOut, useSession } from 'next-auth/react'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">
            トリッカル戦闘力シミュレータ
          </h1>
          <div>
            {session ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {session.user?.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/80 transition"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('discord')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition"
              >
                Discordでログイン
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
