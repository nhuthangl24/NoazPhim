import { NextResponse } from 'next/server';

const PHIMAPI_BASE = process.env.PHIMAPI_BASE || 'https://phimapi.com';

export async function GET(request, { params }) {
  const { slug } = await params;

  try {
    const res = await fetch(`${PHIMAPI_BASE}/phim/${slug}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ status: false, msg: error.message }, { status: 500 });
  }
}
