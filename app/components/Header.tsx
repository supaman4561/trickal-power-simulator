'use client'

import { signIn, signOut, useSession } from 'next-auth/react'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            トリッカル戦闘力シミュレータ
          </h1>
          <div>
            {session ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  {session.user?.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('discord')}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
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
