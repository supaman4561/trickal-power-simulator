import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Header from './components/Header'
import Link from 'next/link'

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {session ? (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              ようこそ、{session.user?.name}さん
            </h2>
            <Link
              href="/plans"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition"
            >
              育成プランを管理する
            </Link>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              ログインして始めましょう
            </h2>
            <p className="text-muted-foreground">
              Discordアカウントでログインして、育成プランを作成できます。
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
