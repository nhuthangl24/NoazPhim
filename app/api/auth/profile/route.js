import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession, createSessionCookie } from '@/lib/auth';
import { compare, hash } from 'bcryptjs';

// GET profile
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  const user = await db.collection('users').findOne(
    { _id: new ObjectId(session.id) },
    { projection: { password: 0 } }
  );

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || null,
      createdAt: user.createdAt,
    },
  });
}

// PUT update profile (name, avatar, password)
export async function PUT(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const { name, avatar, currentPassword, newPassword } = await request.json();
    const db = await getDb();
    const { ObjectId } = await import('mongodb');
    const user = await db.collection('users').findOne({ _id: new ObjectId(session.id) });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const updates = {};

    if (name && name.trim()) {
      updates.name = name.trim();
    }

    if (avatar !== undefined) {
      updates.avatar = avatar;
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Vui lòng nhập mật khẩu hiện tại' }, { status: 400 });
      }
      const isValid = await compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Mật khẩu hiện tại không đúng' }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' }, { status: 400 });
      }
      updates.password = await hash(newPassword, 12);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Không có gì để cập nhật' }, { status: 400 });
    }

    await db.collection('users').updateOne({ _id: new ObjectId(session.id) }, { $set: updates });

    // Return new session cookie if name changed
    const updatedUser = { ...user, ...updates };
    const cookie = createSessionCookie(updatedUser);
    const response = NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar || null,
      },
    });
    response.cookies.set(cookie);
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
