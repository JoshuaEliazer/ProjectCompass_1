import * as fs from "fs";
import * as path from "path";
import { Project } from "ts-morph";
import { analyzeProjectUnderstanding, ProjectUnderstanding } from "./understanding";
import { generateRichFileExplanation } from "./explanations";

export interface ScannedFunction {
    name: string;
    signature?: string;
    docString?: string;
    startLine: number;
    endLine: number;
}

export interface ScannedModule {
    filePath: string;
    fileName: string;
    fileType: "file" | "directory";
    summary: string;
    codeContent?: string;
    functions: ScannedFunction[];
    startingPoint: boolean;
    language?: string;
    category?: string;
    imports?: string[];
}

export interface ScanResult {
    repoName: string;
    architecture: string;
    dataFlow: string;
    authFlow: string;
    apiSummary: string;
    modules: ScannedModule[];
    detectedTechnologies?: string[];
    detectedEntryPoint?: string | null;
    understanding?: ProjectUnderstanding;
}

// Map extensions to canonical language names
function detectFileLanguage(ext: string, fileName: string): string {
    const lExt = ext.toLowerCase();
    const lName = fileName.toLowerCase();

    if (lName === "dockerfile") return "Docker";
    if (lName === "makefile") return "Makefile";
    if (lName === "jenkinsfile") return "Groovy";

    switch (lExt) {
        case ".js":
        case ".jsx":
        case ".mjs":
        case ".cjs":
            return "JavaScript";
        case ".ts":
        case ".tsx":
        case ".mts":
        case ".cts":
            return "TypeScript";
        case ".py":
        case ".pyw":
            return "Python";
        case ".java":
            return "Java";
        case ".c":
        case ".h":
            return "C";
        case ".cpp":
        case ".hpp":
        case ".cc":
        case ".cxx":
            return "C++";
        case ".cs":
            return "C#";
        case ".go":
            return "Go";
        case ".rs":
            return "Rust";
        case ".php":
            return "PHP";
        case ".rb":
            return "Ruby";
        case ".dart":
            return "Dart";
        case ".html":
        case ".htm":
            return "HTML";
        case ".css":
            return "CSS";
        case ".scss":
        case ".sass":
        case ".less":
            return "SCSS";
        case ".json":
            return "JSON";
        case ".yaml":
        case ".yml":
            return "YAML";
        case ".xml":
            return "XML";
        case ".sql":
            return "SQL";
        case ".md":
        case ".markdown":
            return "Markdown";
        case ".prisma":
            return "Prisma";
        case ".sh":
        case ".bash":
            return "Shell";
        default:
            return "Text/Other";
    }
}

