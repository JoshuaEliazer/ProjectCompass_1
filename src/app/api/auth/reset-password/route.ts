import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/db/client";
import { hashPassword } from "@/infrastructure/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token, password, confirmPassword } = body;

        if (!token || !password || !confirmPassword) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
        }

        // Find user by valid pending reset token
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpires: {
                    gt: new Date() // Must be greater than current time
                }
            }
        });

        if (!user) {
            return NextResponse.json({
                error: "Invalid password reset token or it has expired"
            }, { status: 400 });
        }

        // Hash new password
        const passwordHash = hashPassword(password);

        // Update password and clear reset token details
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetToken: null,
                resetTokenExpires: null
            }
        });

        return NextResponse.json({
            success: true,
            message: "Password reset successfully. You can now login with your new credentials."
        });

    } catch (error: any) {
        console.error("Reset Password error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
