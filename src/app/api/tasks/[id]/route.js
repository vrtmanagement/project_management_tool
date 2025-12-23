import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
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

// GET single task
export async function GET(request, { params }) {
  try {
    // Unwrap params Promise
    const { id } = await params;
    await dbConnect();
    const userId = getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await Task.findById(id)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'name color')
      .populate('comments.user', 'name email avatar');

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// UPDATE task
export async function PUT(request, { params }) {
  try {
    // Unwrap params Promise
    const { id } = await params;
    await dbConnect();
    const userId = getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const task = await Task.findByIdAndUpdate(
      id,
      { ...body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'name color');

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE task
export async function DELETE(request, { params }) {
  try {
    // Unwrap params Promise
    const { id } = await params;
    await dbConnect();
    const userId = getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Task deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}