import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/db/client";
import { getSessionUser } from "@/infrastructure/auth";

// PUT /api/bookmarks/[id] - Update title/description of existing bookmark owned by user
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, description } = body;

        let user = await getSessionUser();
        if (!user) {
            user = await prisma.user.findFirst({
                where: { email: "student@projectcompass.io" },
            });
        }

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const existingBookmark = await prisma.projectBookmark.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!existingBookmark) {
            return NextResponse.json({ error: "Bookmark not found or unauthorized" }, { status: 404 });
        }

        const updatedBookmark = await prisma.projectBookmark.update({
            where: { id },
            data: {
                title: title !== undefined ? title.trim() : existingBookmark.title,
                description: description !== undefined ? description.trim() : existingBookmark.description,
            },
        });

        return NextResponse.json({ bookmark: updatedBookmark });
    } catch (error: any) {
        console.error("PUT /api/bookmarks/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to update bookmark", details: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/bookmarks/[id] - Delete bookmark owned by user
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        let user = await getSessionUser();
        if (!user) {
            user = await prisma.user.findFirst({
                where: { email: "student@projectcompass.io" },
            });
        }

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const existingBookmark = await prisma.projectBookmark.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!existingBookmark) {
            return NextResponse.json({ error: "Bookmark not found or unauthorized" }, { status: 404 });
        }

        await prisma.projectBookmark.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, id });
    } catch (error: any) {
        console.error("DELETE /api/bookmarks/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to delete bookmark", details: error.message },
            { status: 500 }
        );
    }
}
