import { NextResponse } from "next/server";
import { destroySession } from "@/infrastructure/auth";

export async function POST() {
    try {
        await destroySession();
        return NextResponse.json({ success: true, message: "Logged out successfully" });
    } catch (error: any) {
        console.error("Logout API error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
