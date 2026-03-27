import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';

// GET all custom episodes for an admin to manage
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
  }

  try {
    const db = await getDb();
    const episodes = await db.collection('custom_episodes')
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      episodes: episodes.map((e) => ({
        id: e._id.toString(),
        movieSlug: e.movieSlug,
        movieName: e.movieName,
        episodeName: e.episodeName,
        episodeSlug: e.episodeSlug,
        linkEmbed: e.linkEmbed,
        linkM3u8: e.linkM3u8,
        createdAt: e.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

// POST a new custom episode
export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
  }

  try {
    const { movieSlug, movieName, episodeName, linkEmbed, linkM3u8 } = await request.json();

    if (!movieSlug || !episodeName || (!linkEmbed && !linkM3u8)) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    const db = await getDb();
    const episodeSlug = episodeName.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');

    const newEpisode = {
      movieSlug,
      movieName,
      episodeName,
      episodeSlug,
      linkEmbed: linkEmbed || '',
      linkM3u8: linkM3u8 || '',
      createdAt: new Date(),
    };

    const result = await db.collection('custom_episodes').insertOne(newEpisode);

    return NextResponse.json({
      success: true,
      episode: { id: result.insertedId.toString(), ...newEpisode },
    });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

// DELETE a custom episode
export async function DELETE(request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    const { ObjectId } = await import('mongodb');
    const db = await getDb();
    
    await db.collection('custom_episodes').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
