// import { NextResponse } from 'next/server';
// import dbConnect from '@/lib/mongodb';
// import Reflection from '@/models/Reflection';
// import jwt from 'jsonwebtoken';

// function getUserFromToken(request) {
//   const token = request.headers.get('authorization')?.split(' ')[1];
//   if (!token) return null;
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     return decoded.userId;
//   } catch (error) {
//     return null;
//   }
// }

// // GET - Fetch reflection for a specific date
// export async function GET(request) {
//   try {
//     await dbConnect();
    
//     const userId = getUserFromToken(request);
//     if (!userId) {
//       return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const date = searchParams.get('date');

//     if (!date) {
//       return NextResponse.json(
//         { success: false, error: 'Date is required' },
//         { status: 400 }
//       );
//     }

//     // Parse date and set to start of day for comparison
//     const dateObj = new Date(date);
//     dateObj.setHours(0, 0, 0, 0);
//     const endOfDay = new Date(dateObj.getTime() + 24 * 60 * 60 * 1000);

//     const reflection = await Reflection.findOne({
//       user: userId,
//       date: {
//         $gte: dateObj,
//         $lt: endOfDay,
//       },
//     }).populate('user', 'name email');

//     // Return empty data if not found (don't return 404, just return success with no reflection)
//     if (!reflection) {
//       return NextResponse.json({ success: true, reflection: null });
//     }

//     return NextResponse.json({ success: true, reflection });
//   } catch (error) {
//     console.error('Error fetching reflection:', error);
//     if (error.name === 'JsonWebTokenError') {
//       return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
//     }
//     if (error.name === 'JsonWebTokenError') {
//       return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
//     }
//     return NextResponse.json(
//       { success: false, error: error.message || 'Failed to fetch reflection' },
//       { status: 500 }
//     );
//   }
// }

// // POST - Create or update reflection
// export async function POST(request) {
//   try {
//     await dbConnect();
    
//     const userId = getUserFromToken(request);
//     if (!userId) {
//       return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
//     }

//     const body = await request.json();
//     const { date, topPriorities, goalsOfTheDay, schedule, reflection } = body;

//     if (!date) {
//       return NextResponse.json(
//         { success: false, error: 'Date is required' },
//         { status: 400 }
//       );
//     }

//     // Parse date and set to start of day
//     const dateObj = new Date(date);
//     dateObj.setHours(0, 0, 0, 0);
//     const endOfDay = new Date(dateObj.getTime() + 24 * 60 * 60 * 1000);

//     // Check if reflection already exists for this user and date
//     const existingReflection = await Reflection.findOne({
//       user: userId,
//       date: {
//         $gte: dateObj,
//         $lt: endOfDay,
//       },
//     });

//     const reflectionData = {
//       date: dateObj,
//       user: userId,
//       topPriorities: topPriorities || ['', '', ''],
//       goalsOfTheDay: goalsOfTheDay || Array(10).fill(''),
//       schedule: schedule || [],
//       reflection: reflection || Array(5).fill(''),
//     };

//     let savedReflection;
//     if (existingReflection) {
//       // Update existing reflection for this date
//       existingReflection.topPriorities = reflectionData.topPriorities;
//       existingReflection.goalsOfTheDay = reflectionData.goalsOfTheDay;
//       existingReflection.schedule = reflectionData.schedule;
//       existingReflection.reflection = reflectionData.reflection;
//       existingReflection.updatedAt = new Date();
//       savedReflection = await existingReflection.save();
//     } else {
//       // Create new reflection for this date
//       savedReflection = await Reflection.create(reflectionData);
//     }

//     return NextResponse.json({
//       success: true,
//       reflection: savedReflection,
//       message: existingReflection ? 'Reflection updated successfully' : 'Reflection created successfully',
//     });
//   } catch (error) {
//     console.error('Error saving reflection:', error);
//     if (error.name === 'JsonWebTokenError') {
//       return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
//     }
//     if (error.code === 11000) {
//       return NextResponse.json(
//         { success: false, error: 'Reflection already exists for this date' },
//         { status: 400 }
//       );
//     }
//     return NextResponse.json(
//       { success: false, error: error.message || 'Failed to save reflection' },
//       { status: 500 }
//     );
//   }
// }

