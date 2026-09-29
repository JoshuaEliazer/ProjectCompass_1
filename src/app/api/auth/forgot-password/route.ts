import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/db/client";
import crypto from "crypto";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Even if user does not exist, return success to prevent user email enumeration attacks
        if (!user) {
            return NextResponse.json({
                success: true,
                message: "If credentials exist on this email, a reset link will be sent shortly."
            });
        }

        // Generate token and expiry (1 hour)
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpires
            }
        });

        // MOCK EMAIL SENDING
        console.log(`[EMAIL COMPASS SERVICE]: Sending custom Reset Link: http://localhost:3000/reset-password?token=${resetToken} to user ${email}`);

        return NextResponse.json({
            success: true,
            message: "If credentials exist on this email, a reset link will be sent shortly."
        });

    } catch (error: any) {
        console.error("Forgot Password error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
