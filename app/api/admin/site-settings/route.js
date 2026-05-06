import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSiteSettings, updateSiteSettings } from '@/lib/site-settings';

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Khong co quyen' }, { status: 403 });
  }

  return null;
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const settings = await getSiteSettings();
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: 'Loi server' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const settings = await updateSiteSettings({
      siteLocked: Boolean(body.siteLocked),
    });

    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: 'Loi server' }, { status: 500 });
  }
}
