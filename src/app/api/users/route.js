import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

function getUserFromToken(request) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function GET(request) {
  try {
    await dbConnect();

    const userId = getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await User.find({}, 'name email role createdAt').sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        users: users.map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}


