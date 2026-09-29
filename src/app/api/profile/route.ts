import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/db/client";
import { getSessionUser, hashPassword, verifyPassword } from "@/infrastructure/auth";

// GET: Fetch current user profile detail, integrations, session lists, etc.
export async function GET() {
    try {
        const user = await getSessionUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get active sessions
        const activeSessions = await prisma.activeSession.findMany({
            where: { userId: user.id },
            orderBy: { lastActive: "desc" }
        });

        // Omit passwordHash
        const { passwordHash: _, ...userProfile } = user;

        return NextResponse.json({
            success: true,
            profile: userProfile,
            sessions: activeSessions
        });
    } catch (error: any) {
        console.error("Profile GET error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}

// PUT / POST: Update user profile preference fields or security action execution
export async function PUT(request: Request) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { type } = body; // action identifier

        if (type === "PERSONAL_INFO") {
            const { name, username, bio, phone, location, college, degree, gradYear, company, website, githubProfile, linkedinProfile, avatarUrl } = body.data;

            // Check if username is already taken
            if (username && username !== user.username) {
                const search = await prisma.user.findUnique({ where: { username } });
                if (search) {
                    return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
                }
            }

            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: {
                    name,
                    username: username || null,
                    bio: bio || null,
                    phone: phone || null,
                    location: location || null,
                    college: college || null,
                    degree: degree || null,
                    gradYear: gradYear || null,
                    company: company || null,
                    website: website || null,
                    githubProfile: githubProfile || null,
                    linkedinProfile: linkedinProfile || null,
                    avatarUrl: avatarUrl || null
                }
            });

            const { passwordHash: _, ...profile } = updatedUser;
            return NextResponse.json({ success: true, profile });
        }

        if (type === "SECURITY_CHANGE_PASSWORD") {
            const { currentPassword, newPassword, confirmPassword } = body.data;

            if (!currentPassword || !newPassword || !confirmPassword) {
                return NextResponse.json({ error: "All password fields are required" }, { status: 400 });
            }

            if (newPassword !== confirmPassword) {
                return NextResponse.json({ error: "New passwords do not match" }, { status: 400 });
            }

            if (newPassword.length < 8) {
                return NextResponse.json({ error: "New password must be at least 8 characters long" }, { status: 400 });
            }

            // Verify current password
            if (!user.passwordHash) {
                return NextResponse.json({ error: "No password configured. Log in with Google/GitHub instead." }, { status: 400 });
            }

            const check = verifyPassword(currentPassword, user.passwordHash);
            if (!check) {
                return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
            }

            // Save new password
            const newHash = hashPassword(newPassword);
            await prisma.user.update({
                where: { id: user.id },
                data: { passwordHash: newHash }
            });

            return NextResponse.json({ success: true, message: "Password updated successfully" });
        }

        if (type === "SECURITY_LOGOUT_ALL") {
            // Revoke all sessions except the current one (or all of them)
            // But let's delete all active sessions for safety
            await prisma.activeSession.deleteMany({
                where: { userId: user.id }
            });

            return NextResponse.json({ success: true, message: "Successfully logged out from all devices." });
        }

        if (type === "SECURITY_LOGOUT_SESS") {
            const { sessionId } = body.data;
            if (!sessionId) {
                return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
            }

            await prisma.activeSession.delete({
                where: { id: sessionId, userId: user.id }
            });

            return NextResponse.json({ success: true, message: "Pruned session details" });
        }

        if (type === "NOTIFICATION_PREF") {
            const { emailNotifications, pushNotifications, productUpdates, aiAnalysisAlerts, weeklyReports, marketingEmails } = body.data;

            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: {
                    emailNotifications,
                    pushNotifications,
                    productUpdates,
                    aiAnalysisAlerts,
                    weeklyReports,
                    marketingEmails
                }
            });

            const { passwordHash: _, ...profile } = updatedUser;
            return NextResponse.json({ success: true, profile });
        }

        if (type === "APPEARANCE_PREF") {
            const { themePreference, accentColor } = body.data;

            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: {
                    themePreference,
                    accentColor
                }
            });

            const { passwordHash: _, ...profile } = updatedUser;
            return NextResponse.json({ success: true, profile });
        }

        if (type === "PRIVACY_PREF") {
            const { publicProfile, showLearningProgress, showUploadedProjects, aiHistoryShared, shareActivity } = body.data;

            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: {
                    publicProfile,
                    showLearningProgress,
                    showUploadedProjects,
                    aiHistoryShared,
                    shareActivity
                }
            });

            const { passwordHash: _, ...profile } = updatedUser;
            return NextResponse.json({ success: true, profile });
        }

        if (type === "DELETE_ACCOUNT") {
            // Delete user and cascade delete everything
            await prisma.user.delete({
                where: { id: user.id }
            });

            return NextResponse.json({ success: true, message: "Account deleted successfully" });
        }

        if (type === "INTEGRATIONS_PREF") {
            const { service, connected } = body.data; // e.g. "googleConnected", "githubConnected", "linkedinConnected"

            const schemaMap: Record<string, string> = {
                google: "googleConnected",
                github: "githubConnected",
                linkedin: "linkedinConnected"
            };

            const dbField = schemaMap[service];
            if (!dbField) {
                return NextResponse.json({ error: "Invalid integration provider" }, { status: 400 });
            }

            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: {
                    [dbField]: connected
                }
            });

            const { passwordHash: _, ...profile } = updatedUser;
            return NextResponse.json({ success: true, profile });
        }

        if (type === "LEARNING_PREF") {
            const { prefLanguages, prefAiModel, dailyLearningGoal, weeklyLearningGoal, difficultyLevel, learningStyle } = body.data;

            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: {
                    prefLanguages: Array.isArray(prefLanguages) ? prefLanguages.join(",") : prefLanguages,
                    prefAiModel,
                    dailyLearningGoal: parseInt(dailyLearningGoal) || 30,
                    weeklyLearningGoal: parseInt(weeklyLearningGoal) || 150,
                    difficultyLevel,
                    learningStyle
                }
            });

            const { passwordHash: _, ...profile } = updatedUser;
            return NextResponse.json({ success: true, profile });
        }

        return NextResponse.json({ error: "Invalid update actions type requested" }, { status: 400 });

    } catch (error: any) {
        console.error("Profile PUT error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
