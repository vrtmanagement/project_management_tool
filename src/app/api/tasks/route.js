import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
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

// GET all tasks
export async function GET(request) {
  try {
    await dbConnect();
    const userId = getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project');
    const status = searchParams.get('status');

    // Convert userId to ObjectId for proper querying
    const mongoose = await import('mongoose');
    let userObjectId;
    try {
      if (mongoose.default.Types.ObjectId.isValid(userId)) {
        userObjectId = new mongoose.default.Types.ObjectId(userId);
      } else {
        // If userId is not a valid ObjectId string, return empty results
        return NextResponse.json({ success: true, tasks: [] }, { status: 200 });
      }
    } catch (error) {
      console.error('Error converting userId to ObjectId:', error);
      return NextResponse.json({ success: true, tasks: [] }, { status: 200 });
    }

    const accessibleWorkspaces = await Workspace.find({
      $or: [
        { owner: userObjectId },
        { 'members.user': userObjectId }
      ]
    }).select('_id');

    const accessibleWorkspaceIds = accessibleWorkspaces.map((ws) => ws._id.toString());

    if (projectId) {
      const project = await Project.findById(projectId).select('workspace');
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      if (!accessibleWorkspaceIds.includes(project.workspace.toString())) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    if (!projectId && accessibleWorkspaceIds.length === 0) {
      return NextResponse.json({ success: true, tasks: [] }, { status: 200 });
    }

    const workspaceFilter = projectId
      ? undefined
      : { $in: accessibleWorkspaceIds };

    const query = {
      ...(projectId ? { project: projectId } : { workspace: workspaceFilter }),
    };

    if (status) {
      query.status = status;
    }

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'name color')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, tasks }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// CREATE new task
export async function POST(request) {
  try {
    await dbConnect();
    const userId = getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, projectId, status, priority, dueDate, assignedTo, assignedEmails, tags } = body;

    if (!title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Get project to get workspace ID
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get workspace ID (handle both populated and non-populated cases)
    const workspaceId = project.workspace._id || project.workspace;

    // Get workspace to validate members
    const workspace = await Workspace.findById(workspaceId)
      .populate('owner', 'email')
      .populate('members.user', 'email');
    
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Get workspace member IDs first (for validation)
    const workspaceMemberIds = new Set();
    if (workspace.owner) {
      const ownerId = typeof workspace.owner === 'object' && '_id' in workspace.owner
        ? workspace.owner._id.toString()
        : workspace.owner.toString();
      workspaceMemberIds.add(ownerId);
    }
    
    if (workspace.members && Array.isArray(workspace.members)) {
      workspace.members.forEach(member => {
        if (member.user) {
          const memberId = typeof member.user === 'object' && '_id' in member.user
            ? member.user._id.toString()
            : member.user.toString();
          workspaceMemberIds.add(memberId);
        }
      });
    }

    // Validate assignedTo array if provided directly
    let assignedUserIds = [];
    if (assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0) {
      const invalidUserIds = [];
      for (const userId of assignedTo) {
        const userIdStr = userId.toString();
        if (!workspaceMemberIds.has(userIdStr)) {
          invalidUserIds.push(userIdStr);
        } else {
          assignedUserIds.push(userId);
        }
      }
      
      if (invalidUserIds.length > 0) {
        return NextResponse.json(
          { 
            error: `The following user IDs are not members of this workspace: ${invalidUserIds.join(', ')}` 
          },
          { status: 400 }
        );
      }
    }
    
    if (assignedEmails && assignedEmails.trim()) {
      // Split emails by comma and trim whitespace
      const emailList = assignedEmails
        .split(',')
        .map(email => email.trim().toLowerCase())
        .filter(email => email.length > 0);

      if (emailList.length > 0) {
        // Find users by email
        const users = await User.find({ email: { $in: emailList } }).select('_id email');

        // Validate and collect user IDs
        const validUserIds = [];
        const invalidEmails = [];
        const notInWorkspaceEmails = [];

        for (const email of emailList) {
          const user = users.find(u => u.email.toLowerCase() === email);
          if (!user) {
            invalidEmails.push(email);
          } else {
            const userId = user._id.toString();
            if (!workspaceMemberIds.has(userId)) {
              notInWorkspaceEmails.push(email);
            } else {
              validUserIds.push(user._id);
            }
          }
        }

        // Report errors if any
        if (invalidEmails.length > 0) {
          return NextResponse.json(
            { 
              error: `The following email addresses were not found: ${invalidEmails.join(', ')}` 
            },
            { status: 400 }
          );
        }

        if (notInWorkspaceEmails.length > 0) {
          return NextResponse.json(
            { 
              error: `The following users are not members of this workspace: ${notInWorkspaceEmails.join(', ')}` 
            },
            { status: 400 }
          );
        }

        // Merge with existing assignedTo (if provided)
        assignedUserIds = [...new Set([...assignedUserIds, ...validUserIds])];
      }
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      workspace: workspaceId,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate,
      assignedTo: assignedUserIds,
      tags: tags || [],
      createdBy: userId
    });

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'name color');

    return NextResponse.json({ success: true, task: populatedTask }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}