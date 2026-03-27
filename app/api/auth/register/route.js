import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { hash } from 'bcryptjs';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email và mật khẩu là bắt buộc' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' }, { status: 400 });
    }

    const db = await getDb();
    const existing = await db.collection('users').findOne({ email: email.toLowerCase() });

    if (existing) {
      return NextResponse.json({ error: 'Email đã được sử dụng' }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);
    const user = {
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
      favorites: [],
      history: [],
      createdAt: new Date(),
    };

    await db.collection('users').insertOne(user);

    return NextResponse.json({ success: true, message: 'Đăng ký thành công' });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
