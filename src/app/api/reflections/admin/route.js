import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reflection from '@/models/Reflection';
import User from '@/models/User';
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

// GET - Get all reflections for a specific user (admin only)
export async function GET(request) {
  try {
    await dbConnect();
    
    const adminUserId = getUserFromToken(request);
    if (!adminUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin
    const adminUser = await User.findById(adminUserId);
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get all reflections for the specified user
    const reflections = await Reflection.find({ user: userId })
      .populate('user', 'name email')
      .sort({ date: -1 }); // Sort by date, newest first

    return NextResponse.json({ success: true, reflections }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reflections:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reflections' },
      { status: 500 }
    );
  }
}

