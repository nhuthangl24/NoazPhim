import { NextResponse } from 'next/server';

const PHIMAPI_V1_BASE = process.env.PHIMAPI_V1_BASE || 'https://phimapi.com/v1/api';

export async function GET(request, { params }) {
  const { type } = await params;
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const category = searchParams.get('category') || '';
  const country = searchParams.get('country') || '';
  const year = searchParams.get('year') || '';

  let url = `${PHIMAPI_V1_BASE}/danh-sach/${type}?page=${page}`;
  if (category) url += `&category=${category}`;
  if (country) url += `&country=${country}`;
  if (year) url += `&year=${year}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ status: false, msg: error.message }, { status: 500 });
  }
}