// Categorize file role dynamically based on path, name, and language
function detectFileCategory(relativeFilePath: string, fileName: string, language: string): string {
    const lowerPath = relativeFilePath.toLowerCase();
    const lowerName = fileName.toLowerCase();

    // Configuration manifests
    if (
        [
            "package.json", "tsconfig.json", "requirements.txt", "pyproject.toml",
            "pom.xml", "build.gradle", "go.mod", "cargo.toml", "pubspec.yaml",
            "composer.json", "gemfile", "dockerfile", "makefile", ".gitignore",
            "next.config.js", "next.config.ts", "next.config.mjs"
        ].includes(lowerName) ||
        lowerName.endsWith(".config.js") ||
        lowerName.endsWith(".config.ts") ||
        lowerName.endsWith(".config.json")
    ) {
        return "configuration";
    }

    // Documentation
    if (language === "Markdown" || lowerName.startsWith("license") || lowerName.startsWith("readme") || lowerPath.includes("docs/")) {
        return "documentation";
    }

    // Database
    if (language === "Prisma" || language === "SQL" || lowerPath.includes("prisma/") || lowerPath.includes("db/") || lowerPath.includes("database/")) {
        return "database-related";
    }

    // Test
    if (
        lowerName.includes(".test.") ||
        lowerName.includes(".spec.") ||
        lowerName.startsWith("test_") ||
        lowerName.endsWith("_test.go") ||
        lowerName.endsWith("test.java") ||
        lowerPath.includes("tests/") ||
        lowerPath.includes("test/")
    ) {
        return "test";
    }

    // Authentication
    if (lowerName.includes("auth") || lowerName.includes("session") || lowerName.includes("login") || lowerName.includes("passport") || lowerName.includes("jwt")) {
        return "authentication-related";
    }

    // Controller / Route / API
    if (lowerName.includes("controller") || lowerName.includes("route") || lowerName.includes("handler") || lowerName.includes("api")) {
        return "route";
    }

    // Model / Schema
    if (lowerName.includes("model") || lowerName.includes("schema") || lowerName.includes("entity")) {
        return "model";
    }

    // Service
    if (lowerName.includes("service") || lowerName.includes("use-case") || lowerName.includes("provider")) {
        return "service";
    }

    // Component / UI
    if (lowerName.includes("component") || lowerName.includes("view") || lowerPath.includes("components/") || lowerPath.includes("views/")) {
        return "component";
    }

    // Utility
    if (lowerName.includes("util") || lowerName.includes("helper") || lowerPath.includes("utils/") || lowerPath.includes("helpers/")) {
        return "utility";
    }

    if (["JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "C", "C++", "C#", "Dart", "PHP", "Ruby"].includes(language)) {
        return "source";
    }

    return "unknown";
}

// Extract functions and import dependencies for various languages
function extractCodeMetadata(
    filePath: string,
    ext: string,
    codeContent: string,
    project: Project
): { functions: ScannedFunction[]; imports: string[] } {
    const functions: ScannedFunction[] = [];
    const imports: string[] = [];
    const lines = codeContent.split("\n");

    // 1. TypeScript / JavaScript via ts-morph AST
    if ([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"].includes(ext)) {
        try {
            const sourceFile = project.createSourceFile(filePath, codeContent, { overwrite: true });

            // Extract imports
            sourceFile.getImportDeclarations().forEach((imp) => {
                const moduleSpecifier = imp.getModuleSpecifierValue();
                if (moduleSpecifier) imports.push(moduleSpecifier);
            });

            // Extract require calls
            sourceFile.getVariableDeclarations().forEach((v) => {
                const init = v.getInitializer();
                if (init && init.getKindName() === "CallExpression") {
                    const text = init.getText();
                    if (text.startsWith("require(")) {
                        const match = text.match(/require\((['"])(.*?)\1\)/);
                        if (match && match[2]) imports.push(match[2]);
                    }
                }
            });

            // Standard functions
            sourceFile.getFunctions().forEach((fn) => {
                const name = fn.getName() || "anonymous";
                const startLine = fn.getStartLineNumber();
                const endLine = fn.getEndLineNumber();
                const signature = fn.getParameters().map((p) => `${p.getName()}: ${p.getType().getText()}`).join(", ");
                const docString = fn.getJsDocs().map((d) => d.getCommentText()).join("\n") || undefined;
                functions.push({ name, startLine, endLine, signature, docString });
            });

            // Arrow functions & function expressions assigned to variables
            sourceFile.getVariableDeclarations().forEach((v) => {
                const initializer = v.getInitializer();
                if (initializer && (initializer.getKindName() === "ArrowFunction" || initializer.getKindName() === "FunctionExpression")) {
                    const name = v.getName();
                    const startLine = v.getStartLineNumber();
                    const endLine = v.getEndLineNumber();
                    functions.push({ name, startLine, endLine });
                }
            });

            // Class methods
            sourceFile.getClasses().forEach((cls) => {
                const className = cls.getName() || "AnonymousClass";
                cls.getMethods().forEach((m) => {
                    const name = `${className}.${m.getName()}`;
                    const startLine = m.getStartLineNumber();
                    const endLine = m.getEndLineNumber();
                    const signature = m.getParameters().map((p) => `${p.getName()}: ${p.getType().getText()}`).join(", ");
                    functions.push({ name, startLine, endLine, signature });
                });
            });

        } catch (err) {
            console.error(`AST parsing skipped for ${path.basename(filePath)}:`, err);
        }
        return { functions, imports };
    }

    // 2. Python (.py)
    if (ext === ".py") {
        const fnRegex = /(?:def|async\s+def)\s+(\w+)\s*\(([^)]*)\):/g;
        const classRegex = /class\s+(\w+)/g;
        const importRegex = /^(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))/gm;

        let match;
        while ((match = importRegex.exec(codeContent)) !== null) {
            const imp = match[1] || match[2];
            if (imp) imports.push(imp);
        }

        while ((match = classRegex.exec(codeContent)) !== null) {
            const lineNo = codeContent.substring(0, match.index).split("\n").length;
            functions.push({
                name: `class ${match[1]}`,
                startLine: lineNo,
                endLine: lineNo + 5,
            });
        }

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            fnRegex.lastIndex = 0;
            const defMatch = fnRegex.exec(line);
            if (defMatch) {
                functions.push({
                    name: defMatch[1],
                    signature: defMatch[2],
                    startLine: i + 1,
                    endLine: Math.min(i + 15, lines.length),
                });
            }
        }
        return { functions, imports };
    }

    // 3. Java (.java)
    if (ext === ".java") {
        const importRegex = /import\s+([\w.*]+);/g;
        let match;
        while ((match = importRegex.exec(codeContent)) !== null) {
            imports.push(match[1]);
        }

        const methodRegex = /(?:public|protected|private|static|\s)+[\w<>\[\]]+\s+(\w+)\s*\(([^)]*)\)\s*(?:throws\s+[\w,\s]+)?\s*\{/g;
        for (let i = 0; i < lines.length; i++) {
            methodRegex.lastIndex = 0;
            const mMatch = methodRegex.exec(lines[i]);
            if (mMatch && !["if", "for", "while", "switch", "catch"].includes(mMatch[1])) {
                functions.push({
                    name: mMatch[1],
                    signature: mMatch[2],
                    startLine: i + 1,
                    endLine: Math.min(i + 20, lines.length),
                });
            }
        }
        return { functions, imports };
    }

    // 4. Go (.go)
    if (ext === ".go") {
        const importRegex = /import\s+\(\s*([\s\S]*?)\s*\)|import\s+"([^"]+)"/g;
        let match;
        while ((match = importRegex.exec(codeContent)) !== null) {
            if (match[2]) imports.push(match[2]);
            else if (match[1]) {
                match[1].split("\n").forEach((l) => {
                    const clean = l.replace(/"/g, "").trim();
                    if (clean) imports.push(clean);
                });
            }
        }

        const funcRegex = /func\s+(?:\([^)]+\)\s+)?(\w+)\s*\(([^)]*)\)/g;
        for (let i = 0; i < lines.length; i++) {
            funcRegex.lastIndex = 0;
            const fMatch = funcRegex.exec(lines[i]);
            if (fMatch) {
                functions.push({
                    name: fMatch[1],
                    signature: fMatch[2],
                    startLine: i + 1,
                    endLine: Math.min(i + 20, lines.length),
                });
            }
        }
        return { functions, imports };
    }

    // 5. C / C++ (.c, .cpp, .h, .hpp)
    if ([".c", ".cpp", ".h", ".hpp", ".cc"].includes(ext)) {
        const incRegex = /#include\s+[<"]([^>"]+)[>"]/g;
        let match;
        while ((match = incRegex.exec(codeContent)) !== null) {
            imports.push(match[1]);
        }

        const funcRegex = /^[\w:*&\s]+\s+(\w+)\s*\(([^)]*)\)\s*\{/gm;
        while ((match = funcRegex.exec(codeContent)) !== null) {
            const lineNo = codeContent.substring(0, match.index).split("\n").length;
            if (!["if", "while", "for", "switch"].includes(match[1])) {
                functions.push({
                    name: match[1],
                    signature: match[2],
                    startLine: lineNo,
                    endLine: lineNo + 15,
                });
            }
        }
        return { functions, imports };
    }

    // 6. C# (.cs)
    if (ext === ".cs") {
        const usingRegex = /using\s+([\w.]+);/g;
        let match;
        while ((match = usingRegex.exec(codeContent)) !== null) {
            imports.push(match[1]);
        }
        const methodRegex = /(?:public|private|protected|internal|static|\s)+[\w<>\[\]]+\s+(\w+)\s*\(([^)]*)\)\s*\{/g;
        for (let i = 0; i < lines.length; i++) {
            methodRegex.lastIndex = 0;
            const mMatch = methodRegex.exec(lines[i]);
            if (mMatch && !["if", "for", "while", "switch"].includes(mMatch[1])) {
                functions.push({
                    name: mMatch[1],
                    signature: mMatch[2],
                    startLine: i + 1,
                    endLine: Math.min(i + 20, lines.length),
                });
            }
        }
        return { functions, imports };
    }

    // 7. Rust (.rs)
    if (ext === ".rs") {
        const useRegex = /use\s+([\w::]+);/g;
        let match;
        while ((match = useRegex.exec(codeContent)) !== null) {
            imports.push(match[1]);
        }
        const fnRegex = /(?:pub\s+)?fn\s+(\w+)\s*\(([^)]*)\)/g;
        for (let i = 0; i < lines.length; i++) {
            fnRegex.lastIndex = 0;
            const fMatch = fnRegex.exec(lines[i]);
            if (fMatch) {
                functions.push({
                    name: fMatch[1],
                    signature: fMatch[2],
                    startLine: i + 1,
                    endLine: Math.min(i + 20, lines.length),
                });
            }
        }
        return { functions, imports };
    }

    // 8. Dart (.dart)
    if (ext === ".dart") {
        const impRegex = /import\s+['"]([^'"]+)['"];/g;
        let match;
        while ((match = impRegex.exec(codeContent)) !== null) {
            imports.push(match[1]);
        }
        const fnRegex = /(?:void|[\w<>]+\s+)?(\w+)\s*\(([^)]*)\)\s*\{/g;
        for (let i = 0; i < lines.length; i++) {
            fnRegex.lastIndex = 0;
            const fMatch = fnRegex.exec(lines[i]);
            if (fMatch && !["if", "for", "while", "switch"].includes(fMatch[1])) {
                functions.push({
                    name: fMatch[1],
                    signature: fMatch[2],
                    startLine: i + 1,
                    endLine: Math.min(i + 20, lines.length),
                });
            }
        }
        return { functions, imports };
    }

    // 9. PHP (.php) / Ruby (.rb)
    if (ext === ".php" || ext === ".rb") {
        const fnRegex = ext === ".php" ? /function\s+(\w+)\s*\(([^)]*)\)/g : /def\s+(\w+)(?:\(([^)]*)\))?/g;
        for (let i = 0; i < lines.length; i++) {
            fnRegex.lastIndex = 0;
            const fMatch = fnRegex.exec(lines[i]);
            if (fMatch) {
                functions.push({
                    name: fMatch[1],
                    signature: fMatch[2] || "",
                    startLine: i + 1,
                    endLine: Math.min(i + 15, lines.length),
                });
            }
        }
        return { functions, imports };
    }

    return { functions, imports };
}

