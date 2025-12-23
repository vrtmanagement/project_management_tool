import dbConnect from '@/lib/mongodb';
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

export async function DELETE(request, context) {
  try {
    await dbConnect();
    const userId = getUserFromToken(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const actingUser = await User.findById(userId);
    if (!actingUser || actingUser.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can manage workspace members' }, { status: 403 });
    }

    const params = context?.params ? await context.params : null;
    const workspaceId = params?.workspaceId;
    const memberId = params?.memberId;

    if (!workspaceId || !memberId) {
      return NextResponse.json({ error: 'Workspace ID and member ID are required' }, { status: 400 });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    if (workspace.owner.toString() === memberId) {
      return NextResponse.json({ error: 'Cannot remove the workspace owner' }, { status: 400 });
    }

    const initialLength = workspace.members.length;
    workspace.members = workspace.members.filter((member) => {
      const memberUserId =
        typeof member.user === 'object' && member.user !== null && '_id' in member.user
          ? member.user._id.toString()
          : member.user?.toString();
      return memberUserId !== memberId;
    });

    if (workspace.members.length === initialLength) {
      return NextResponse.json({ error: 'Member not found in workspace' }, { status: 404 });
    }

    await workspace.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to remove workspace member' },
      { status: 500 }
    );
  }
}


