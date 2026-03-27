import { NextResponse } from 'next/server';

const PHIMAPI_V1_BASE = process.env.PHIMAPI_V1_BASE || 'https://phimapi.com/v1/api';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword') || '';
  const page = searchParams.get('page') || '1';

  if (!keyword) {
    return NextResponse.json({ status: false, msg: 'Keyword is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`${PHIMAPI_V1_BASE}/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ status: false, msg: error.message }, { status: 500 });
  }
}
