import { ScannedModule, ScannedFunction } from "./scanner";
import {
    ProjectUnderstanding,
    ProjectArea,
    ModuleDependency,
    DetectedApiRoute,
    DatabaseInteraction,
    AuthInteraction,
} from "./understanding";

export interface RichFileExplanation {
    role: string;
    explanation: string;
    fitsIntoProject: string;
    whatToUnderstand: string[];
}

export interface RichModuleExplanation {
    role: string;
    explanation: string;
    fitsIntoProject: string;
    whatToUnderstand: string[];
}

export interface RichProjectOverview {
    overviewText: string;
    organizationText: string;
}

export interface ExplainableModule {
    filePath: string;
    fileName: string;
    fileType: string;
    summary?: string | null;
    codeContent?: string | null;
    startingPoint?: boolean;
    functions?: any[];
    language?: string;
    category?: string;
    imports?: string[];
}

// 1. Generate Rich File Explanation (4–6 sentences + Fit + Key Concepts)
export function generateRichFileExplanation(
    fileModule: ExplainableModule,
    allModules: ExplainableModule[],
    dependencies: ModuleDependency[],
    apiRoutes: DetectedApiRoute[],
    database: DatabaseInteraction | null,
    auth: AuthInteraction | null
): RichFileExplanation {
    const fileName = fileModule.fileName;
    const filePath = fileModule.filePath;
    const language = fileModule.language || "Source Code";
    const category = fileModule.category || "source";
    const functions = fileModule.functions || [];
    const imports = fileModule.imports || [];

    // Find incoming dependents (who imports this file)
    const importedBy = dependencies
        .filter((d) => d.targetPath === filePath)
        .map((d) => d.sourcePath);
    
    // Find outgoing dependencies (what this file imports)
    const dependsOn = dependencies
        .filter((d) => d.sourcePath === filePath)
        .map((d) => d.targetPath);

    // Check if this file defines API routes
    const fileApiRoutes = apiRoutes.filter((r) => r.handlerFile === filePath);

    // Check if database or auth related
    const isDb = database?.files.includes(filePath) || category === "database-related";
    const isAuth = auth?.files.includes(filePath) || category === "authentication-related";

    let role = "Source Module";
    let explanationSentences: string[] = [];
    let fitsSentences: string[] = [];
    let whatToUnderstand: string[] = [];

    if (fileModule.startingPoint) {
        role = "Application Entry Point";
        explanationSentences.push(
            `This file (\`${fileName}\`) acts as the primary entry point for application execution.`
        );
        explanationSentences.push(
            `It exists to bootstrap the application runtime, initialize global configurations, and launch the primary execution flow.`
        );
        explanationSentences.push(
            `Static analysis shows it contains ${functions.length} function declaration(s) and imports ${imports.length} dependency module(s).`
        );
        if (dependsOn.length > 0) {
            explanationSentences.push(
                `It delegates execution to key modules including \`${dependsOn.slice(0, 3).join("`, `")}\`.`
            );
        } else {
            explanationSentences.push(
                `It establishes the baseline execution context before further application modules are loaded.`
            );
        }
        explanationSentences.push(
            `Developers exploring this project should start here to trace how the application initializes its components.`
        );

        fitsSentences.push(
            `As the entry point, this file sits at the top of the call stack. It triggers initial execution and connects core sub-modules.`
        );

        whatToUnderstand = [
            "This file is the recommended entry point for understanding project startup.",
            `It imports ${imports.length} external or internal dependency module(s).`,
            "Changes here can affect global application initialization.",
        ];

    } else if (fileApiRoutes.length > 0 || category === "route") {
        role = "API Route & Request Handler";
        const routesText = fileApiRoutes.length > 0
            ? fileApiRoutes.map((r) => `\`${r.method || "ANY"}\` \`${r.path}\``).slice(0, 2).join(", ")
            : `endpoint handlers in \`${filePath}\``;

        explanationSentences.push(
            `This file (\`${fileName}\`) is an API route handler in the application's backend server layer.`
        );
        explanationSentences.push(
            `It exists to process HTTP request payloads, validate request parameters, and return formatted API responses.`
        );
        explanationSentences.push(
            `Static analysis confirmed it defines endpoint route logic targeting ${routesText}.`
        );
        if (dependsOn.length > 0) {
            explanationSentences.push(
                `To process request logic, it interacts with internal modules such as \`${dependsOn.slice(0, 3).join("`, `")}\`.`
            );
        } else {
            explanationSentences.push(
                `It processes incoming request payloads directly and returns structured JSON or HTTP responses.`
            );
        }
        explanationSentences.push(
            `When a client sends a web request to these endpoints, this file executes the corresponding route handler.`
        );

        fitsSentences.push(
            `This file acts as an entry gateway for client web requests, bridging HTTP traffic with internal server processing.`
        );

        whatToUnderstand = [
            `Defines backend API endpoint routes (${routesText}).`,
            "Handles HTTP request processing and response formatting.",
            `Communicates with ${dependsOn.length} internal supporting module(s).`,
        ];

    } else if (category === "component") {
        role = "Frontend User Interface Component";
        explanationSentences.push(
            `This file (\`${fileName}\`) is a presentation component in the application's user interface layer.`
        );
        explanationSentences.push(
            `It exists to render UI visual elements, manage component state, and capture user interactions.`
        );
        explanationSentences.push(
            `Written in ${language}, it defines ${functions.length > 0 ? `${functions.length} component function(s)` : "layout logic"} for client rendering.`
        );
        if (dependsOn.length > 0) {
            explanationSentences.push(
                `It imports UI sub-components and helpers such as \`${dependsOn.slice(0, 3).join("`, `")}\`.`
            );
        } else {
            explanationSentences.push(
                `It structures UI markup and visual styling for display in the client interface.`
            );
        }
        explanationSentences.push(
            `In the frontend architecture, it presents visual feedback to users and triggers actions upon user input.`
        );

        fitsSentences.push(
            `This file belongs to the presentation layer. It converts application state into visible UI components.`
        );

        whatToUnderstand = [
            "Renders frontend user interface layout and interactive controls.",
            `Contains ${functions.length} component function(s) or render blocks.`,
            "Updates visually in response to user actions or state changes.",
        ];

    } else if (category === "service" || category === "source") {
        role = "Business Logic & Service Engine";
        explanationSentences.push(
            `This file (\`${fileName}\`) contains application business logic and service operations.`
        );
        explanationSentences.push(
            `It exists to encapsulate core domain rules away from raw API routes or user interface components.`
        );
        explanationSentences.push(
            `Static analysis identified ${functions.length} function(s) implementing application use-cases.`
        );
        if (importedBy.length > 0) {
            explanationSentences.push(
                `It is imported and utilized by caller module(s) including \`${importedBy.slice(0, 2).join("`, `")}\`.`
            );
        } else if (dependsOn.length > 0) {
            explanationSentences.push(
                `It relies on supporting utility/data modules like \`${dependsOn.slice(0, 2).join("`, `")}\`.`
            );
        } else {
            explanationSentences.push(
                `It processes data transformations and core operations within the application workflow.`
            );
        }
        explanationSentences.push(
            `It acts as an intermediate logic layer coordinating operations between API handlers and data models.`
        );

        fitsSentences.push(
            `This file sits between request entry handlers and data stores, executing core domain business rules.`
        );

        whatToUnderstand = [
            `Contains ${functions.length} business logic operation(s).`,
            importedBy.length > 0 ? `Used by ${importedBy.length} caller module(s) in the codebase.` : "Encapsulates standalone processing logic.",
            "Keeps business rules separated from raw UI or database code.",
        ];

    } else if (isDb) {
        role = "Database Model & Data Access Contract";
        explanationSentences.push(
            `This file (\`${fileName}\`) manages database schema models or data access operations.`
        );
        explanationSentences.push(
            `It exists to structure persistent storage entities, defining database tables, fields, or query operations.`
        );
        explanationSentences.push(
            `Static analysis detected database queries or ORM model declarations within this file.`
        );
        if (importedBy.length > 0) {
            explanationSentences.push(
                `It is imported by service and API modules such as \`${importedBy.slice(0, 2).join("`, `")}\` for data operations.`
            );
        } else {
            explanationSentences.push(
                `It provides data contracts used across persistent database operations.`
            );
        }
        explanationSentences.push(
            `It forms the data-access foundation that ensures application records are reliably stored and retrieved.`
        );

        fitsSentences.push(
            `This file belongs to the data layer. It provides entity definitions and database interactions.`
        );

        whatToUnderstand = [
            "Defines database schema, models, or data access queries.",
            "Used by server modules to read or write persistent application data.",
            "Changes to fields here directly impact database records.",
        ];

    } else if (isAuth) {
        role = "Authentication & Security Module";
        explanationSentences.push(
            `This file (\`${fileName}\`) manages user authentication, session validation, or security credentials.`
        );
        explanationSentences.push(
            `It exists to verify user identities, handle password or token validation, and secure access.`
        );
        explanationSentences.push(
            `Static analysis detected security, session, or credential handling logic inside this file.`
        );
        if (importedBy.length > 0) {
            explanationSentences.push(
                `It is invoked by protected routes and server services including \`${importedBy.slice(0, 2).join("`, `")}\`.`
            );
        } else {
            explanationSentences.push(
                `It validates credentials and manages active user session state.`
            );
        }
        explanationSentences.push(
            `It forms a core part of the application's security and access-control architecture.`
        );

        fitsSentences.push(
            `This file sits in the security layer, validating user access before sensitive operations execute.`
        );

        whatToUnderstand = [
            "Manages authentication, token verification, or session security.",
            "Used by protected endpoints to ensure authorized user access.",
            "Critical for maintaining user privacy and system security.",
        ];

    } else if (category === "configuration") {
        role = "Project Configuration & Build Manifest";
        explanationSentences.push(
            `This file (\`${fileName}\`) is a configuration manifest or build environment specification.`
        );
        explanationSentences.push(
            `It exists to declare external library dependencies, package scripts, or runtime compiler options.`
        );
        explanationSentences.push(
            `The package manager and build system inspect this file to set up project dependencies.`
        );
        explanationSentences.push(
            `It configures essential build options that govern how the project is compiled and bundled.`
        );

        fitsSentences.push(
            `This file operates at the build and environment level, establishing settings for the entire project.`
        );

        whatToUnderstand = [
            "Configures package dependencies, environment, or build rules.",
            "Read by build tools and package managers during setup.",
            "Defines third-party libraries available to the codebase.",
        ];

    } else if (category === "utility") {
        role = "Shared Utility & Helper";
        explanationSentences.push(
            `This file (\`${fileName}\`) provides reusable helper utility functions.`
        );
        explanationSentences.push(
            `It exists to isolate common operations like string formatting, data conversion, or validation.`
        );
        explanationSentences.push(
            `Static analysis identified ${functions.length} helper function(s) exported for project-wide use.`
        );
        if (importedBy.length > 0) {
            explanationSentences.push(
                `It is imported across ${importedBy.length} module(s) including \`${importedBy.slice(0, 2).join("`, `")}\`.`
            );
        } else {
            explanationSentences.push(
                `It offers general helper routines that reduce repetitive code across the project.`
            );
        }
        explanationSentences.push(
            `It acts as a supporting helper library simplifying implementation in feature modules.`
        );

        fitsSentences.push(
            `This file is a shared utility module referenced by multiple feature components across layers.`
        );

        whatToUnderstand = [
            `Provides ${functions.length} reusable utility helper function(s).`,
            importedBy.length > 0 ? `Imported by ${importedBy.length} module(s) across the project.` : "Provides modular helper routines.",
            "Keeps repetitive helper tasks out of main feature code.",
        ];

    } else {
        role = "Supporting Source Module";
        explanationSentences.push(
            `This file (\`${fileName}\`) is a supporting source module written in ${language}.`
        );
        explanationSentences.push(
            `It exists to structure specific logic, data declarations, or internal functions for the project.`
        );
        explanationSentences.push(
            `Static analysis parsed ${functions.length} function/method declaration(s) inside this file.`
        );
        if (dependsOn.length > 0) {
            explanationSentences.push(
                `It imports and relies on \`${dependsOn.slice(0, 2).join("`, `")}\`.`
            );
        } else {
            explanationSentences.push(
                `It provides focused execution logic within its parent directory.`
            );
        }
        explanationSentences.push(
            `It contributes to the modular structure of the analyzed codebase.`
        );

        fitsSentences.push(
            `This file operates as a modular source component supporting its parent feature module.`
        );

        whatToUnderstand = [
            `Source module written in ${language}.`,
            `Contains ${functions.length} parsed function/method declaration(s).`,
            "Organized to keep code modular and readable.",
        ];
    }

    return {
        role,
        explanation: explanationSentences.join(" "),
        fitsIntoProject: fitsSentences.join(" "),
        whatToUnderstand,
    };
}