// Inspect manifest files and file extensions to detect technologies based ONLY on evidence
function detectProjectTechnologies(targetDir: string, scannedModules: ScannedModule[]): string[] {
    const techSet = new Set<string>();

    // Language detection from scanned file extensions
    scannedModules.forEach((m) => {
        if (m.language && m.language !== "Text/Other") {
            techSet.add(m.language);
        }
    });

    // Manifest inspections
    const pkgJsonPath = path.join(targetDir, "package.json");
    if (fs.existsSync(pkgJsonPath)) {
        techSet.add("Node.js");
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
            const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

            if (deps["next"]) techSet.add("Next.js");
            if (deps["react"]) techSet.add("React");
            if (deps["vue"]) techSet.add("Vue");
            if (deps["@angular/core"]) techSet.add("Angular");
            if (deps["svelte"]) techSet.add("Svelte");
            if (deps["express"]) techSet.add("Express");
            if (deps["@nestjs/core"]) techSet.add("Nest.js");
            if (deps["prisma"] || deps["@prisma/client"]) techSet.add("Prisma ORM");
            if (deps["mongoose"] || deps["mongodb"]) techSet.add("MongoDB");
            if (deps["pg"]) techSet.add("PostgreSQL");
            if (deps["mysql"] || deps["mysql2"]) techSet.add("MySQL");
            if (deps["sqlite3"] || deps["better-sqlite3"]) techSet.add("SQLite");
            if (deps["firebase"] || deps["firebase-admin"]) techSet.add("Firebase");
            if (deps["redis"] || deps["ioredis"]) techSet.add("Redis");
        } catch (e) { }
    }

    const reqTxtPath = path.join(targetDir, "requirements.txt");
    const pyprojectPath = path.join(targetDir, "pyproject.toml");
    if (fs.existsSync(reqTxtPath) || fs.existsSync(pyprojectPath)) {
        techSet.add("Python");
        const pyContent = (fs.existsSync(reqTxtPath) ? fs.readFileSync(reqTxtPath, "utf-8") : "") +
            (fs.existsSync(pyprojectPath) ? fs.readFileSync(pyprojectPath, "utf-8") : "");

        const lowerPy = pyContent.toLowerCase();
        if (lowerPy.includes("django")) techSet.add("Django");
        if (lowerPy.includes("flask")) techSet.add("Flask");
        if (lowerPy.includes("fastapi")) techSet.add("FastAPI");
        if (lowerPy.includes("sqlalchemy")) techSet.add("SQLAlchemy");
        if (lowerPy.includes("psycopg2")) techSet.add("PostgreSQL");
        if (lowerPy.includes("pymongo")) techSet.add("MongoDB");
    }

    const pomXmlPath = path.join(targetDir, "pom.xml");
    const gradlePath = path.join(targetDir, "build.gradle");
    if (fs.existsSync(pomXmlPath) || fs.existsSync(gradlePath)) {
        techSet.add("Java");
        const jContent = (fs.existsSync(pomXmlPath) ? fs.readFileSync(pomXmlPath, "utf-8") : "") +
            (fs.existsSync(gradlePath) ? fs.readFileSync(gradlePath, "utf-8") : "");
        if (jContent.includes("spring-boot")) techSet.add("Spring Boot");
    }

    const goModPath = path.join(targetDir, "go.mod");
    if (fs.existsSync(goModPath)) {
        techSet.add("Go");
        const goContent = fs.readFileSync(goModPath, "utf-8");
        if (goContent.includes("github.com/gin-gonic/gin")) techSet.add("Gin");
        if (goContent.includes("github.com/gofiber/fiber")) techSet.add("Fiber");
    }

    const cargoPath = path.join(targetDir, "Cargo.toml");
    if (fs.existsSync(cargoPath)) techSet.add("Rust");

    const pubspecPath = path.join(targetDir, "pubspec.yaml");
    if (fs.existsSync(pubspecPath)) {
        techSet.add("Dart");
        const pubContent = fs.readFileSync(pubspecPath, "utf-8");
        if (pubContent.includes("flutter:")) techSet.add("Flutter");
    }

    const composerPath = path.join(targetDir, "composer.json");
    if (fs.existsSync(composerPath)) {
        techSet.add("PHP");
        const compContent = fs.readFileSync(composerPath, "utf-8");
        if (compContent.includes("laravel/framework")) techSet.add("Laravel");
    }

    const gemfilePath = path.join(targetDir, "Gemfile");
    if (fs.existsSync(gemfilePath)) {
        techSet.add("Ruby");
        const gemContent = fs.readFileSync(gemfilePath, "utf-8");
        if (gemContent.includes("rails")) techSet.add("Rails");
    }

    return Array.from(techSet);
}

