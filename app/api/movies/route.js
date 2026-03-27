import { NextResponse } from 'next/server';

const PHIMAPI_BASE = process.env.PHIMAPI_BASE || 'https://phimapi.com';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';

  try {
    const res = await fetch(`${PHIMAPI_BASE}/danh-sach/phim-moi-cap-nhat?page=${page}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ status: false, msg: error.message }, { status: 500 });
  }
}
