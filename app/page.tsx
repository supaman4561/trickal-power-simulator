import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Header from './components/Header'

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {session ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              ようこそ、{session.user?.name}さん
            </h2>
            <p className="text-gray-600">
              育成プラン機能は次のフェーズで実装します。
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">
              ログインして始めましょう
            </h2>
            <p className="text-gray-600">
              Discordアカウントでログインして、育成プランを作成できます。
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
