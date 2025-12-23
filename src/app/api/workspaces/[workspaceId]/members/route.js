import dbConnect from '@/lib/mongodb';
import Workspace from '@/models/Workspace';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

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

export async function POST(request, context) {
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
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    const { targetUserId, role } = await request.json();
    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const memberUser = await User.findById(targetUserId);
    if (!memberUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (workspace.owner.toString() === targetUserId) {
      return NextResponse.json({ error: 'User is already the owner of this workspace' }, { status: 400 });
    }

    // Check if user is already a member - handle both ObjectId and string formats
    let targetUserObjectIdForCheck;
    try {
      if (mongoose.Types.ObjectId.isValid(targetUserId)) {
        targetUserObjectIdForCheck = new mongoose.Types.ObjectId(targetUserId);
      } else {
        targetUserObjectIdForCheck = targetUserId;
      }
    } catch (error) {
      targetUserObjectIdForCheck = targetUserId;
    }

    const alreadyMember = workspace.members.some((member) => {
      if (!member.user) return false;
      
      // Handle populated member (object with _id)
      if (typeof member.user === 'object' && member.user !== null && '_id' in member.user) {
        const memberId = member.user._id.toString();
        return memberId === targetUserId || 
               member.user._id.equals(targetUserObjectIdForCheck) ||
               memberId === targetUserObjectIdForCheck?.toString();
      }
      
      // Handle unpopulated member (ObjectId or string)
      const memberId = member.user?.toString();
      return memberId === targetUserId || 
             memberId === targetUserObjectIdForCheck?.toString() ||
             (member.user.equals && member.user.equals(targetUserObjectIdForCheck));
    });

    if (alreadyMember) {
      return NextResponse.json({ error: 'User is already a member of this workspace' }, { status: 400 });
    }

    // Ensure targetUserId is converted to ObjectId for proper storage
    let targetUserObjectId;
    try {
      targetUserObjectId = mongoose.Types.ObjectId.isValid(targetUserId)
        ? new mongoose.Types.ObjectId(targetUserId)
        : targetUserId;
    } catch (error) {
      targetUserObjectId = targetUserId;
    }

    // Add member to workspace
    workspace.members.push({
      user: targetUserObjectId,
      role: role || 'member',
      joinedAt: new Date(),
    });

    // Mark the members array as modified to ensure Mongoose saves it
    workspace.markModified('members');
    
    // Save and ensure the operation completes
    const savedWorkspace = await workspace.save();
    
    if (!savedWorkspace) {
      return NextResponse.json({ error: 'Failed to save workspace' }, { status: 500 });
    }
    
    // Verify the save by querying the database directly
    // This ensures the data is actually persisted and can be queried by other sessions
    const verifyWorkspace = await Workspace.findById(workspaceId);
    if (!verifyWorkspace) {
      return NextResponse.json({ error: 'Failed to verify workspace save' }, { status: 500 });
    }
    
    // Check if the member is actually in the database
    const memberInDb = verifyWorkspace.members.some((member) => {
      const memberId = member.user?.toString();
      return memberId === targetUserId || 
             memberId === targetUserObjectId.toString() ||
             (member.user && member.user.equals && member.user.equals(targetUserObjectId));
    });
    
    if (!memberInDb) {
      console.error('Member not found in database after save:', {
        workspaceId: workspaceId.toString(),
        targetUserId,
        targetUserObjectId: targetUserObjectId.toString(),
        membersInDb: verifyWorkspace.members.map(m => ({
          user: m.user?.toString(),
          role: m.role
        }))
      });
      return NextResponse.json({ 
        error: 'Member was not successfully saved to database',
        debug: {
          targetUserId,
          targetUserObjectId: targetUserObjectId.toString(),
          membersInDb: verifyWorkspace.members.map(m => ({
            user: m.user?.toString(),
            role: m.role
          }))
        }
      }, { status: 500 });
    }
    
    console.log('Member successfully added and verified in database:', {
      workspaceId: workspaceId.toString(),
      targetUserId,
      targetUserObjectId: targetUserObjectId.toString(),
      targetUserObjectIdType: typeof targetUserObjectId,
      membersCount: verifyWorkspace.members.length,
      allMembers: verifyWorkspace.members.map(m => ({
        user: m.user?.toString(),
        userType: typeof m.user,
        role: m.role
      }))
    });
    
    // Also verify the member can be found with a direct query
    const directQuery = await Workspace.findOne({
      _id: workspaceId,
      'members.user': targetUserObjectId
    });
    
    if (!directQuery) {
      console.error('WARNING: Member cannot be found with direct query!', {
        workspaceId: workspaceId.toString(),
        targetUserObjectId: targetUserObjectId.toString()
      });
    } else {
      console.log('Member verified with direct query - member is queryable');
    }

    // Verify the member was saved by checking the saved workspace
    const memberExistsInSaved = savedWorkspace.members.some((member) => {
      const memberId = member.user?.toString();
      return memberId === targetUserId || 
             memberId === targetUserObjectId.toString() ||
             (member.user && member.user.equals && member.user.equals(targetUserObjectId));
    });

    if (!memberExistsInSaved) {
      console.error('Member not found in saved workspace:', {
        targetUserId,
        targetUserObjectId: targetUserObjectId.toString(),
        membersCount: savedWorkspace.members.length,
        members: savedWorkspace.members.map(m => ({
          user: m.user?.toString(),
          role: m.role
        }))
      });
    }

    // Fetch the workspace again to ensure we have the latest data with populated members
    const updatedWorkspace = await Workspace.findById(workspaceId)
      .populate('owner', 'name email')
      .populate('members.user', 'name email role');

    if (!updatedWorkspace) {
      return NextResponse.json({ error: 'Failed to retrieve updated workspace' }, { status: 500 });
    }

    // Verify the member was actually added - check both saved and updated workspace
    const checkMemberExists = (members) => {
      return members.some((member) => {
        if (!member.user) return false;
        
        // Handle populated member
        if (typeof member.user === 'object' && member.user !== null && '_id' in member.user) {
          const memberId = member.user._id.toString();
          return memberId === targetUserId || 
                 member.user._id.equals(targetUserObjectId) ||
                 memberId === targetUserObjectId.toString();
        }
        
        // Handle unpopulated member
        const memberId = member.user?.toString();
        return memberId === targetUserId || 
               memberId === targetUserObjectId.toString() ||
               (member.user.equals && member.user.equals(targetUserObjectId));
      });
    };

    const memberAddedInSaved = checkMemberExists(savedWorkspace.members);
    const memberAddedInUpdated = checkMemberExists(updatedWorkspace.members);

    if (!memberAddedInSaved && !memberAddedInUpdated) {
      return NextResponse.json({ 
        success: false,
        error: 'Member was not successfully added to workspace',
        debug: {
          targetUserId,
          targetUserObjectId: targetUserObjectId.toString(),
          savedMembersCount: savedWorkspace.members.length,
          updatedMembersCount: updatedWorkspace.members.length,
          savedMembers: savedWorkspace.members.map(m => ({
            user: typeof m.user === 'object' && m.user?._id ? m.user._id.toString() : m.user?.toString(),
            role: m.role
          })),
          updatedMembers: updatedWorkspace.members.map(m => ({
            user: typeof m.user === 'object' && m.user?._id ? m.user._id.toString() : m.user?.toString(),
            role: m.role
          }))
        }
      }, { status: 500 });
    }

    // Add cache-control headers to prevent caching
    const response = NextResponse.json(
      {
        success: true,
        workspace: updatedWorkspace,
        member: {
          id: memberUser._id.toString(),
          name: memberUser.name,
          email: memberUser.email,
          role: role || 'member',
        },
      },
      { status: 200 }
    );
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add workspace member' },
      { status: 500 }
    );
  }
}


