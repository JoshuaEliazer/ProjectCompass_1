import * as path from "path";
import { ScannedModule } from "./scanner";
import { generateRichProjectOverview } from "./explanations";

export interface ModuleDependency {
    sourcePath: string;
    targetPath: string;
    importSpecifier: string;
    status: "confirmed" | "inferred";
}

export interface ProjectArea {
    name: string;
    description: string;
    modulePaths: string[];
}

export interface DetectedApiRoute {
    path: string;
    method?: string;
    handlerFile: string;
    status: "confirmed" | "inferred";
}

export interface DatabaseInteraction {
    type: string;
    files: string[];
    evidence: string;
    status: "confirmed" | "inferred";
}

export interface AuthInteraction {
    type: string;
    files: string[];
    evidence: string;
    status: "confirmed" | "inferred";
}

export interface ExternalService {
    name: string;
    files: string[];
    evidence: string;
    status: "confirmed" | "inferred";
}

export interface FrontendBackendLink {
    frontendFile: string;
    apiEndpoint: string;
    status: "confirmed" | "inferred";
}

export interface EntryWorkflow {
    entryFile: string | null;
    evidence: string;
    connectedModules: string[];
}

export interface ProjectUnderstanding {
    areas: ProjectArea[];
    dependencies: ModuleDependency[];
    entryWorkflow: EntryWorkflow;
    apiRoutes: DetectedApiRoute[];
    database: DatabaseInteraction | null;
    authentication: AuthInteraction | null;
    frontendBackendLinks: FrontendBackendLink[];
    externalServices: ExternalService[];
    summary: {
        architectureText: string;
        dataFlowText: string;
        authFlowText: string;
        apiSummaryText: string;
    };
}