// Detect project entry point based ONLY on actual evidence
function detectProjectEntryPoint(
    targetDir: string,
    scannedModules: ScannedModule[],
    technologies: string[]
): { entryPath: string | null; evidence: string } {

    // 1. Node.js package.json main or script entry
    const pkgJsonPath = path.join(targetDir, "package.json");
    if (fs.existsSync(pkgJsonPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
            if (pkg.main && fs.existsSync(path.join(targetDir, pkg.main))) {
                const rel = path.relative(targetDir, path.join(targetDir, pkg.main)).replace(/\\/g, "/");
                return { entryPath: rel, evidence: `Declared as "main" in package.json (${pkg.main})` };
            }
        } catch (e) { }
    }

    // 2. Next.js entry point check (only if Next.js is detected!)
    if (technologies.includes("Next.js")) {
        const nextAppPage = scannedModules.find((m) => m.filePath === "src/app/page.tsx" || m.filePath === "app/page.tsx" || m.filePath === "src/app/page.jsx" || m.filePath === "app/page.jsx");
        if (nextAppPage) {
            return { entryPath: nextAppPage.filePath, evidence: "Next.js App Router root page component" };
        }
        const nextPagesIndex = scannedModules.find((m) => m.filePath === "pages/index.tsx" || m.filePath === "src/pages/index.tsx" || m.filePath === "pages/index.js");
        if (nextPagesIndex) {
            return { entryPath: nextPagesIndex.filePath, evidence: "Next.js Pages Router root page component" };
        }
    }

    // 3. Go entry point check
    if (technologies.includes("Go")) {
        const goMain = scannedModules.find((m) => m.fileName === "main.go");
        if (goMain) {
            return { entryPath: goMain.filePath, evidence: "Go package main entry file (main.go)" };
        }
    }

    // 4. Flutter entry point check
    if (technologies.includes("Flutter") || technologies.includes("Dart")) {
        const dartMain = scannedModules.find((m) => m.filePath === "lib/main.dart");
        if (dartMain) {
            return { entryPath: dartMain.filePath, evidence: "Flutter application entry file (lib/main.dart)" };
        }
    }

    // 5. Rust entry point check
    if (technologies.includes("Rust")) {
        const rustMain = scannedModules.find((m) => m.filePath === "src/main.rs");
        if (rustMain) {
            return { entryPath: rustMain.filePath, evidence: "Rust crate root binary entry (src/main.rs)" };
        }
    }

    // 6. Python entry point check
    if (technologies.includes("Python")) {
        const pyCandidates = ["app.py", "main.py", "wsgi.py", "manage.py", "server.py", "run.py"];
        for (const cand of pyCandidates) {
            const found = scannedModules.find((m) => m.fileName.toLowerCase() === cand);
            if (found) {
                return { entryPath: found.filePath, evidence: `Python application entry script (${found.fileName})` };
            }
        }
    }

    // 7. Java entry point check
    if (technologies.includes("Java")) {
        const javaMain = scannedModules.find((m) => {
            if (m.fileType !== "file" || !m.fileName.endsWith(".java")) return false;
            return (m.codeContent || "").includes("public static void main") || (m.codeContent || "").includes("@SpringBootApplication");
        });
        if (javaMain) {
            return { entryPath: javaMain.filePath, evidence: `Java main method / SpringBoot entry class (${javaMain.fileName})` };
        }
    }

    // 8. General convention entry points (index.js, index.ts, app.js, app.ts, server.js, server.ts, main.js, main.ts)
    const conventionNames = ["index.ts", "index.js", "app.ts", "app.js", "server.ts", "server.js", "main.ts", "main.js", "index.html"];
    for (const conv of conventionNames) {
        const found = scannedModules.find((m) => m.fileName.toLowerCase() === conv);
        if (found) {
            return { entryPath: found.filePath, evidence: `Standard convention entry file (${found.fileName})` };
        }
    }

    return {
        entryPath: null,
        evidence: "Entry point could not be determined from the available project files.",
    };
}

