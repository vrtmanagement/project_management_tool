import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Workspace from '@/models/Workspace';
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

// GET workspace members for a project
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    const userId = getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get project to find workspace
    const project = await Project.findById(id).select('workspace');
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get workspace with populated members
    const workspace = await Workspace.findById(project.workspace)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Build members list (owner + members)
    const members = [];

    // Add owner
    if (workspace.owner) {
      members.push({
        id: workspace.owner._id.toString(),
        name: workspace.owner.name,
        email: workspace.owner.email,
        avatar: workspace.owner.avatar,
        role: 'owner',
      });
    }

    // Add workspace members
    if (workspace.members && Array.isArray(workspace.members)) {
      workspace.members.forEach(member => {
        if (member.user) {
          const user = member.user;
          const isPopulated = typeof user === 'object' && user !== null && '_id' in user;
          const userId = isPopulated ? user._id.toString() : user.toString();

          // Skip if already added as owner
          if (workspace.owner) {
            const ownerId = typeof workspace.owner === 'object' && '_id' in workspace.owner
              ? workspace.owner._id.toString()
              : workspace.owner.toString();
            if (ownerId === userId) {
              return;
            }
          }

          members.push({
            id: userId,
            name: isPopulated ? (user.name || '') : '',
            email: isPopulated ? (user.email || '') : '',
            avatar: isPopulated ? (user.avatar || null) : null,
            role: member.role || 'member',
          });
        }
      });
    }

    return NextResponse.json({ success: true, members }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

