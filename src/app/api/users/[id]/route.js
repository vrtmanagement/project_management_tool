import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Workspace from '@/models/Workspace';
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

// DELETE user (admin only)
export async function DELETE(request, context) {
  try {
    await dbConnect();
    const userId = getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const actingUser = await User.findById(userId);
    if (!actingUser || actingUser.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete users' }, { status: 403 });
    }

    const params = context?.params ? await context.params : null;
    const targetUserId = params?.id;

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (userId === targetUserId) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting other admins (optional - you can remove this if you want admins to delete other admins)
    if (targetUser.role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete another admin user' }, { status: 400 });
    }

    // Remove user from all workspaces
    await Workspace.updateMany(
      { 'members.user': targetUserId },
      { $pull: { members: { user: targetUserId } } }
    );

    // Remove user as owner from workspaces (transfer ownership or delete workspace)
    const ownedWorkspaces = await Workspace.find({ owner: targetUserId });
    for (const workspace of ownedWorkspaces) {
      // Delete all tasks in this workspace
      await Task.deleteMany({ workspace: workspace._id });
      // Delete all projects in this workspace
      await Project.deleteMany({ workspace: workspace._id });
      // Delete the workspace
      await Workspace.findByIdAndDelete(workspace._id);
    }

    // Remove user from all projects
    await Project.updateMany(
      { 'members.user': targetUserId },
      { $pull: { members: { user: targetUserId } } }
    );

    // Remove projects created by this user (or transfer ownership)
    await Project.deleteMany({ createdBy: targetUserId });

    // Remove tasks assigned to this user
    await Task.updateMany(
      { assignedTo: targetUserId },
      { $unset: { assignedTo: '' } }
    );

    // Delete the user
    await User.findByIdAndDelete(targetUserId);

    return NextResponse.json(
      { success: true, message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}

