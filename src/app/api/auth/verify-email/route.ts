import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/db/client";
import { getSessionUser } from "@/infrastructure/auth";

// GET: Processes email verification token
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ error: "Missing verification token" }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: { verificationToken: token }
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid verification token" }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null // Clear token
            }
        });

        // Redirect to login or home with a verification status
        return NextResponse.redirect(new URL("/login?verified=true", request.url));

    } catch (error: any) {
        console.error("Email verification GET error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}

// POST: Resends email verification token
export async function POST(request: Request) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
        }

        if (user.emailVerified) {
            return NextResponse.json({ success: true, message: "Email is already verified" });
        }

        // Generate a new verification token if missing
        let token = user.verificationToken;
        if (!token) {
            token = Math.random().toString(36).substring(2, 15);
            await prisma.user.update({
                where: { id: user.id },
                data: { verificationToken: token }
            });
        }

        // Mock mail dispatch
        console.log(`[EMAIL COMPASS SERVICE]: Dispatching Verification Link: http://localhost:3000/api/auth/verify-email?token=${token} to ${user.email}`);

        return NextResponse.json({
            success: true,
            message: "Verification email sent. Please check your inbox."
        });

    } catch (error: any) {
        console.error("Resend verification error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
