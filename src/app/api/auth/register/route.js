import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';
export async function POST(request) {

    try {
        await dbConnect();
        const { name, email, password } = await request.json();
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Please provide all required fields' },
                { status: 400 }
            );
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        const user = await User.create({
            name, email, password
        });
        return NextResponse.json({
            success: true,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            }
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message });
    }

}