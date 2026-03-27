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
    const [userCount, commentCount, scheduleCount] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('comments').countDocuments(),
      db.collection('schedules').countDocuments(),
    ]);

    return NextResponse.json({
      stats: { userCount, commentCount, scheduleCount },
    });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