export function analyzeProjectUnderstanding(
    modules: ScannedModule[],
    technologies: string[],
    entryPointPath: string | null,
    entryEvidence: string
): ProjectUnderstanding {
    const fileModules = modules.filter((m) => m.fileType === "file");

    // 1. Module Relationships / Dependency Graph
    const dependencies: ModuleDependency[] = [];
    const moduleMap = new Map<string, ScannedModule>();
    fileModules.forEach((m) => moduleMap.set(m.filePath, m));

    fileModules.forEach((source) => {
        if (!source.imports || source.imports.length === 0) return;

        source.imports.forEach((imp) => {
            let matchedTarget: ScannedModule | undefined = undefined;

            // Direct relative path match
            if (imp.startsWith(".")) {
                const dir = path.dirname(source.filePath);
                const resolvedRel = path.normalize(path.join(dir, imp)).replace(/\\/g, "/");

                // Try exact match or extensions
                const exts = ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.js", ".py", ".java", ".go"];
                for (const e of exts) {
                    const testPath = resolvedRel + e;
                    if (moduleMap.has(testPath)) {
                        matchedTarget = moduleMap.get(testPath);
                        break;
                    }
                }
            } else if (imp.startsWith("@/")) {
                // Next.js / TypeScript path alias @/
                const aliasPath = imp.replace(/^@\//, "src/");
                const aliasPathNoSrc = imp.replace(/^@\//, "");
                const exts = ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.js"];
                for (const e of exts) {
                    if (moduleMap.has(aliasPath + e)) {
                        matchedTarget = moduleMap.get(aliasPath + e);
                        break;
                    }
                    if (moduleMap.has(aliasPathNoSrc + e)) {
                        matchedTarget = moduleMap.get(aliasPathNoSrc + e);
                        break;
                    }
                }
            } else {
                // Check if import matches internal module filename (e.g. import "scanner")
                const baseImp = path.basename(imp, path.extname(imp));
                matchedTarget = fileModules.find(
                    (m) => m.fileName.replace(path.extname(m.fileName), "") === baseImp && m.filePath !== source.filePath
                );
            }

            if (matchedTarget) {
                dependencies.push({
                    sourcePath: source.filePath,
                    targetPath: matchedTarget.filePath,
                    importSpecifier: imp,
                    status: "confirmed",
                });
            } else if (imp.startsWith(".") || imp.startsWith("@/")) {
                dependencies.push({
                    sourcePath: source.filePath,
                    targetPath: imp,
                    importSpecifier: imp,
                    status: "inferred",
                });
            }
        });
    });

    // 2. Project Area Detection
    const areas: ProjectArea[] = [];
    const areaMap = new Map<string, string[]>();

    fileModules.forEach((m) => {
        const cat = m.category || "source";
        let areaName = "Other Modules";
        let areaDesc = "General supporting modules";

        if (cat === "component" || m.filePath.includes("components/") || m.filePath.includes("views/") || m.filePath.includes("app/") || m.language === "HTML" || m.language === "CSS" || m.language === "SCSS") {
            areaName = "Frontend UI & Presentation";
            areaDesc = "User interface layouts, page views, styling, and client components";
        } else if (cat === "route" || m.filePath.includes("api/") || m.filePath.includes("controllers/") || m.filePath.includes("routes/") || m.filePath.includes("handlers/")) {
            areaName = "Backend API & Routing";
            areaDesc = "API route endpoints, request controllers, and router handlers";
        } else if (cat === "database-related" || cat === "model" || m.filePath.includes("prisma/") || m.filePath.includes("models/") || m.filePath.includes("db/") || m.filePath.includes("entities/")) {
            areaName = "Database & Data Models";
            areaDesc = "Database ORM schemas, model entities, and query implementations";
        } else if (cat === "authentication-related" || m.filePath.includes("auth") || m.filePath.includes("session")) {
            areaName = "Authentication & Security";
            areaDesc = "User login, session validation, access control, and credential handling";
        } else if (cat === "service" || cat === "source" || m.filePath.includes("core/") || m.filePath.includes("services/") || m.filePath.includes("use-cases/") || m.filePath.includes("lib/")) {
            areaName = "Business Logic & Services";
            areaDesc = "Domain core logic, service layers, and business use cases";
        } else if (cat === "configuration") {
            areaName = "Project Configuration & Manifests";
            areaDesc = "Package manifests, environment configs, and build scripts";
        } else if (cat === "documentation") {
            areaName = "Documentation";
            areaDesc = "Project markdown guides, licenses, and documentation";
        } else if (cat === "test") {
            areaName = "Tests & Quality Assurance";
            areaDesc = "Automated unit tests and integration suites";
        } else if (cat === "utility") {
            areaName = "Utilities & Helpers";
            areaDesc = "Shared utility functions and general helper modules";
        }

        if (!areaMap.has(areaName)) {
            areaMap.set(areaName, []);
        }
        areaMap.get(areaName)!.push(m.filePath);
    });

    const areaDescriptions: Record<string, string> = {
        "Frontend UI & Presentation": "User interface layouts, page views, styling, and client components",
        "Backend API & Routing": "API route endpoints, request controllers, and router handlers",
        "Database & Data Models": "Database ORM schemas, model entities, and query implementations",
        "Authentication & Security": "User login, session validation, access control, and credential handling",
        "Business Logic & Services": "Domain core logic, service layers, and business use cases",
        "Project Configuration & Manifests": "Package manifests, environment configs, and build scripts",
        "Documentation": "Project markdown guides, licenses, and documentation",
        "Tests & Quality Assurance": "Automated unit tests and integration suites",
        "Utilities & Helpers": "Shared utility functions and general helper modules",
        "Other Modules": "General supporting modules",
    };

    areaMap.forEach((modulePaths, name) => {
        areas.push({
            name,
            description: areaDescriptions[name] || "Codebase area",
            modulePaths,
        });
    });

    // 3. Entry-Point Workflow Analysis
    const connectedModules: string[] = [];
    if (entryPointPath) {
        connectedModules.push(entryPointPath);
        // Find 1st-level dependencies from entry point
        const directDeps = dependencies
            .filter((d) => d.sourcePath === entryPointPath && d.status === "confirmed")
            .map((d) => d.targetPath);
        
        directDeps.forEach((dep) => {
            if (!connectedModules.includes(dep)) connectedModules.push(dep);
        });

        // 2nd level dependencies
        directDeps.forEach((dep) => {
            const level2 = dependencies
                .filter((d) => d.sourcePath === dep && d.status === "confirmed")
                .map((d) => d.targetPath);
            level2.forEach((l2) => {
                if (!connectedModules.includes(l2)) connectedModules.push(l2);
            });
        });
    }

    const entryWorkflow: EntryWorkflow = {
        entryFile: entryPointPath,
        evidence: entryEvidence,
        connectedModules,
    };

    // 4. API / Request Flow Detection
    const apiRoutes: DetectedApiRoute[] = [];

    fileModules.forEach((m) => {
        const code = m.codeContent || "";
        const lowerPath = m.filePath.toLowerCase();

        // Next.js App Router API Routes
        if (lowerPath.includes("api/") && m.fileName.startsWith("route.")) {
            // E.g. src/app/api/developers/upload/route.ts -> /api/developers/upload
            const match = m.filePath.match(/(?:src\/app\/|app\/)?api\/(.+)\/route\.[w]+/i);
            const routePath = match ? `/api/${match[1]}` : `/${m.filePath}`;

            // Check HTTP methods in file
            const methods: string[] = [];
            if (code.includes("export async function GET") || code.includes("export function GET")) methods.push("GET");
            if (code.includes("export async function POST") || code.includes("export function POST")) methods.push("POST");
            if (code.includes("export async function PUT") || code.includes("export function PUT")) methods.push("PUT");
            if (code.includes("export async function DELETE") || code.includes("export function DELETE")) methods.push("DELETE");

            apiRoutes.push({
                path: routePath,
                method: methods.length > 0 ? methods.join(", ") : "ALL",
                handlerFile: m.filePath,
                status: "confirmed",
            });
        }
        // Express / Node routes
        else if (code.includes("app.get(") || code.includes("router.get(") || code.includes("app.post(") || code.includes("router.post(")) {
            const regex = /(?:app|router)\.(get|post|put|delete)\s*\(\s*['"]([^'"]+)['"]/g;
            let match;
            while ((match = regex.exec(code)) !== null) {
                apiRoutes.push({
                    path: match[2],
                    method: match[1].toUpperCase(),
                    handlerFile: m.filePath,
                    status: "confirmed",
                });
            }
        }
        // Python Flask / FastAPI routes
        else if (code.includes("@app.route") || code.includes("@router.get") || code.includes("@app.get") || code.includes("@app.post")) {
            const regex = /@(?:app|router)\.(?:route|get|post|put|delete)\s*\(\s*['"]([^'"]+)['"]/g;
            let match;
            while ((match = regex.exec(code)) !== null) {
                apiRoutes.push({
                    path: match[1],
                    handlerFile: m.filePath,
                    status: "confirmed",
                });
            }
        }
        // Spring Boot Controllers
        else if (code.includes("@GetMapping") || code.includes("@PostMapping") || code.includes("@RequestMapping")) {
            const regex = /@(GetMapping|PostMapping|RequestMapping)\s*\(\s*(?:value\s*=\s*)?['"]([^'"]+)['"]/g;
            let match;
            while ((match = regex.exec(code)) !== null) {
                apiRoutes.push({
                    path: match[2],
                    method: match[1] === "GetMapping" ? "GET" : match[1] === "PostMapping" ? "POST" : "ANY",
                    handlerFile: m.filePath,
                    status: "confirmed",
                });
            }
        }
        // Go Gin / Fiber routes
        else if (code.includes("r.GET(") || code.includes("r.POST(") || code.includes("app.Get(")) {
            const regex = /(?:r|app)\.(GET|POST|PUT|DELETE|Get|Post)\s*\(\s*['"]([^'"]+)['"]/g;
            let match;
            while ((match = regex.exec(code)) !== null) {
                apiRoutes.push({
                    path: match[2],
                    method: match[1].toUpperCase(),
                    handlerFile: m.filePath,
                    status: "confirmed",
                });
            }
        }
    });

    // 5. Database Interaction Detection
    let database: DatabaseInteraction | null = null;
    const dbFiles: string[] = [];

    fileModules.forEach((m) => {
        const code = m.codeContent || "";
        if (
            m.category === "database-related" ||
            code.includes("PrismaClient") ||
            code.includes("prisma.") ||
            code.includes("mongoose.connect") ||
            code.includes("sqlalchemy") ||
            code.includes("createConnection") ||
            code.includes("psycopg2") ||
            code.includes("sqlite3") ||
            m.fileName === "schema.prisma"
        ) {
            dbFiles.push(m.filePath);
        }
    });

    if (dbFiles.length > 0 || technologies.includes("Prisma ORM") || technologies.includes("SQLite") || technologies.includes("PostgreSQL") || technologies.includes("MongoDB") || technologies.includes("MySQL")) {
        let dbType = "Database / Data Store";
        if (technologies.includes("Prisma ORM")) dbType = "Prisma ORM (Relational DB)";
        else if (technologies.includes("PostgreSQL")) dbType = "PostgreSQL Database";
        else if (technologies.includes("MongoDB")) dbType = "MongoDB Document Store";
        else if (technologies.includes("SQLite")) dbType = "SQLite Embedded Database";
        else if (technologies.includes("MySQL")) dbType = "MySQL Relational Database";

        database = {
            type: dbType,
            files: dbFiles,
            evidence: `Detected ${dbFiles.length} file(s) containing ORM schema models or database client queries (${dbType}).`,
            status: "confirmed",
        };
    }

    // 6. Authentication Detection
    let authentication: AuthInteraction | null = null;
    const authFiles: string[] = [];

    fileModules.forEach((m) => {
        const code = m.codeContent || "";
        if (
            m.category === "authentication-related" ||
            code.includes("session_token") ||
            code.includes("scrypt") ||
            code.includes("jwt") ||
            code.includes("passport") ||
            code.includes("ActiveSession") ||
            code.includes("hashPassword") ||
            code.includes("verifyPassword")
        ) {
            authFiles.push(m.filePath);
        }
    });

    if (authFiles.length > 0) {
        let authType = "Authentication System";
        if (fileModules.some((m) => (m.codeContent || "").includes("session_token"))) authType = "Cookie-Based Session Auth";
        else if (fileModules.some((m) => (m.codeContent || "").includes("jwt"))) authType = "JSON Web Token (JWT) Auth";

        authentication = {
            type: authType,
            files: authFiles,
            evidence: `Detected ${authFiles.length} file(s) handling credential verification, password hashing, or session management.`,
            status: "confirmed",
        };
    }

    // 7. Frontend -> Backend Relationships
    const frontendBackendLinks: FrontendBackendLink[] = [];

    fileModules.forEach((m) => {
        if (m.category === "component" || m.category === "source") {
            const code = m.codeContent || "";
            // Regex to find fetch('/api/...') or fetch("/api/...")
            const fetchRegex = /fetch\s*\(\s*[`'"](\/api\/[^`'"]+)[`'"]/g;
            let match;
            while ((match = fetchRegex.exec(code)) !== null) {
                const apiEndpoint = match[1].split("?")[0];
                frontendBackendLinks.push({
                    frontendFile: m.filePath,
                    apiEndpoint,
                    status: "confirmed",
                });
            }
        }
    });

    // 8. External Service Detection
    const externalServices: ExternalService[] = [];
    const servicePatterns = [
        { name: "Recharts Data Visualization", pattern: /recharts/i, desc: "React charting and telemetry visualizer" },
        { name: "Lucide Icons", pattern: /lucide-react/i, desc: "Icon set library" },
        { name: "Stripe Payments", pattern: /stripe/i, desc: "Payment gateway integration" },
        { name: "AWS SDK", pattern: /aws-sdk|@aws-sdk/i, desc: "Amazon Web Services cloud SDK" },
        { name: "Firebase", pattern: /firebase/i, desc: "Firebase cloud backend services" },
        { name: "OpenAI API", pattern: /openai/i, desc: "OpenAI LLM inference integration" },
        { name: "Google Maps Platform", pattern: /google-maps|@googlemaps/i, desc: "Mapping and geocoding services" },
    ];

    servicePatterns.forEach((sp) => {
        const matchingFiles = fileModules
            .filter((m) => sp.pattern.test(m.codeContent || "") || (m.imports && m.imports.some((i) => sp.pattern.test(i))))
            .map((m) => m.filePath);

        if (matchingFiles.length > 0) {
            externalServices.push({
                name: sp.name,
                files: matchingFiles,
                evidence: `${sp.desc} imported in ${matchingFiles.length} module(s).`,
                status: "confirmed",
            });
        }
    });

    // 9. Build evidence-grounded rich summary text reports
    const richOverview = generateRichProjectOverview(
        {
            areas,
            dependencies,
            entryWorkflow,
            apiRoutes,
            database,
            authentication,
            frontendBackendLinks,
            externalServices,
            summary: { architectureText: "", dataFlowText: "", authFlowText: "", apiSummaryText: "" },
        },
        modules,
        technologies,
        entryPointPath,
        entryEvidence
    );

    const architectureText = `### Project Overview\n${richOverview.overviewText}\n\n### How This Project Is Organized\n${richOverview.organizationText}`;

    const dataFlowText = database
        ? `Data Flow Architecture:
- **Storage Engine**: ${database.type}
- **Evidence**: ${database.evidence}
- **Frontend/Backend Data Links**: Detected ${frontendBackendLinks.length} client-to-API fetch trigger(s).
- Connected Database Files: ${database.files.slice(0, 5).join(", ")}${database.files.length > 5 ? "..." : ""}`
        : `Data Flow Architecture:
- No explicit database ORM models detected in static analysis.
- Detected ${apiRoutes.length} REST route endpoint(s) and ${frontendBackendLinks.length} client fetch trigger(s).`;

    const authFlowText = authentication
        ? `Authentication & Security Architecture:
- **Authentication Strategy**: ${authentication.type}
- **Evidence**: ${authentication.evidence}
- **Active Auth Files**: ${authentication.files.join(", ")}`
        : `Authentication & Security Architecture:
- No explicit authentication mechanism detected in static analysis.`;

    const apiSummaryText = apiRoutes.length > 0
        ? `API & Request Flow Summary (${apiRoutes.length} route(s) detected):
${apiRoutes.slice(0, 8).map((r) => `- \`${r.method || "GET/POST"}\` \`${r.path}\` (${r.handlerFile})`).join("\n")}${apiRoutes.length > 8 ? `\n- ... and ${apiRoutes.length - 8} more API endpoints.` : ""}`
        : `API & Request Flow Summary:
- No static REST API routes detected in analyzed modules.`;

    return {
        areas,
        dependencies,
        entryWorkflow,
        apiRoutes,
        database,
        authentication,
        frontendBackendLinks,
        externalServices,
        summary: {
            architectureText,
            dataFlowText,
            authFlowText,
            apiSummaryText,
        },
    };
}
