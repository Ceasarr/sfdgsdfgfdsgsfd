import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, name } = body;

        console.log('=== Registration Test Start ===');
        console.log('Request data:', { email, name });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed successfully');

        // Create user
        console.log('About to create user with data:', {
            email,
            name: name || null,
            role: 'user',
        });

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || null,
                role: "user",
            },
        });

        console.log('User created successfully:', user);

        return NextResponse.json({ success: true, user }, { status: 201 });
    } catch (error: any) {
        console.error('=== Registration Error ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Full error:', error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
