import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/db/client";
import { verifyPassword, createSession } from "@/infrastructure/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, rememberMe } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.passwordHash) {
            return NextResponse.json({ error: "Incorrect email address or password" }, { status: 400 });
        }

        // Verify password
        const isPasswordCorrect = verifyPassword(password, user.passwordHash);
        if (!isPasswordCorrect) {
            return NextResponse.json({ error: "Incorrect email address or password" }, { status: 400 });
        }

        // Get request details for session analytics
        const userAgent = request.headers.get("user-agent") || "Web Browser";
        const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

        // Create session
        await createSession(user.id, userAgent, ipAddress);

        // Omit password hash
        const { passwordHash: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            success: true,
            message: "Login successful",
            user: userWithoutPassword
        });

    } catch (error: any) {
        console.error("Login API error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