// 2. Generate Rich Module / Directory Explanation (4–6 sentences)
export function generateRichModuleExplanation(
    area: ProjectArea,
    allModules: ExplainableModule[],
    dependencies: ModuleDependency[],
    apiRoutes: DetectedApiRoute[],
    database: DatabaseInteraction | null,
    auth: AuthInteraction | null
): RichModuleExplanation {
    const areaName = area.name;
    const filePaths = area.modulePaths;
    const moduleFiles = allModules.filter((m) => filePaths.includes(m.filePath));
    const totalFunctions = moduleFiles.reduce((acc, m) => acc + (m.functions?.length || 0), 0);

    // Dependencies
    const dependsOnSet = new Set<string>();
    const usedBySet = new Set<string>();
    dependencies.forEach((d) => {
        if (filePaths.includes(d.sourcePath) && !filePaths.includes(d.targetPath)) {
            dependsOnSet.add(d.targetPath);
        }
        if (filePaths.includes(d.targetPath) && !filePaths.includes(d.sourcePath)) {
            usedBySet.add(d.sourcePath);
        }
    });

    const dependsOnList = Array.from(dependsOnSet);
    const usedByList = Array.from(usedBySet);

    let role = areaName;
    let explanationSentences: string[] = [];
    let fitsSentences: string[] = [];
    let whatToUnderstand: string[] = [];

    explanationSentences.push(
        `The \`${areaName}\` module groups ${filePaths.length} related file(s) that manage ${area.description.toLowerCase()}.`
    );
    explanationSentences.push(
        `It exists to provide a clean structural boundary, organizing source components according to their role.`
    );
    explanationSentences.push(
        `Static analysis identified a total of ${totalFunctions} function/class declaration(s) across files in this module.`
    );

    if (usedByList.length > 0) {
        explanationSentences.push(
            `This module is invoked by external components including \`${usedByList.slice(0, 2).join("`, `")}\`.`
        );
    } else if (dependsOnList.length > 0) {
        explanationSentences.push(
            `It depends on supporting internal modules such as \`${dependsOnList.slice(0, 2).join("`, `")}\`.`
        );
    } else {
        explanationSentences.push(
            `It operates as a self-contained functional area within the codebase.`
        );
    }

    explanationSentences.push(
        `Within the overall project architecture, this module ensures code related to ${areaName.toLowerCase()} remains decoupled and maintainable.`
    );

    fitsSentences.push(
        `This module represents a major structural column in the project, organizing ${filePaths.length} file(s) under ${areaName}.`
    );

    whatToUnderstand = [
        `Encapsulates ${filePaths.length} file(s) dedicated to ${areaName}.`,
        `Contains ${totalFunctions} total parsed function/class declaration(s).`,
        usedByList.length > 0 ? `Used by ${usedByList.length} external module(s) in the application.` : "Operates as a key structural layer.",
    ];

    return {
        role,
        explanation: explanationSentences.join(" "),
        fitsIntoProject: fitsSentences.join(" "),
        whatToUnderstand,
    };
}

