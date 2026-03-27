import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';

// GET all schedules (public)
export async function GET() {
  try {
    const db = await getDb();
    const schedules = await db
      .collection('schedules')
      .find()
      .sort({ releaseDate: 1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      schedules: schedules.map((s) => ({
        id: s._id.toString(),
        movieName: s.movieName,
        movieSlug: s.movieSlug,
        episodeName: s.episodeName,
        releaseDate: s.releaseDate,
        note: s.note || '',
        createdAt: s.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

// POST new schedule (admin only)
export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
  }

  try {
    const { movieName, movieSlug, episodeName, releaseDate, note } = await request.json();

    if (!movieName || !episodeName || !releaseDate) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    const db = await getDb();
    const schedule = {
      movieName,
      movieSlug: movieSlug || '',
      episodeName,
      releaseDate: new Date(releaseDate),
      note: note || '',
      createdAt: new Date(),
    };

    const result = await db.collection('schedules').insertOne(schedule);

    return NextResponse.json({
      success: true,
      schedule: { id: result.insertedId.toString(), ...schedule },
    });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

// DELETE schedule (admin only)
export async function DELETE(request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    const { ObjectId } = await import('mongodb');
    const db = await getDb();
    await db.collection('schedules').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
