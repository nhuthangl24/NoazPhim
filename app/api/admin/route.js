import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';

// GET: search movies from PhimAPI by keyword
export async function GET(request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');

  if (!keyword) {
    return NextResponse.json({ results: [] });
  }

  try {
    const res = await fetch(
      `${process.env.PHIMAPI_BASE || 'https://phimapi.com'}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&limit=10`
    );
    const data = await res.json();
    const items = data?.data?.items || [];

    return NextResponse.json({
      results: items.map((m) => ({
        name: m.name,
        slug: m.slug,
        originName: m.origin_name,
        year: m.year,
        posterUrl: m.poster_url ? `https://phimimg.com/${m.poster_url}` : null,
        thumbUrl: m.thumb_url ? `https://phimimg.com/${m.thumb_url}` : null,
        type: m.type,
        episodeCurrent: m.episode_current,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Lỗi tìm kiếm' }, { status: 500 });
  }
}

// POST: update user role
export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
  }

  try {
    const { action, userId, role } = await request.json();

    if (action === 'changeRole') {
      if (!userId || !role) return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
      if (!['user', 'admin'].includes(role)) return NextResponse.json({ error: 'Role không hợp lệ' }, { status: 400 });

      const { ObjectId } = await import('mongodb');
      const db = await getDb();
      await db.collection('users').updateOne({ _id: new ObjectId(userId) }, { $set: { role } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Action không hợp lệ' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
