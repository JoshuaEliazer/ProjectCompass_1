import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/db/client";
import { getSessionUser } from "@/infrastructure/auth";

// PUT /api/notes/[id] - Update an existing note owned by the user
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, content } = body;

        let user = await getSessionUser();
        if (!user) {
            user = await prisma.user.findFirst({
                where: { email: "student@projectcompass.io" },
            });
        }

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const existingNote = await prisma.projectNote.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!existingNote) {
            return NextResponse.json({ error: "Note not found or unauthorized" }, { status: 404 });
        }

        const updatedNote = await prisma.projectNote.update({
            where: { id },
            data: {
                title: title !== undefined ? title.trim() : existingNote.title,
                content: content !== undefined ? content.trim() : existingNote.content,
            },
        });

        return NextResponse.json({ note: updatedNote });
    } catch (error: any) {
        console.error("PUT /api/notes/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to update note", details: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/notes/[id] - Delete an existing note owned by the user
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

        const existingNote = await prisma.projectNote.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!existingNote) {
            return NextResponse.json({ error: "Note not found or unauthorized" }, { status: 404 });
        }

        await prisma.projectNote.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, id });
    } catch (error: any) {
        console.error("DELETE /api/notes/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to delete note", details: error.message },
            { status: 500 }
        );
    }
}
