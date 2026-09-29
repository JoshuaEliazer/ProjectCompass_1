import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/db/client";

export async function GET() {
    try {
        const apps = await prisma.application.findMany({
            include: {
                learningPaths: {
                    include: {
                        steps: {
                            orderBy: {
                                order: "asc",
                            },
                        },
                        quizzes: {
                            include: {
                                questions: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json(apps);
    } catch (error: any) {
        console.error("Failed to fetch applications:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
