import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request) {
    try {
        await dbConnect();
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Please provide all required fields' }, { status: 400 });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Compare password (plain text comparison since not hashing yet)
        if (user.password !== password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = jwt.sign({
            userId: user._id,
            email: user.email,
        }, process.env.JWT_SECRET, { expiresIn: '7d' });

        return NextResponse.json({
            success: true,
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}