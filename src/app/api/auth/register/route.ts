import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/db/client";
import { hashPassword } from "@/infrastructure/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, confirmPassword, name, username, acceptTerms } = body;

        // Basic Validations
        if (!email || !password || !confirmPassword || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
        }

        if (!acceptTerms) {
            return NextResponse.json({ error: "You must accept the terms and conditions" }, { status: 400 });
        }

        // Email regex validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Invalid email address style or format" }, { status: 400 });
        }

        // Check if user already exists
        const existingUserByEmail = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUserByEmail) {
            return NextResponse.json({ error: "A user with this email address already exists" }, { status: 400 });
        }

        if (username) {
            const existingUserByUsername = await prisma.user.findUnique({
                where: { username },
            });
            if (existingUserByUsername) {
                return NextResponse.json({ error: "This username is already taken" }, { status: 400 });
            }
        }

        // Hash password
        const passwordHash = hashPassword(password);

        // Mock sending verification token
        const verificationToken = Math.random().toString(36).substring(2, 15);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                username: username || null,
                passwordHash,
                verificationToken,
                emailVerified: false,
                role: "USER" // Default role
            },
        });

        // Omit password hash in response
        const { passwordHash: _, ...userWithoutPassword } = newUser;

        return NextResponse.json({
            success: true,
            message: "User registered successfully",
            user: userWithoutPassword
        });

    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
