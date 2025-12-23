import dbConnect from '@/lib/mongodb';
import Workspace from '@/models/Workspace';
import User from '@/models/User';
import Project from '@/models/Project';
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

// DELETE workspace (admin only)
export async function DELETE(request, context) {
  try {
    await dbConnect();
    const userId = getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete workspaces' }, { status: 403 });
    }

    const params = context?.params ? await context.params : null;
    const workspaceId = params?.workspaceId;

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Delete all tasks in this workspace
    await Task.deleteMany({ workspace: workspaceId });

    // Delete all projects in this workspace
    await Project.deleteMany({ workspace: workspaceId });

    // Delete the workspace itself
    await Workspace.findByIdAndDelete(workspaceId);

    return NextResponse.json(
      { success: true, message: 'Workspace deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete workspace' },
      { status: 500 }
    );
  }
}

