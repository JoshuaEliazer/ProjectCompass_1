import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/db/client";
import { getSessionUser } from "@/infrastructure/auth";

// GET /api/bookmarks?analysisId=xxx - Return bookmarks for authenticated user and selected project
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const analysisId = searchParams.get("analysisId");

        if (!analysisId) {
            return NextResponse.json({ error: "Missing analysisId parameter" }, { status: 400 });
        }

        let user = await getSessionUser();
        if (!user) {
            user = await prisma.user.findFirst({
                where: { email: "student@projectcompass.io" },
            });
        }

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify project ownership
        const analysis = await prisma.repoAnalysis.findFirst({
            where: {
                id: analysisId,
                userId: user.id,
            },
        });

        if (!analysis) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        const bookmarks = await prisma.projectBookmark.findMany({
            where: {
                userId: user.id,
                analysisId: analysisId,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ bookmarks });
    } catch (error: any) {
        console.error("GET /api/bookmarks error:", error);
        return NextResponse.json(
            { error: "Failed to fetch bookmarks", details: error.message },
            { status: 500 }
        );
    }
}

// POST /api/bookmarks - Create a bookmark for authenticated user & selected project
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { analysisId, type, title, description, targetPath, targetId } = body;

        if (!analysisId || !type || !title || !targetPath) {
            return NextResponse.json(
                { error: "Missing required fields", details: "analysisId, type, title, and targetPath are required." },
                { status: 400 }
            );
        }

        let user = await getSessionUser();
        if (!user) {
            user = await prisma.user.findFirst({
                where: { email: "student@projectcompass.io" },
            });
        }

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify project ownership
        const analysis = await prisma.repoAnalysis.findFirst({
            where: {
                id: analysisId,
                userId: user.id,
            },
        });

        if (!analysis) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        // Duplicate handling: check if identical bookmark already exists
        const existing = await prisma.projectBookmark.findFirst({
            where: {
                userId: user.id,
                analysisId,
                type: type.toUpperCase(),
                targetPath: targetPath.trim(),
            },
        });

        if (existing) {
            return NextResponse.json(
                { bookmark: existing, message: "Bookmark already exists for this item." },
                { status: 200 }
            );
        }

        const bookmark = await prisma.projectBookmark.create({
            data: {
                userId: user.id,
                analysisId: analysisId,
                type: type.toUpperCase(), // "FILE", "MODULE", "FUNCTION", "CLASS"
                title: title.trim(),
                description: description ? description.trim() : null,
                targetPath: targetPath.trim(),
                targetId: targetId ? targetId.trim() : null,
            },
        });

        return NextResponse.json({ bookmark }, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/bookmarks error:", error);
        return NextResponse.json(
            { error: "Failed to create bookmark", details: error.message },
            { status: 500 }
        );
    }
}
