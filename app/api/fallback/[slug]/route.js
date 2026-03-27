import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request, { params }) {
  const { slug } = await params;
  try {
    const db = await getDb();
    const movie = await db.collection('movies').findOne({ slug });
    if (movie && movie.m3u8) {
      return NextResponse.json({ status: true, m3u8: movie.m3u8, subtitles: movie.subtitles || null });
    }
    return NextResponse.json({ status: false, msg: 'No fallback found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ status: false, msg: error.message }, { status: 500 });
  }
}
