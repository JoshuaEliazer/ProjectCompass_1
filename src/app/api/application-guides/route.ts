import { NextResponse } from "next/server";
import { generateApplicationGuide, isIdentifiableApplication } from "@/core/use-cases/app-guides";

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const query = body.query || body.appName || body.name || "";

        if (!query || typeof query !== "string" || !query.trim()) {
            return NextResponse.json(
                { error: "Please enter an application name to generate a guide (e.g., Microsoft Word, Canva, Power BI, Figma)." },
                { status: 400 }
            );
        }

        const trimmed = query.trim();

        if (!isIdentifiableApplication(trimmed)) {
            return NextResponse.json(
                {
                    error: `Unable to identify "${trimmed}". Please check the spelling or enter a specific software application (e.g., Microsoft Word, Canva, Power BI, Figma, VS Code, Notion).`,
                    unidentifiable: true
                },
                { status: 422 }
            );
        }

        // Generate dynamic application guide
        const guideData = generateApplicationGuide(trimmed);

        return NextResponse.json({
            success: true,
            guide: guideData
        });
    } catch (error: any) {
        console.error("Failed to generate application guide:", error);
        return NextResponse.json(
            { error: "Failed to generate application guide. Please check your connection and try again.", details: error.message },
            { status: 500 }
        );
    }
}
