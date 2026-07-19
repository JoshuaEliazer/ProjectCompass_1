import { NextResponse } from "next/server";
import { getSessionUser } from "@/infrastructure/auth";

export async function GET() {
    try {
        const user = await getSessionUser();
        if (!user) {
            return NextResponse.json({ authenticated: false, user: null });
        }

        // Omit password hash in response
        const { passwordHash: _, ...userWithoutPassword } = user;

        return NextResponse.json({ authenticated: true, user: userWithoutPassword });
    } catch (error: any) {
        console.error("Session check API error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
