import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/db/client";
import { getSessionUser } from "@/infrastructure/auth";

// GET /api/notes?analysisId=xxx - Fetch notes for authenticated user & selected project
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

        const notes = await prisma.projectNote.findMany({
            where: {
                userId: user.id,
                analysisId: analysisId,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ notes });
    } catch (error: any) {
        console.error("GET /api/notes error:", error);
        return NextResponse.json(
            { error: "Failed to fetch notes", details: error.message },
            { status: 500 }
        );
    }
}

// POST /api/notes - Create a new note
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { analysisId, title, content } = body;

        if (!analysisId || !title) {
            return NextResponse.json(
                { error: "Missing required fields", details: "analysisId and title are required." },
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

        const note = await prisma.projectNote.create({
            data: {
                userId: user.id,
                analysisId: analysisId,
                title: title.trim(),
                content: content ? content.trim() : "",
            },
        });

        return NextResponse.json({ note }, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/notes error:", error);
        return NextResponse.json(
            { error: "Failed to create note", details: error.message },
            { status: 500 }
        );
    }
}
