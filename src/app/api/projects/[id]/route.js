import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
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

// GET single project
export async function GET(request, { params }) {
  try {
    // Unwrap params Promise
    const { id } = await params;
    await dbConnect();
    const userId = getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await Project.findById(id)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email avatar')
      .populate('workspace', 'name');

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, project }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// UPDATE project
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
    
    const project = await Project.findByIdAndUpdate(
      id,
      { ...body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email avatar');

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, project }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE project
export async function DELETE(request, { params }) {
  try {
    // Unwrap params Promise
    const { id } = await params;
    await dbConnect();
    const userId = getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Project deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}