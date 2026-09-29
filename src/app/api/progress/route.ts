import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/db/client";

// Get progress for student@projectcompass.io (or create if missing)
async function getOrCreateStudent() {
    let student = await prisma.user.findFirst({
        where: { email: "student@projectcompass.io" },
    });
    if (!student) {
        student = await prisma.user.create({
            data: {
                email: "student@projectcompass.io",
                name: "Mentor Student",
                role: "USER",
            },
        });
    }
    return student;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const learningPathId = searchParams.get("learningPathId");

        if (!learningPathId) {
            return NextResponse.json(
                { error: "Missing learningPathId parameter" },
                { status: 400 }
            );
        }

        const student = await getOrCreateStudent();

        const progress = await prisma.userProgress.findFirst({
            where: {
                userId: student.id,
                learningPathId: learningPathId,
            },
        });

        return NextResponse.json(progress || { completedSteps: "", quizScore: null, quizId: null });
    } catch (error: any) {
        console.error("Failed to fetch progress:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { learningPathId, completedSteps, quizId, quizScore } = body;

        if (!learningPathId) {
            return NextResponse.json(
                { error: "Missing learningPathId in request body" },
                { status: 400 }
            );
        }

        const student = await getOrCreateStudent();

        // Check if progress already exists
        const existingProgress = await prisma.userProgress.findFirst({
            where: {
                userId: student.id,
                learningPathId,
            },
        });

        let progress;
        if (existingProgress) {
            progress = await prisma.userProgress.update({
                where: { id: existingProgress.id },
                data: {
                    completedSteps: completedSteps !== undefined ? completedSteps : existingProgress.completedSteps,
                    quizId: quizId !== undefined ? quizId : existingProgress.quizId,
                    quizScore: quizScore !== undefined ? quizScore : existingProgress.quizScore,
                },
            });
        } else {
            progress = await prisma.userProgress.create({
                data: {
                    userId: student.id,
                    learningPathId,
                    completedSteps: completedSteps || "",
                    quizId: quizId || null,
                    quizScore: quizScore || null,
                },
            });
        }

        return NextResponse.json(progress);
    } catch (error: any) {
        console.error("Failed to save progress:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
