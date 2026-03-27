import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';

// GET comments for a movie
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const comments = await db
      .collection('comments')
      .find({ slug })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    const sanitized = comments.map((c) => ({
      id: c._id.toString(),
      slug: c.slug,
      userId: c.userId,
      userName: c.userName,
      userRole: c.userRole || 'user',
      content: c.content,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt || null,
    }));

    return NextResponse.json({ comments: sanitized });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

// POST a new comment
export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Vui lòng đăng nhập để bình luận' }, { status: 401 });
  }

  try {
    const { slug, content } = await request.json();

    if (!slug || !content?.trim()) {
      return NextResponse.json({ error: 'Nội dung bình luận không được để trống' }, { status: 400 });
    }

    if (content.length > 500) {
      return NextResponse.json({ error: 'Bình luận tối đa 500 ký tự' }, { status: 400 });
    }

    const db = await getDb();
    const comment = {
      slug,
      userId: session.id,
      userName: session.name || session.email,
      userRole: session.role || 'user',
      content: content.trim(),
      createdAt: new Date(),
    };

    const result = await db.collection('comments').insertOne(comment);

    return NextResponse.json({
      success: true,
      comment: {
        id: result.insertedId.toString(),
        slug: comment.slug,
        userId: comment.userId,
        userName: comment.userName,
        userRole: comment.userRole,
        content: comment.content,
        createdAt: comment.createdAt,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

// PUT - edit own comment
export async function PUT(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const { id, content } = await request.json();
    if (!id || !content?.trim()) {
      return NextResponse.json({ error: 'Nội dung không được để trống' }, { status: 400 });
    }

    const { ObjectId } = await import('mongodb');
    const db = await getDb();
    const comment = await db.collection('comments').findOne({ _id: new ObjectId(id) });

    if (!comment) {
      return NextResponse.json({ error: 'Bình luận không tồn tại' }, { status: 404 });
    }

    // Only owner or admin can edit
    if (comment.userId !== session.id && session.role !== 'admin') {
      return NextResponse.json({ error: 'Không có quyền sửa bình luận này' }, { status: 403 });
    }

    await db.collection('comments').updateOne(
      { _id: new ObjectId(id) },
      { $set: { content: content.trim(), updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

// DELETE a comment (owner or admin)
export async function DELETE(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    const { ObjectId } = await import('mongodb');
    const db = await getDb();
    const comment = await db.collection('comments').findOne({ _id: new ObjectId(id) });

    if (!comment) {
      return NextResponse.json({ error: 'Bình luận không tồn tại' }, { status: 404 });
    }

    // Only owner or admin can delete
    if (comment.userId !== session.id && session.role !== 'admin') {
      return NextResponse.json({ error: 'Không có quyền xóa bình luận này' }, { status: 403 });
    }

    await db.collection('comments').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
