import dbConnect from '@/lib/mongodb';
import Workspace from '@/models/Workspace';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Helper to get user from token
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

// GET all workspaces for user
export async function GET(request) {
  try {
    await dbConnect();
    const userId = getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Convert userId to ObjectId for proper querying
    const mongoose = await import('mongoose');
    let userObjectId;
    try {
      if (mongoose.default.Types.ObjectId.isValid(userId)) {
        userObjectId = new mongoose.default.Types.ObjectId(userId);
      } else {
        // If userId is not a valid ObjectId string, we can't query properly
        console.error('Invalid userId format:', userId);
        return NextResponse.json({ success: true, workspaces: [] }, { status: 200 });
      }
    } catch (error) {
      console.error('Error converting userId to ObjectId:', error);
      return NextResponse.json({ success: true, workspaces: [] }, { status: 200 });
    }

    // Query for workspaces where user is owner OR member
    // Query with ObjectId only - MongoDB will match correctly
    // Debug logging to help diagnose issues
    console.log('Querying workspaces for user:', {
      userId,
      userObjectId: userObjectId.toString(),
      userObjectIdType: typeof userObjectId
    });
    
    // Try multiple query approaches to ensure we find all workspaces
    // First, try the standard query
    let workspaces = await Workspace.find({
      $or: [
        { owner: userObjectId },
        { 'members.user': userObjectId }
      ]
    })
      .populate({
        path: 'owner',
        select: 'name email'
      })
      .populate({
        path: 'members.user',
        select: 'name email role',
        model: 'User'
      })
      .sort({ createdAt: -1 });
    
    // If no workspaces found, try an alternative query using $elemMatch
    // This helps catch edge cases where the nested query might not work
    if (workspaces.length === 0) {
      console.log('No workspaces found with standard query, trying $elemMatch...');
      workspaces = await Workspace.find({
        $or: [
          { owner: userObjectId },
          { 
            members: { 
              $elemMatch: { 
                user: userObjectId 
              } 
            } 
          }
        ]
      })
        .populate({
          path: 'owner',
          select: 'name email'
        })
        .populate({
          path: 'members.user',
          select: 'name email role',
          model: 'User'
        })
        .sort({ createdAt: -1 });
    }

    console.log(`Found ${workspaces.length} workspaces for user ${userId}`);
    
    // If no workspaces found, try a direct database query to debug
    if (workspaces.length === 0) {
      console.log('No workspaces found. Running diagnostic queries...');
      console.log('Query parameters:', {
        userId,
        userIdType: typeof userId,
        userObjectId: userObjectId.toString(),
        userObjectIdType: typeof userObjectId,
        userObjectIdIsValid: userObjectId instanceof mongoose.default.Types.ObjectId
      });
      
      // Check if user exists
      const user = await User.findById(userId);
      console.log('User lookup:', {
        userId,
        userExists: !!user,
        userObjectId: userObjectId.toString(),
        user_id: user?._id?.toString()
      });
      
      // Try to find ALL workspaces and check members manually
      const allWorkspaces = await Workspace.find({})
        .populate('members.user', 'name email')
        .lean();
      
      console.log(`Total workspaces in database: ${allWorkspaces.length}`);
      
      // Check each workspace to see if this user is a member
      const matchingWorkspaces = [];
      for (const ws of allWorkspaces) {
        const ownerId = ws.owner?.toString();
        const isOwner = ownerId === userId || ownerId === userObjectId.toString();
        
        const isMember = ws.members?.some(m => {
          const memberUserId = typeof m.user === 'object' && m.user?._id 
            ? m.user._id.toString() 
            : m.user?.toString();
          const matches = memberUserId === userId || memberUserId === userObjectId.toString();
          if (matches) {
            console.log('Found matching member:', {
              workspaceId: ws._id.toString(),
              workspaceName: ws.name,
              memberUserId,
              userId,
              userObjectId: userObjectId.toString()
            });
          }
          return matches;
        });
        
        if (isOwner || isMember) {
          matchingWorkspaces.push({
            id: ws._id.toString(),
            name: ws.name,
            isOwner,
            isMember,
            ownerId,
            members: ws.members?.map(m => ({
              userId: typeof m.user === 'object' && m.user?._id 
                ? m.user._id.toString() 
                : m.user?.toString(),
              role: m.role
            })) || []
          });
        }
      }
      
      console.log('Workspaces where user should have access:', JSON.stringify(matchingWorkspaces, null, 2));
      
      // If we found workspaces manually, use them
      if (matchingWorkspaces.length > 0) {
        const workspaceIds = matchingWorkspaces.map(ws => new mongoose.default.Types.ObjectId(ws.id));
        
        workspaces = await Workspace.find({
          _id: { $in: workspaceIds }
        })
          .populate({
            path: 'owner',
            select: 'name email'
          })
          .populate({
            path: 'members.user',
            select: 'name email role',
            model: 'User'
          })
          .sort({ createdAt: -1 });
        
        console.log(`Found ${workspaces.length} workspaces using manual matching`);
      } else {
        console.log('No matching workspaces found even with manual check');
      }
    }
    
    // Log workspace details for debugging
    if (workspaces.length > 0) {
      // console.log('Workspaces found:', workspaces.map(ws => ({
      //   id: ws._id.toString(),
      //   name: ws.name,
      //   owner: ws.owner?._id?.toString() || ws.owner?.toString(),
      //   membersCount: ws.members?.length || 0,
      //   members: ws.members?.map(m => ({
      //     userId: typeof m.user === 'object' && m.user?._id ? m.user._id.toString() : m.user?.toString(),
      //     userName: typeof m.user === 'object' && m.user?.name ? m.user.name : 'N/A',
      //     userEmail: typeof m.user === 'object' && m.user?.email ? m.user.email : 'N/A',
      //     role: m.role
      //   })) || []
      // })));
      
      // Check if the current user is actually in any of these workspaces
      const userInWorkspaces = workspaces.filter(ws => {
        const isOwner = (ws.owner?._id?.toString() || ws.owner?.toString()) === userId || 
                       (ws.owner?._id?.toString() || ws.owner?.toString()) === userObjectId.toString();
        const isMember = ws.members?.some(m => {
          const memberId = typeof m.user === 'object' && m.user?._id 
            ? m.user._id.toString() 
            : m.user?.toString();
          return memberId === userId || memberId === userObjectId.toString();
        });
        return isOwner || isMember;
      });
      
      console.log(`User ${userId} is ${userInWorkspaces.length > 0 ? 'FOUND' : 'NOT FOUND'} in ${userInWorkspaces.length} workspace(s)`);
    }

    // Format workspaces and ensure all members are included and populated
    const formattedWorkspaces = await Promise.all(workspaces.map(async (ws) => {
      // Convert to plain object
      const wsObj = ws.toObject ? ws.toObject() : ws;
      
      // Format members - ensure ALL members are included and populated
      const formattedMembers = await Promise.all((wsObj.members || []).map(async (member) => {
        const memberObj = member.toObject ? member.toObject() : member;
        
        // Handle populated member.user (object with _id, name, email, role)
        if (memberObj.user && typeof memberObj.user === 'object' && memberObj.user._id) {
          return {
            user: {
              _id: memberObj.user._id.toString(),
              name: memberObj.user.name || '',
              email: memberObj.user.email || '',
              role: memberObj.user.role || 'member'
            },
            role: memberObj.role || 'member',
            joinedAt: memberObj.joinedAt
          };
        }
        
        // Handle unpopulated member.user - fetch the user
        if (memberObj.user) {
          try {
            const userId = memberObj.user.toString ? memberObj.user.toString() : memberObj.user;
            const user = await User.findById(userId).select('name email role');
            if (user) {
              return {
                user: {
                  _id: user._id.toString(),
                  name: user.name || '',
                  email: user.email || '',
                  role: user.role || 'member'
                },
                role: memberObj.role || 'member',
                joinedAt: memberObj.joinedAt
              };
            }
          } catch (error) {
            console.error('Error populating member user:', error);
          }
        }
        
        // If we can't populate, return with minimal info
        return {
          user: memberObj.user ? (memberObj.user.toString ? memberObj.user.toString() : memberObj.user) : null,
          role: memberObj.role || 'member',
          joinedAt: memberObj.joinedAt
        };
      }));

      return {
        _id: wsObj._id?.toString() || wsObj._id,
        name: wsObj.name,
        description: wsObj.description,
        owner: wsObj.owner,
        members: formattedMembers.filter(m => m.user), // Filter out members without valid user
        createdAt: wsObj.createdAt,
        updatedAt: wsObj.updatedAt
      };
    }));

    // Log the final response being sent
    console.log(`Sending ${formattedWorkspaces.length} workspaces to client. Formatted workspaces:`, 
      formattedWorkspaces.map(ws => ({
        id: ws._id,
        name: ws.name,
        membersCount: ws.members?.length || 0,
        members: ws.members?.map(m => ({
          userId: m.user?._id || m.user,
          userName: m.user?.name,
          userEmail: m.user?.email
        })) || []
      }))
    );
    
    // Add cache-control headers to prevent caching
    const response = NextResponse.json({ success: true, workspaces: formattedWorkspaces }, { status: 200 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// CREATE new workspace
export async function POST(request) {
  try {
    await dbConnect();
    const userId = getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create workspaces' }, { status: 403 });
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
    }

    const workspace = await Workspace.create({
      name,
      description,
      owner: userId,
      members: [{ user: userId, role: 'admin' }]
    });

    // Populate owner data
    await workspace.populate('owner', 'name email');

    return NextResponse.json({ success: true, workspace }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}