import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Workspace from '@/models/Workspace';
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

// GET all projects
export async function GET(request) {
  try {
    await dbConnect();
    const userId = getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace');

    // Convert userId to ObjectId for proper querying
    const mongoose = await import('mongoose');
    let userObjectId;
    try {
      if (mongoose.default.Types.ObjectId.isValid(userId)) {
        userObjectId = new mongoose.default.Types.ObjectId(userId);
      } else {
        // If userId is not a valid ObjectId string, return empty results
        return NextResponse.json({ success: true, projects: [] }, { status: 200 });
      }
    } catch (error) {
      console.error('Error converting userId to ObjectId:', error);
      return NextResponse.json({ success: true, projects: [] }, { status: 200 });
    }

    const accessibleWorkspaces = await Workspace.find({
      $or: [
        { owner: userObjectId },
        { 'members.user': userObjectId }
      ]
    }).select('_id');

    const accessibleWorkspaceIds = accessibleWorkspaces.map((ws) => ws._id.toString());

    if (workspaceId && !accessibleWorkspaceIds.includes(workspaceId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!workspaceId && accessibleWorkspaceIds.length === 0) {
      return NextResponse.json({ success: true, projects: [] }, { status: 200 });
    }

    const workspaceFilter = workspaceId || { $in: accessibleWorkspaceIds };

    const projects = await Project.find({ workspace: workspaceFilter })
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email avatar')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, projects }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// CREATE new project
export async function POST(request) {
  try {
    await dbConnect();
    const userId = getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create projects' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, workspaceId, status, priority, startDate, endDate, color } = body;

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    // Get or create default workspace
    let workspace;
    if (workspaceId) {
      workspace = await Workspace.findById(workspaceId);
    } else {
      // Create default workspace for user
      workspace = await Workspace.findOne({ owner: userId });
      if (!workspace) {
        workspace = await Workspace.create({
          name: 'My Workspace',
          description: 'Default workspace',
          owner: userId,
          members: [{ user: userId, role: 'admin' }]
        });
      }
    }

    const project = await Project.create({
      name,
      description,
      workspace: workspace._id,
      status: status || 'planning',
      priority: priority || 'medium',
      startDate,
      endDate,
      color: color || '#3b82f6',
      createdBy: userId,
      members: [{ user: userId, role: 'manager' }]
    });

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email avatar');

    return NextResponse.json({ success: true, project: populatedProject }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}