// 3. Generate Rich Project Overview (5–8 sentences + Organization Paragraph)
export function generateRichProjectOverview(
    understanding: ProjectUnderstanding,
    modules: ExplainableModule[],
    technologies: string[],
    entryPoint: string | null,
    entryEvidence: string
): RichProjectOverview {
    const fileModules = modules.filter((m) => m.fileType === "file");
    const totalFunctions = fileModules.reduce((acc, m) => acc + (m.functions?.length || 0), 0);
    const techText = technologies.length > 0 ? technologies.join(", ") : "Standard Software Stack";

    let overviewSentences: string[] = [];
    let orgSentences: string[] = [];

    // Sentence 1: App Type
    let appType = "software application";
    if (technologies.includes("Next.js") || technologies.includes("React")) appType = "full-stack web application";
    else if (technologies.includes("Flask") || technologies.includes("Express") || technologies.includes("FastAPI") || technologies.includes("Spring Boot") || technologies.includes("Gin")) appType = "backend web service";
    else if (technologies.includes("Flutter")) appType = "cross-platform mobile/desktop application";
    else if (technologies.includes("Python")) appType = "Python application project";
    else if (technologies.includes("Java")) appType = "Java application project";

    overviewSentences.push(
        `This project is structured as a ${appType} built primarily using ${techText}.`
    );

    // Sentence 2: Entry Point
    if (entryPoint) {
        overviewSentences.push(
            `Primary execution begins at the entry point file \`${entryPoint}\` (${entryEvidence}).`
        );
    } else {
        overviewSentences.push(
            `Execution is distributed across modular entry handlers identified during analysis.`
        );
    }

    // Sentence 3: Scale & Areas
    const areaNames = understanding.areas.map((a) => a.name).join(", ");
    overviewSentences.push(
        `Static analysis mapped ${fileModules.length} source file(s) across ${understanding.areas.length} functional area(s): ${areaNames}.`
    );

    // Sentence 4: Data Flow / API
    if (understanding.apiRoutes.length > 0) {
        overviewSentences.push(
            `The application exposes ${understanding.apiRoutes.length} static API route endpoint(s) for handling client requests.`
        );
    } else {
        overviewSentences.push(
            `Application components communicate internally through modular function calls and class invocations.`
        );
    }

    // Sentence 5: Database
    if (understanding.database) {
        overviewSentences.push(
            `Persistent data storage is handled by ${understanding.database.type} across ${understanding.database.files.length} connected database file(s).`
        );
    }

    // Sentence 6: Auth / External
    if (understanding.authentication) {
        overviewSentences.push(
            `Security and access control are managed via ${understanding.authentication.type}.`
        );
    } else if (understanding.externalServices.length > 0) {
        overviewSentences.push(
            `The system integrates third-party services including ${understanding.externalServices.map((s) => s.name).join(", ")}.`
        );
    }

    // Sentence 7: Function Scale
    overviewSentences.push(
        `In total, the AST parser decoded ${totalFunctions} function/method declaration(s) across the codebase.`
    );

    // Organization Paragraph
    orgSentences.push(
        `At a high level, the project is organized into ${understanding.areas.length} distinct structural layer(s).`
    );
    orgSentences.push(
        `Execution begins at \`${entryPoint || "entry modules"}\`, which initializes control flow and delegates operations to ${areaNames}.`
    );
    if (understanding.database) {
        orgSentences.push(
            `Data flows from request entry points through business logic layers into ${understanding.database.type} for persistent storage.`
        );
    } else {
        orgSentences.push(
            `Modules maintain a clean separation of concerns, allowing components to evolve independently.`
        );
    }
    orgSentences.push(
        `This modular layout ensures that user interfaces, server logic, and data layers remain decoupled and maintainable.`
    );

    return {
        overviewText: overviewSentences.join(" "),
        organizationText: orgSentences.join(" "),
    };
}

