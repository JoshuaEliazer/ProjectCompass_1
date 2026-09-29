import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./db/client";

// Password Hashing
export function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
    const parts = combinedHash.split(":");
    if (parts.length !== 2) return false;
    const [salt, originalHash] = parts;
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return hash === originalHash;
}

// Session Management
export async function createSession(userId: string, userAgent = "Unknown Device", ipAddress = "127.0.0.1") {
    const session = await prisma.activeSession.create({
        data: {
            userId,
            device: userAgent || "Unknown Device",
            ipAddress: ipAddress || "127.0.0.1",
            location: "Local Session",
        }
    });

    const cookieStore = await cookies();
    cookieStore.set("session_token", session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    // Also record last login on user
    await prisma.user.update({
        where: { id: userId },
        data: { lastLogin: new Date() }
    });

    return session.id;
}

export async function getSessionUser() {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("session_token")?.value;
        if (!sessionToken) return null;

        const session = await prisma.activeSession.findUnique({
            where: { id: sessionToken },
            include: { user: true }
        });

        if (!session) return null;

        // Update last active timestamp
        await prisma.activeSession.update({
            where: { id: sessionToken },
            data: { lastActive: new Date() }
        });

        return session.user;
    } catch (e) {
        console.error("Error retrieving session user:", e);
        return null;
    }
}

export async function destroySession() {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("session_token")?.value;
        if (sessionToken) {
            await prisma.activeSession.delete({
                where: { id: sessionToken }
            }).catch(() => { });
        }
        cookieStore.delete("session_token");
    } catch (e) {
        console.error("Error destroying session:", e);
    }
}
