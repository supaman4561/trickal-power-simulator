import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const resources = await prisma.userResource.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!resources) {
      return NextResponse.json(
        { error: 'Resources not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(resources)
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const resources = await prisma.userResource.update({
      where: {
        userId: session.user.id,
      },
      data: body,
    })

    return NextResponse.json(resources)
  } catch (error) {
    console.error('Error updating resources:', error)
    return NextResponse.json(
      { error: 'Failed to update resources' },
      { status: 500 }
    )
  }
}