export async function scanDirectory(targetDir: string): Promise<ScanResult> {
    if (!fs.existsSync(targetDir)) {
        throw new Error(`Directory does not exist: ${targetDir}`);
    }

    const repoName = path.basename(targetDir);
    const modules: ScannedModule[] = [];

    // Initialize ts-morph project singleton for TS/JS parsing
    const project = new Project();

    // Helper to recursively walk directory tree
    function walk(currentPath: string) {
        const stat = fs.statSync(currentPath);

        if (stat.isDirectory()) {
            const dirName = path.basename(currentPath);

            // Avoid scanning node_modules, .git, etc.
            if (
                [
                    "node_modules", ".git", ".next", "dist", "build", "coverage",
                    "target", "venv", ".venv", "__pycache__", ".gemini", ".idea",
                    ".vscode", "bin", "obj", ".dart_tool", "node_modules_old"
                ].includes(dirName)
            ) {
                return;
            }

            const relativeDirPath = path.relative(targetDir, currentPath).replace(/\\/g, "/");
            if (relativeDirPath) {
                modules.push({
                    filePath: relativeDirPath,
                    fileName: dirName,
                    fileType: "directory",
                    summary: `Directory: Contains child elements of /${dirName}.`,
                    functions: [],
                    startingPoint: false,
                    category: "directory",
                });
            }

            const files = fs.readdirSync(currentPath);
            for (const file of files) {
                walk(path.join(currentPath, file));
            }
        } else {
            const fileName = path.basename(currentPath);
            const ext = path.extname(currentPath).toLowerCase();

            // Ignore sensitive files
            const lowerName = fileName.toLowerCase();
            if (
                lowerName.startsWith(".env") ||
                lowerName.endsWith(".pem") ||
                lowerName.endsWith(".key") ||
                lowerName === "credentials" ||
                lowerName === "secrets"
            ) {
                return;
            }

            const relativeFilePath = path.relative(targetDir, currentPath).replace(/\\/g, "/");
            const language = detectFileLanguage(ext, fileName);
            const category = detectFileCategory(relativeFilePath, fileName, language);

            let codeContent: string | undefined = undefined;
            let functions: ScannedFunction[] = [];
            let imports: string[] = [];

            try {
                // Read text/source files
                const buffer = fs.readFileSync(currentPath);
                // Check if file is binary (contains null bytes)
                const isBinary = buffer.subarray(0, 512).includes(0);

                if (!isBinary) {
                    codeContent = buffer.toString("utf-8");

                    // Extract functions and imports if code-like
                    if (codeContent.length > 0) {
                        const metadata = extractCodeMetadata(currentPath, ext, codeContent, project);
                        functions = metadata.functions;
                        imports = metadata.imports;
                    }
                }
            } catch (err) {
                console.error(`Failed reading module ${relativeFilePath}:`, err);
            }

            // Generate evidence-based file summary
            let summary = `${language} ${category} file.`;
            if (category === "configuration") {
                summary = `Configuration manifest (${fileName}). Defines project dependencies or environment settings.`;
            } else if (category === "documentation") {
                summary = `Documentation file (${fileName}) providing project guides or references.`;
            } else if (category === "database-related") {
                summary = `Database module (${fileName}) defining data models or query structures.`;
            } else if (functions.length > 0) {
                summary = `${language} source module (${fileName}) containing ${functions.length} detected function/method declaration(s).`;
            }

            modules.push({
                filePath: relativeFilePath,
                fileName,
                fileType: "file",
                summary,
                codeContent: codeContent
                    ? codeContent.length < 5000
                        ? codeContent
                        : codeContent.substring(0, 5000) + "\n// ... truncated"
                    : undefined,
                functions,
                startingPoint: false,
                language,
                category,
                imports: imports.length > 0 ? Array.from(new Set(imports)) : undefined,
            });
        }
    }

    walk(targetDir);

    // 1. Detect technologies dynamically based on evidence
    const detectedTechnologies = detectProjectTechnologies(targetDir, modules);

    // 2. Detect entry point dynamically based on evidence
    const { entryPath, evidence: entryEvidence } = detectProjectEntryPoint(targetDir, modules, detectedTechnologies);

    // Mark starting point on module if detected
    if (entryPath) {
        const entryMod = modules.find((m) => m.filePath === entryPath);
        if (entryMod) {
            entryMod.startingPoint = true;
        }
    }

    // 3. Analyze project understanding & workflows dynamically
    const understanding = analyzeProjectUnderstanding(modules, detectedTechnologies, entryPath, entryEvidence);

    // 4. Enrich file module summaries with rich 4–6 sentence explanations
    modules.forEach((mod) => {
        if (mod.fileType === "file") {
            const richExp = generateRichFileExplanation(
                mod,
                modules,
                understanding.dependencies,
                understanding.apiRoutes,
                understanding.database,
                understanding.authentication
            );
            mod.summary = richExp.explanation;
        }
    });

    return {
        repoName,
        architecture: understanding.summary.architectureText,
        dataFlow: understanding.summary.dataFlowText,
        authFlow: understanding.summary.authFlowText,
        apiSummary: understanding.summary.apiSummaryText,
        modules,
        detectedTechnologies,
        detectedEntryPoint: entryPath,
        understanding,
    };
}
