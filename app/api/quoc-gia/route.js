import { NextResponse } from 'next/server';

const PHIMAPI_BASE = process.env.PHIMAPI_BASE || 'https://phimapi.com';

export async function GET() {
  try {
    const res = await fetch(`${PHIMAPI_BASE}/quoc-gia`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