// 4. Generate Function/Class Explanation (2–4 sentences)
export function generateFunctionExplanation(
    func: ScannedFunction,
    fileName: string
): string {
    const name = func.name;
    const signature = func.signature ? `(${func.signature})` : "()";
    const start = func.startLine;
    const end = func.endLine;
    const lineCount = Math.max(1, end - start + 1);

    let sentences: string[] = [];

    if (name.startsWith("class ")) {
        const className = name.replace(/^class\s+/, "");
        sentences.push(
            `The class \`${className}\` defines an object entity structure inside \`${fileName}\`.`
        );
        sentences.push(
            `It spans lines ${start} to ${end} (${lineCount} lines) and encapsulates properties and class methods.`
        );
        sentences.push(
            `Modules instantiate or inherit from this class to manage state and execute related operations.`
        );
    } else {
        sentences.push(
            `The function \`${name}${signature}\` performs processing logic inside \`${fileName}\`.`
        );
        sentences.push(
            `It is defined between lines ${start} and ${end} (${lineCount} lines of code).`
        );
        if (func.docString) {
            sentences.push(`Docstring commentary: "${func.docString.trim()}".`);
        } else {
            sentences.push(
                `It executes internal statements and returns results to caller functions.`
            );
        }
    }

    return sentences.join(" ");
}
