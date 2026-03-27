import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const episodes = await db.collection('custom_episodes')
      .find({ movieSlug: slug })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json({
      episodes: episodes.map((e) => ({
        name: e.episodeName,
        slug: e.episodeSlug,
        filename: e.episodeName,
        link_embed: e.linkEmbed,
        link_m3u8: e.linkM3u8,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
