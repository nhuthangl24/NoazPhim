import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
  }

  try {
    const db = await getDb();
    const comments = await db.collection('comments')
      .find()
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      comments: comments.map((c) => ({
        id: c._id.toString(),
        slug: c.slug,
        userId: c.userId,
        userName: c.userName,
        content: c.content,
        createdAt: c.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
