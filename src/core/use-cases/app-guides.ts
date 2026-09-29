export interface ApplicationGuideData {
    appName: string;
    normalizedName: string;
    category: string;
    tagline: string;
    overview: {
        whatItIs: string;
        whatItIsUsedFor: string;
        whoUsesIt: string;
        mainPurpose: string;
    };
    coreFeatures: Array<{
        id: string;
        name: string;
        description: string;
        whyUseful: string;
        howToUse: string;
    }>;
    usefulFeatures: Array<{
        id: string;
        name: string;
        category: "Advanced" | "Productivity" | "Shortcut" | "Automation" | "Integration" | "Template";
        description: string;
        whyUseful: string;
        howToUse: string;
    }>;
    learningPath: Array<{
        id: string;
        stage: "Beginner" | "Core Features" | "Productivity" | "Advanced" | "Practical Workflows";
        title: string;
        explanation: string;
        practicalActivity: string;
    }>;
    tutorials: Array<{
        id: string;
        title: string;
        goal: string;
        steps: string[];
        expectedResult: string;
        usefulTip: string;
    }>;
    shortcuts: Array<{
        id: string;
        keyCombination: string;
        action: string;
        description: string;
    }>;
    commonMistakes: Array<{
        id: string;
        mistake: string;
        whyItHappens: string;
        howToAvoid: string;
    }>;
    realWorldUseCases: Array<{
        id: string;
        userRole: string;
        scenario: string;
        outcome: string;
    }>;
    whatToLearnNext: string[];
    sources: Array<{
        title: string;
        url: string;
        type: "Official Docs" | "Official Site" | "Learning Resource";
    }>;
}

// Validation helper for unknown/gibberish applications
export function isIdentifiableApplication(input: string): boolean {
    const trimmed = input.trim();
    if (!trimmed || trimmed.length < 2) return false;
    
    // Check if input is purely random non-alphanumeric noise or gibberish (e.g. "asdfghjkl", "123456", "???")
    if (/^[^a-zA-Z0-9]+$/.test(trimmed)) return false;
    if (trimmed.length > 8 && /^([bcdfghjklmnpqrstvwxyz]{7,}|[aeiou]{7,})$/i.test(trimmed)) return false;

    return true;
}

// Standardized curated profiles for popular applications to ensure rich, accurate details
const CURATED_GUIDES: Record<string, Partial<ApplicationGuideData>> = {
    "microsoft word": {
        appName: "Microsoft Word",
        category: "Document Processing & Office Productivity",
        tagline: "Industry-standard word processor for documents, reports, and publishing.",
        overview: {
            whatItIs: "Microsoft Word is a full-featured word processing program developed by Microsoft, designed for creating, editing, formatting, and sharing documents.",
            whatItIsUsedFor: "Used for drafting essays, business reports, resumes, academic papers, letters, and team-collaborative documentation.",
            whoUsesIt: "Students, office workers, legal professionals, technical writers, executives, and educators worldwide.",
            mainPurpose: "Provide a comprehensive layout and typography engine to produce professional digital and printed documents efficiently."
        },
        coreFeatures: [
            {
                id: "word-feat-1",
                name: "Styles & Hierarchy (Heading 1, 2, 3)",
                description: "Structured paragraph and character styling engine.",
                whyUseful: "Ensures consistent document formatting and auto-generates Tables of Contents in one click.",
                howToUse: "Select text → Click 'Heading 1' or 'Heading 2' in the Home ribbon tab."
            },
            {
                id: "word-feat-2",
                name: "Track Changes & Inline Comments",
                description: "Collaborative editing and review suite.",
                whyUseful: "Allows reviewers to suggest edits, leave comments, and view revision history without overwriting original content.",
                howToUse: "Go to Review tab → Toggle 'Track Changes' on before making edits."
            },
            {
                id: "word-feat-3",
                name: "Mail Merge & Automated Documents",
                description: "Data-driven document generation from Excel or Outlook lists.",
                whyUseful: "Generates personalized letters, certificates, or envelopes for hundreds of recipients automatically.",
                howToUse: "Mailings tab → Start Mail Merge → Select Recipients from an Excel sheet."
            },
            {
                id: "word-feat-4",
                name: "Automated Table of Contents & Cross-References",
                description: "Dynamic document navigation and reference generation.",
                whyUseful: "Keep page numbers accurate automatically when content changes in long reports.",
                howToUse: "References tab → Click 'Table of Contents' → Choose a built-in style."
            }
        ],
        usefulFeatures: [
            {
                id: "word-adv-1",
                name: "Quick Parts & Building Blocks",
                category: "Automation",
                description: "Save reusable snippets of text, logos, headers, or disclaimer blocks.",
                whyUseful: "Eliminates repetitive copy-pasting for standard contract clauses or header formats.",
                howToUse: "Select text → Insert tab → Quick Parts → Save Selection to Quick Part Gallery."
            },
            {
                id: "word-adv-2",
                name: "Navigation Pane & Section Breaks",
                category: "Productivity",
                description: "Outline view and independent page numbering/orientation sections.",
                whyUseful: "Mix portrait and landscape pages in the same document and rearrange chapters by dragging headings.",
                howToUse: "View tab → Check 'Navigation Pane'. Layout tab → Breaks → Section Breaks (Next Page)."
            },
            {
                id: "word-adv-3",
                name: "Keyboard Navigation & AutoCorrect Expansion",
                category: "Shortcut",
                description: "Custom text replacement shortcuts (e.g. typing ';sig' expands into full email signature).",
                whyUseful: "Accelerates typing speed and enforces error-free standard text.",
                howToUse: "File → Options → Proofing → AutoCorrect Options."
            }
        ],
        learningPath: [
            {
                id: "word-lp-1",
                stage: "Beginner",
                title: "Document Basics & Text Formatting",
                explanation: "Learn basic text input, font choices, margins, line spacing, and paragraph alignment.",
                practicalActivity: "Create a 1-page cover letter, set 1-inch margins, and format font sizes consistently."
            },
            {
                id: "word-lp-2",
                stage: "Core Features",
                title: "Styles, Headings & Table of Contents",
                explanation: "Master document hierarchy using Heading 1/2 styles to structure long documents.",
                practicalActivity: "Draft a 3-page report with 4 sub-sections using Headings, then insert an automated Table of Contents."
            },
            {
                id: "word-lp-3",
                stage: "Productivity",
                title: "Collaboration & Track Changes",
                explanation: "Learn how to leave comments, review edits, accept/reject changes, and compare document versions.",
                practicalActivity: "Enable Track Changes, make 5 revisions on a sample agreement, and add 2 review comments."
            },
            {
                id: "word-lp-4",
                stage: "Advanced",
                title: "Section Breaks & Header Customization",
                explanation: "Create complex multi-section reports with landscape tables and un-linked headers.",
                practicalActivity: "Insert a Next-Page Section Break to make Page 3 landscape while keeping Pages 1-2 portrait."
            },
            {
                id: "word-lp-5",
                stage: "Practical Workflows",
                title: "Automated Templates & Quick Parts",
                explanation: "Build professional corporate templates with locked fillable forms and Quick Parts.",
                practicalActivity: "Save a standardized invoice template with Quick Part disclaimer blocks."
            }
        ],
        tutorials: [
            {
                id: "word-tut-1",
                title: "Create an Auto-Updating Table of Contents",
                goal: "Generate a professional Table of Contents that updates page numbers automatically.",
                steps: [
                    "Apply 'Heading 1' to main section titles and 'Heading 2' to sub-sections.",
                    "Place the cursor on the blank first page of your document.",
                    "Click the 'References' tab on the top ribbon.",
                    "Select 'Table of Contents' and click 'Automatic Table 1'.",
                    "Right-click the generated table anytime to click 'Update Field' -> 'Update Entire Table'."
                ],
                expectedResult: "A clean, aligned Table of Contents with clickable links and accurate page numbers.",
                usefulTip: "Never manually type dot leaders or page numbers—always use Headings and automated TOC."
            },
            {
                id: "word-tut-2",
                title: "Unlink Headers Between Sections",
                goal: "Set up different headers or page numbering formats in separate parts of a document.",
                steps: [
                    "Click at the end of Chapter 1.",
                    "Go to Layout → Breaks → Section Breaks (Next Page).",
                    "Double-click the header area on Chapter 2.",
                    "In the Header & Footer tab, click 'Link to Previous' to turn it off.",
                    "Type the new Chapter 2 header title without modifying Chapter 1."
                ],
                expectedResult: "Chapter 1 and Chapter 2 display completely independent header titles.",
                usefulTip: "Remember to turn off 'Link to Previous' in both Header AND Footer if you want independent footers."
            }
        ],
        shortcuts: [
            { id: "word-sc-1", keyCombination: "Ctrl + Shift + N", action: "Apply Normal Style", description: "Resets selected text back to body paragraph formatting." },
            { id: "word-sc-2", keyCombination: "Ctrl + Alt + 1", action: "Apply Heading 1", description: "Instantly formats selected line as a primary heading." },
            { id: "word-sc-3", keyCombination: "Ctrl + Enter", action: "Insert Page Break", description: "Starts a new page immediately without spamming Enter." },
            { id: "word-sc-4", keyCombination: "Shift + F3", action: "Toggle Case", description: "Cycles selected text between LOWERCASE, UPPERCASE, and Title Case." }
        ],
        commonMistakes: [
            {
                id: "word-cm-1",
                mistake: "Pressing Enter repeatedly to push text to the next page",
                whyItHappens: "Beginners use extra blank lines to force page boundaries.",
                howToAvoid: "Use Ctrl + Enter (Page Break) so content stays on the next page regardless of edits above."
            },
            {
                id: "word-cm-2",
                mistake: "Manually formatting title text instead of using Styles",
                whyItHappens: "Directly adjusting font size/boldness without using Heading styles.",
                howToAvoid: "Always select Heading 1/2 from the Styles pane. Modify the style directly to change appearance globally."
            }
        ],
        realWorldUseCases: [
            {
                id: "word-uc-1",
                userRole: "Project Manager",
                scenario: "Compiling a 50-page project proposal with input from 4 engineering leads.",
                outcome: "Uses Track Changes to merge feedback and Navigation Pane to reorder chapters seamlessly."
            },
            {
                id: "word-uc-2",
                userRole: "HR Specialist",
                scenario: "Sending tailored offer letters to 30 new hires.",
                outcome: "Uses Mail Merge connected to an Excel sheet to generate 30 custom PDFs in under 2 minutes."
            }
        ],
        whatToLearnNext: [
            "Advanced Word Mail Merge with conditional logic rules",
            "Building fillable form templates with content controls",
            "Integrating Word with Microsoft Excel for dynamic report linking"
        ],
        sources: [
            { title: "Microsoft Word Official Support & Documentation", url: "https://support.microsoft.com/word", type: "Official Docs" },
            { title: "Microsoft Learn Word Training Hub", url: "https://learn.microsoft.com/office/", type: "Learning Resource" }
        ]
    },

    "canva": {
        appName: "Canva",
        category: "Graphic Design & Visual Content Creation",
        tagline: "Online drag-and-drop graphic design platform for social graphics, presentations, and branding.",
        overview: {
            whatItIs: "Canva is a cloud-based design tool that enables users to create social media graphics, presentations, posters, videos, and marketing collateral using intuitive drag-and-drop templates.",
            whatItIsUsedFor: "Designing Instagram posts, pitch decks, YouTube thumbnails, infographics, brand kits, and print materials.",
            whoUsesIt: "Marketers, small business owners, social media managers, educators, students, and content creators.",
            mainPurpose: "Democratize visual design by providing accessible tools, professional templates, and stock media assets without requiring complex design software skills."
        },
        coreFeatures: [
            {
                id: "canva-feat-1",
                name: "Drag-and-Drop Editor & Element Library",
                description: "Intuitive canvas interface with millions of graphics, vectors, photos, and fonts.",
                whyUseful: "Build visual graphics in minutes by dragging icons, text boxes, and photos onto artboards.",
                howToUse: "Click Elements on the left sidebar → Search for items → Drag onto your design canvas."
            },
            {
                id: "canva-feat-2",
                name: "Brand Kit & Global Style Palette",
                description: "Central store for brand logos, color palettes, and brand typography.",
                whyUseful: "Enforces visual consistency across all team designs with one-click color applying.",
                howToUse: "Brand Hub on side menu → Upload logos and define brand hex colors → Apply via Styles tab."
            },
            {
                id: "canva-feat-3",
                name: "Magic Resize & Multi-Format Export",
                description: "Instant aspect ratio transformation tool.",
                whyUseful: "Convert an Instagram post (1080x1080) into a Story (1080x1920) or presentation slide instantly.",
                howToUse: "Click 'Resize & Magic Switch' top bar → Select target dimensions → Resize."
            },
            {
                id: "canva-feat-4",
                name: "Interactive Presentations & Recording",
                description: "Built-in presenter mode with live Q&A and video avatar recording.",
                whyUseful: "Present slides directly from the browser or record narrated pitch decks.",
                howToUse: "Click Present button in top right → Choose Presenter View or Record yourself."
            }
        ],
        usefulFeatures: [
            {
                id: "canva-adv-1",
                name: "Frames & Grid Layout Containers",
                category: "Productivity",
                description: "Special graphic shapes that auto-crop and clip images dropped into them.",
                whyUseful: "Instantly turn photos into circles, phone mockups, or custom geometric shapes.",
                howToUse: "Search 'Frames' under Elements → Drag a frame onto canvas → Drag photo inside frame."
            },
            {
                id: "canva-adv-2",
                name: "Tidy Up & Alignment Grid Tools",
                category: "Shortcut",
                description: "Automatic element spacing and alignment engine.",
                whyUseful: "Fix uneven spacing between icons or text cards in one click.",
                howToUse: "Select multiple objects → Position tab → Click 'Tidy Up'."
            },
            {
                id: "canva-adv-3",
                name: "Content Planner & Direct Social Scheduling",
                category: "Automation",
                description: "Built-in social media calendar and auto-publishing tool.",
                whyUseful: "Schedule graphics directly to LinkedIn, Instagram, and Twitter without third-party tools.",
                howToUse: "Share → Schedule → Pick date, time, and target social media profile."
            }
        ],
        learningPath: [
            {
                id: "canva-lp-1",
                stage: "Beginner",
                title: "Canvas Navigation & Template Selection",
                explanation: "Understand document dimensions, template search, text editing, and basic exports.",
                practicalActivity: "Select a Social Media template, replace background photo, and edit text titles."
            },
            {
                id: "canva-lp-2",
                stage: "Core Features",
                title: "Frames, Grids & Asset Customization",
                explanation: "Master frames, color drop tools, transparent PNG overlays, and element layering.",
                practicalActivity: "Design a promo banner with 3 image frames, customized brand hex colors, and layered text shadows."
            },
            {
                id: "canva-lp-3",
                stage: "Productivity",
                title: "Brand Kit Setup & Style Syncing",
                explanation: "Configure team brand kits for font pairing and automated palette matching.",
                practicalActivity: "Create a Brand Kit with 3 hex codes and apply it to a multi-page carousel."
            },
            {
                id: "canva-lp-4",
                stage: "Advanced",
                title: "Video Animation & Magic Studio Tools",
                explanation: "Use page transitions, element animations, background removers, and Magic Edit.",
                practicalActivity: "Animate a 15-second promo reel with page transitions and animated text pop-ups."
            },
            {
                id: "canva-lp-5",
                stage: "Practical Workflows",
                title: "Team Collaboration & Content Scheduling",
                explanation: "Share editable template links and schedule content calendars for client publishing.",
                practicalActivity: "Create a 5-slide pitch deck and set up a social media publishing schedule."
            }
        ],
        tutorials: [
            {
                id: "canva-tut-1",
                title: "Create a Custom Image Frame Mask",
                goal: "Clip an image cleanly into a circle or device mockup shape.",
                steps: [
                    "Open your design canvas.",
                    "Go to the 'Elements' tab on the left sidebar.",
                    "Scroll down or search for 'Frames'. Select a frame shape (e.g. Phone frame or Circle).",
                    "Go to Uploads or Photos tab, drag your image directly over the frame.",
                    "Double-click the frame to adjust photo position or zoom."
                ],
                expectedResult: "The image is perfectly clipped inside the selected frame shape.",
                usefulTip: "Hold Shift while moving an element to lock horizontal or vertical alignment."
            }
        ],
        shortcuts: [
            { id: "canva-sc-1", keyCombination: "T", action: "Add Text Box", description: "Instantly drops a new text element onto the active canvas." },
            { id: "canva-sc-2", keyCombination: "R", action: "Add Rectangle", description: "Adds a customizable rectangle shape." },
            { id: "canva-sc-3", keyCombination: "C", action: "Add Circle", description: "Adds a customizable circle vector." },
            { id: "canva-sc-4", keyCombination: "Ctrl + ]", action: "Bring Forward", description: "Moves the selected layer up one position." }
        ],
        commonMistakes: [
            {
                id: "canva-cm-1",
                mistake: "Overcrowding canvas with too many competing fonts and stock vectors",
                whyItHappens: "Access to thousands of free elements leads to visual clutter.",
                howToAvoid: "Limit design to max 2 font families and use negative space to highlight primary text."
            }
        ],
        realWorldUseCases: [
            {
                id: "canva-uc-1",
                userRole: "Marketing Coordinator",
                scenario: "Creating a week's worth of LinkedIn carousel posts and promo graphics.",
                outcome: "Uses Brand Kit to build 5 on-brand graphics in 30 minutes and schedules them directly."
            }
        ],
        whatToLearnNext: [
            "Canva Magic Studio AI tools for image expansion and background replacement",
            "Building interactive web landing pages directly inside Canva"
        ],
        sources: [
            { title: "Canva Help Center & Tutorials", url: "https://help.canva.com", type: "Official Docs" },
            { title: "Canva Design School", url: "https://www.canva.com/designschool/", type: "Learning Resource" }
        ]
    },

    "power bi": {
        appName: "Power BI",
        category: "Business Intelligence & Data Visualization",
        tagline: "Microsoft interactive data visualization and business intelligence dashboard engine.",
        overview: {
            whatItIs: "Power BI is an enterprise analytics suite by Microsoft that transforms disparate data sources into coherent, visually immersive, and interactive reports and dashboards.",
            whatItIsUsedFor: "Building executive dashboards, financial reporting models, sales performance tracking, and automated ETL pipelines.",
            whoUsesIt: "Data analysts, BI developers, financial analysts, operations managers, and C-suite executives.",
            mainPurpose: "Enable data-driven decision making by connecting to relational databases, Excel, cloud APIs, and rendering real-time business insights."
        },
        coreFeatures: [
            {
                id: "pbi-feat-1",
                name: "Power Query Editor (ETL Engine)",
                description: "Data transformation and cleaning pipeline module.",
                whyUseful: "Clean, filter, unpivot, and merge raw data from Excel, SQL, or web endpoints before building visuals.",
                howToUse: "Home tab → Transform Data → Opens Power Query Editor window."
            },
            {
                id: "pbi-feat-2",
                name: "Data Modeling & Relationship Canvas",
                description: "Star-schema relationship management between tables.",
                whyUseful: "Connect Sales, Customers, and Products tables via primary/foreign key relationships (1-to-many).",
                howToUse: "Click Model View icon on left sidebar → Drag keys between tables to build relationships."
            },
            {
                id: "pbi-feat-3",
                name: "DAX (Data Analysis Expressions)",
                description: "Formula expression language for dynamic calculated measures and columns.",
                whyUseful: "Calculate time-intelligence metrics like Year-Over-Year Growth or Rolling 30-Day Sales dynamically.",
                howToUse: "Right-click data table → New Measure → Write DAX formula (e.g. `Total Revenue = SUM(Sales[Amount])`)."
            },
            {
                id: "pbi-feat-4",
                name: "Interactive Visualizations & Slicers",
                description: "Cross-filtering bar charts, matrix tables, maps, and slicers.",
                whyUseful: "Clicking a bar in one chart instantly filters all other charts on the report page.",
                howToUse: "Select visual from Visualizations pane → Drag fields into Axis, Legend, and Values wells."
            }
        ],
        usefulFeatures: [
            {
                id: "pbi-adv-1",
                name: "Time Intelligence DAX Functions",
                category: "Advanced",
                description: "Pre-built DAX capabilities (`SAMEPERIODLASTYEAR`, `TOTALYTD`).",
                whyUseful: "Compare current period revenues against previous year automatically without manual date math.",
                howToUse: "Measure syntax: `YoY Sales = CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Calendar'[Date]))`."
            },
            {
                id: "pbi-adv-2",
                name: "Row-Level Security (RLS)",
                category: "Automation",
                description: "Security filters restricting data access based on user role.",
                whyUseful: "Ensure Regional Manager A only sees Region A data in the exact same shared report.",
                howToUse: "Modeling tab → Manage Roles → Define DAX filter rules per role."
            },
            {
                id: "pbi-adv-3",
                name: "Drill-Through Pages & Tooltip Cards",
                category: "Productivity",
                description: "Contextual detail pages triggered by right-clicking a high-level summary visual.",
                whyUseful: "Keep reports clean while providing instant deep-dive details on demand.",
                howToUse: "Create target page → Drag drill-through filter field into Drill-through section in Visualizations pane."
            }
        ],
        learningPath: [
            {
                id: "pbi-lp-1",
                stage: "Beginner",
                title: "Data Import & Power Query Basics",
                explanation: "Connect to Excel/CSV files, change data types, split columns, and remove null rows.",
                practicalActivity: "Import a raw sales CSV file into Power Query, promote headers, and fix date column types."
            },
            {
                id: "pbi-lp-2",
                stage: "Core Features",
                title: "Data Modeling & Star Schema",
                explanation: "Create active relationships between FactSales and DimCustomer / DimDate dimension tables.",
                practicalActivity: "Build a 1-to-many relationship model connecting Sales, Dates, and Products."
            },
            {
                id: "pbi-lp-3",
                stage: "Productivity",
                title: "DAX Measures vs Calculated Columns",
                explanation: "Learn when to write dynamic aggregated Measures using CALCULATE, SUM, and FILTER.",
                practicalActivity: "Write measures for `Total Sales`, `Total Units Sold`, and `Average Order Value`."
            },
            {
                id: "pbi-lp-4",
                stage: "Advanced",
                title: "Time Intelligence & Dynamic Matrix Reporting",
                explanation: "Build YTD, QTD, and YoY comparison measures using a dedicated Date Dimension table.",
                practicalActivity: "Write a YoY Sales Growth % measure and display it in a Matrix visual with slicers."
            },
            {
                id: "pbi-lp-5",
                stage: "Practical Workflows",
                title: "Publishing & Power BI Service Workspaces",
                explanation: "Publish Desktop reports to Power BI Service, configure scheduled refresh, and set up RLS.",
                practicalActivity: "Publish report to workspace and set up automated daily refresh gateway."
            }
        ],
        tutorials: [
            {
                id: "pbi-tut-1",
                title: "Build a Dynamic Year-Over-Year DAX Measure",
                goal: "Calculate percentage sales growth comparing this year to last year dynamically.",
                steps: [
                    "Ensure you have a dedicated 'DateTable' marked as a Date Table.",
                    "Create base measure: `Total Sales = SUM(Sales[Revenue])`.",
                    "Create PY measure: `Sales PY = CALCULATE([Total Sales], SAMEPERIODLASTYEAR('DateTable'[Date]))`.",
                    "Create YoY % measure: `YoY Growth % = DIVIDE([Total Sales] - [Sales PY], [Sales PY], 0)`.",
                    "Add YoY Growth % measure to a KPI card visual formatted as Percentage."
                ],
                expectedResult: "The card displays accurate YoY growth % that updates based on selected date slicer filters.",
                usefulTip: "Always use `DIVIDE(num, denom, 0)` instead of `/` operator to safely avoid divide-by-zero errors."
            }
        ],
        shortcuts: [
            { id: "pbi-sc-1", keyCombination: "Ctrl + Shift + L", action: "Toggle Field List Pane", description: "Expands or collapses the data fields pane." },
            { id: "pbi-sc-2", keyCombination: "Ctrl + Alt + G", action: "Group Visuals", description: "Groups selected charts together for synchronized moving." }
        ],
        commonMistakes: [
            {
                id: "pbi-cm-1",
                mistake: "Creating calculated columns instead of measures for aggregated math",
                whyItHappens: "Beginners coming from Excel create extra columns in tables.",
                howToAvoid: "Use Measures for dynamic aggregations—they save RAM and re-calculate dynamically based on slicers."
            }
        ],
        realWorldUseCases: [
            {
                id: "pbi-uc-1",
                userRole: "Financial Analyst",
                scenario: "Consolidating quarterly revenue reports across 12 international subsidiaries.",
                outcome: "Automates multi-currency conversions and produces interactive executive P&L dashboards."
            }
        ],
        whatToLearnNext: [
            "Advanced DAX Evaluation Contexts (Filter Context vs Row Context)",
            "Power BI Paginated Reports & Embedded Analytics API"
        ],
        sources: [
            { title: "Microsoft Power BI Official Documentation", url: "https://learn.microsoft.com/power-bi/", type: "Official Docs" },
            { title: "Microsoft Power BI Guidance & Best Practices", url: "https://learn.microsoft.com/power-bi/guidance/", type: "Learning Resource" }
        ]
    }
};

// Domain classification map to dynamically synthesize rich guides for ANY un-curated application
function classifyAppDomain(appName: string): {
    category: string;
    tagline: string;
    overview: {
        whatItIs: string;
        whatItIsUsedFor: string;
        whoUsesIt: string;
        mainPurpose: string;
    };
    coreFeatures: Array<{ id: string; name: string; description: string; whyUseful: string; howToUse: string }>;
    usefulFeatures: Array<{ id: string; name: string; category: "Advanced" | "Productivity" | "Shortcut" | "Automation" | "Integration" | "Template"; description: string; whyUseful: string; howToUse: string }>;
    learningPath: Array<{ id: string; stage: "Beginner" | "Core Features" | "Productivity" | "Advanced" | "Practical Workflows"; title: string; explanation: string; practicalActivity: string }>;
    tutorials: Array<{ id: string; title: string; goal: string; steps: string[]; expectedResult: string; usefulTip: string }>;
    shortcuts: Array<{ id: string; keyCombination: string; action: string; description: string }>;
    commonMistakes: Array<{ id: string; mistake: string; whyItHappens: string; howToAvoid: string }>;
    realWorldUseCases: Array<{ id: string; userRole: string; scenario: string; outcome: string }>;
    whatToLearnNext: string[];
    sources: Array<{ title: string; url: string; type: "Official Docs" | "Official Site" | "Learning Resource" }>;
} {
    const lower = appName.toLowerCase();

    // 1. Code Editors & IDEs (VS Code, IntelliJ, WebStorm, PyCharm, Eclipse, Xcode, Sublime Text, Vim, Neovim, Cursor, Zed)
    if (/(vscode|code|visual studio|intellij|webstorm|pycharm|eclipse|xcode|sublime|vim|neovim|cursor|zed|ide|editor)/.test(lower)) {
        return {
            category: "Developer Environment & Source Code Editing",
            tagline: `Essential software environment for writing, debugging, and refactoring source code in ${appName}.`,
            overview: {
                whatItIs: `${appName} is an advanced code editor and integrated development environment (IDE) built for writing, debugging, and building modern software.`,
                whatItIsUsedFor: "Used for editing source code, running build scripts, managing git repositories, and debugging software applications.",
                whoUsesIt: "Software developers, web engineers, system architects, DevOps engineers, and students.",
                mainPurpose: "Provide a fast, customizable environment with syntax highlighting, extensions, and debugging tools for efficient software development."
            },
            coreFeatures: [
                {
                    id: "gen-feat-1",
                    name: "Integrated Code Editor & Syntax Highlighting",
                    description: "Multi-language code completion, error linting, and structural formatting.",
                    whyUseful: "Identifies syntax bugs in real-time and formats code automatically on save.",
                    howToUse: "Open workspace folder → Open any file → Code with instant inline warnings."
                },
                {
                    id: "gen-feat-2",
                    name: "Integrated Terminal & Command Palette",
                    description: "Built-in shell command runner and action launcher.",
                    whyUseful: "Run build commands, test suites, and git operations without leaving the editor window.",
                    howToUse: "Press Ctrl + Shift + P (or Cmd + Shift + P) to open the Command Palette."
                },
                {
                    id: "gen-feat-3",
                    name: "Git & Version Control Panel",
                    description: "Source control diff viewer, branch switcher, and commit manager.",
                    whyUseful: "Inspect modified files, write commits, and resolve merge conflicts visually.",
                    howToUse: "Click Source Control tab on left sidebar → Stage changes → Click Commit."
                },
                {
                    id: "gen-feat-4",
                    name: "Interactive Debugger & Breakpoints",
                    description: "Runtime code execution stepper with call stack & variable inspection.",
                    whyUseful: "Step through execution line-by-line to catch logical state errors quickly.",
                    howToUse: "Click line gutter to drop a red breakpoint dot → Press F5 to start debugging session."
                }
            ],
            usefulFeatures: [
                {
                    id: "gen-adv-1",
                    name: "Extension Ecosystem & Custom Snippets",
                    category: "Automation",
                    description: "Install community extensions or write custom code expansion shortcuts.",
                    whyUseful: "Automates boilerplate setup and integrates linters like ESLint, Prettier, or Docker tools.",
                    howToUse: "Extensions icon → Search desired plugin → Click Install."
                },
                {
                    id: "gen-adv-2",
                    name: "Multi-Cursor & Column Selection",
                    category: "Shortcut",
                    description: "Edit dozens of matching variable occurrences across lines simultaneously.",
                    whyUseful: "Refactor repetitive lists or rename properties in seconds.",
                    howToUse: "Hold Alt (or Option) and click multiple places, or press Ctrl + D to select next match."
                }
            ],
            learningPath: [
                { id: "gen-lp-1", stage: "Beginner", title: "Workspace & File Navigation", explanation: `Set up ${appName}, configure font sizes, keybindings, and navigate workspace files efficiently.`, practicalActivity: "Open a sample project folder and use quick open to jump between files." },
                { id: "gen-lp-2", stage: "Core Features", title: "Editing, Linting & Formatting", explanation: "Master auto-formatting rules, linting configurations, and multi-cursor line edits.", practicalActivity: "Enable format-on-save and refactor 10 variables using multi-cursor selection." },
                { id: "gen-lp-3", stage: "Productivity", title: "Git Integration & Source Control", explanation: "Commit, push, switch branches, and review inline diffs directly inside the editor UI.", practicalActivity: "Create a feature branch, commit changes with detailed messages, and resolve a diff." },
                { id: "gen-lp-4", stage: "Advanced", title: "Breakpoints & Runtime Debugging", explanation: "Set conditional breakpoints, inspect scope variables, and trace stack execution.", practicalActivity: "Set a breakpoint on a function loop and step through 5 iterations." },
                { id: "gen-lp-5", stage: "Practical Workflows", title: "Workspace Snippets & Environment Tweaks", explanation: "Build reusable workspace task runners, custom launch configurations, and extension packs.", practicalActivity: "Write a custom code snippet for quick console logging or component boilerplates." }
            ],
            tutorials: [
                {
                    id: "gen-tut-1",
                    title: `Configure Auto-Format on Save in ${appName}`,
                    goal: "Ensure all files are automatically formatted according to project style guidelines whenever saved.",
                    steps: [
                        `Open ${appName} Settings (Ctrl + comma or Cmd + comma).`,
                        "Type 'Format On Save' in the search bar.",
                        "Check the box next to 'Editor: Format On Save'.",
                        "Select your preferred default formatter (e.g. Prettier or language default).",
                        "Save any file to test automatic code formatting."
                    ],
                    expectedResult: "Files reformat automatically into clean, standardized code layout upon saving.",
                    usefulTip: "Set up a workspace `.prettierrc` file so all team members format code identically."
                }
            ],
            shortcuts: [
                { id: "gen-sc-1", keyCombination: "Ctrl + P", action: "Quick Open File", description: "Search and open any file in workspace instantly by typing part of name." },
                { id: "gen-sc-2", keyCombination: "Ctrl + Shift + P", action: "Command Palette", description: "Access all available commands, settings, and tools." },
                { id: "gen-sc-3", keyCombination: "Ctrl + D", action: "Select Next Match", description: "Adds next matching string occurrence to multi-cursor selection." }
            ],
            commonMistakes: [
                { id: "gen-cm-1", mistake: "Manually typing repetitive boilerplate code", whyItHappens: "Not leveraging custom snippets or extension shortcuts.", howToAvoid: "Use snippet trigger words or extension shortcuts to output structural code instantly." }
            ],
            realWorldUseCases: [
                { id: "gen-uc-1", userRole: "Software Engineer", scenario: "Debugging an API integration error in a modern web app.", outcome: "Uses interactive breakpoint debugger to inspect payload JSON live." }
            ],
            whatToLearnNext: ["Building custom extension plugins", "Advanced multi-root workspace task configurations"],
            sources: [
                { title: `${appName} Official Website & Docs`, url: `https://google.com/search?q=${encodeURIComponent(appName + " official documentation")}`, type: "Official Docs" }
            ]
        };
    }

    // 2. Note-taking & Knowledge Management (Notion, Obsidian, Evernote, OneNote, Roam, Craft, Slite)
    if (/(notion|obsidian|evernote|onenote|roam|craft|slite|notes|workspace|wiki)/.test(lower)) {
        return {
            category: "Knowledge Management & Personal Productivity",
            tagline: `All-in-one workspace for notes, wiki pages, databases, and project planning in ${appName}.`,
            overview: {
                whatItIs: `${appName} is a flexible knowledge management platform designed for organizing notes, building internal team wikis, and tracking projects.`,
                whatItIsUsedFor: "Used for personal task tracking, team documentation, project roadmap planning, and linked knowledge bases.",
                whoUsesIt: "Product managers, researchers, writers, team leaders, students, and knowledge workers.",
                mainPurpose: "Provide a unified, block-based workspace to centralize information, streamline documentation, and organize tasks."
            },
            coreFeatures: [
                { id: "gen-feat-1", name: "Block-Based Content Structure", description: "Every text line, image, callout, or toggle is a movable block element.", whyUseful: "Rearrange page content seamlessly by dragging blocks around.", howToUse: "Type '/' to bring up block insert menu → Choose block type." },
                { id: "gen-feat-2", name: "Relational Databases & Board Views", description: "Custom data tables with Kanban, List, Calendar, and Gallery layouts.", whyUseful: "Track tasks, projects, and documents with custom filter views.", howToUse: "Type '/database' → Add properties like Status, Due Date, and Assignee." },
                { id: "gen-feat-3", name: "Internal Page Links & Backlinks", description: "Connect notes together into a bi-directional knowledge network.", whyUseful: "Build a structured company wiki or personal knowledge garden easily.", howToUse: "Type '[[' or '@' followed by page name to create an instant link." }
            ],
            usefulFeatures: [
                { id: "gen-adv-1", name: "Database Templates & Automation Rules", category: "Automation", description: "Pre-fill page structures for recurring meeting notes or sprint items.", whyUseful: "Ensures every new project card starts with standard checklist headers.", howToUse: "Click arrow next to 'New' on a database → Create new template." }
            ],
            learningPath: [
                { id: "gen-lp-1", stage: "Beginner", title: "Page Creation & Slash Commands", explanation: "Learn block types, headers, bullet lists, and basic page styling.", practicalActivity: "Create a Personal Dashboard page with 3 section headers and a callout box." },
                { id: "gen-lp-2", stage: "Core Features", title: "Databases, Views & Filters", explanation: "Master database tables, Kanban boards, and filter rules.", practicalActivity: "Build a Task Tracker database with Status (To Do, In Progress, Done) and filter by Active." },
                { id: "gen-lp-3", stage: "Productivity", title: "Relations & Rollups", explanation: "Link database tables together to aggregate statistics across databases.", practicalActivity: "Relate a Projects database to a Tasks database." },
                { id: "gen-lp-4", stage: "Advanced", title: "Workspace Sharing & Permission Roles", explanation: "Share specific pages with external guests or restrict sub-page permissions.", practicalActivity: "Configure a public view-only page link." },
                { id: "gen-lp-5", stage: "Practical Workflows", title: "Master Knowledge Base Architecture", explanation: "Design an end-to-end team documentation portal.", practicalActivity: "Construct a central Team Knowledge Base dashboard." }
            ],
            tutorials: [
                {
                    id: "gen-tut-1",
                    title: `Create a Filtered Task Kanban Board in ${appName}`,
                    goal: "Build a visual board showing active tasks grouped by Status.",
                    steps: [
                        `Create a new page in ${appName}.`,
                        "Type '/board' and press Enter to insert an Inline Database Board.",
                        "Add properties for 'Due Date' (Date) and 'Priority' (Select).",
                        "Click 'Filter' → Set rule: 'Status is not Done'.",
                        "Drag tasks between columns to update their status."
                    ],
                    expectedResult: "A clean Kanban board that hides completed items automatically.",
                    usefulTip: "Use database views to switch between Board, Table, and Calendar layouts on the exact same data."
                }
            ],
            shortcuts: [
                { id: "gen-sc-1", keyCombination: "/", action: "Open Slash Command Menu", description: "Inserts any block type instantly." },
                { id: "gen-sc-2", keyCombination: "[[", action: "Link Page", description: "Creates a direct link to another internal document." }
            ],
            commonMistakes: [
                { id: "gen-cm-1", mistake: "Over-complicating database schemas before defining content needs", whyItHappens: "Adding too many custom properties upfront.", howToAvoid: "Start simple with title and status, then add properties as needs evolve." }
            ],
            realWorldUseCases: [
                { id: "gen-uc-1", userRole: "Product Manager", scenario: "Managing product roadmaps and customer feature requests.", outcome: "Links user feedback notes directly to roadmap feature items." }
            ],
            whatToLearnNext: ["Formula properties for database math", "Automated API integrations via Webhooks"],
            sources: [
                { title: `${appName} Official Help Center`, url: `https://google.com/search?q=${encodeURIComponent(appName + " help center")}`, type: "Official Docs" }
            ]
        };
    }

    // Default universal fallback synthesizer for any un-categorized application input
    return {
        category: "Software Application & Workflow Productivity",
        tagline: `Comprehensive walkthrough guide and operational masterclass for ${appName}.`,
        overview: {
            whatItIs: `${appName} is a software application designed to streamline domain tasks, improve digital workflows, and enhance execution efficiency.`,
            whatItIsUsedFor: `Used for organizing core projects, executing primary business/technical tasks, managing workflows, and outputting professional results in ${appName}.`,
            whoUsesIt: `Professionals, specialists, team managers, students, and practitioners working with ${appName}.`,
            mainPurpose: `Provide a dependable digital platform for building, managing, and optimizing tasks in ${appName}.`
        },
        coreFeatures: [
            {
                id: "gen-feat-1",
                name: `Primary Task Workspace in ${appName}`,
                description: "Main interactive operational dashboard and canvas area.",
                whyUseful: "Provides centralized access to all tools, controls, and active items.",
                howToUse: "Open application → Navigate main workspace panel → Adjust preferences."
            },
            {
                id: "gen-feat-2",
                name: "Configuration & Project Management Engine",
                description: "Settings, project properties, and structural item manager.",
                whyUseful: "Customizes application behavior and handles save states or export settings.",
                howToUse: "File / Settings menu → Manage configuration presets."
            },
            {
                id: "gen-feat-3",
                name: "Data & Asset Export Suite",
                description: "Multi-format export and sharing system.",
                whyUseful: "Outputs completed work into standard distribution formats.",
                howToUse: "File menu → Export / Save As → Select output format."
            }
        ],
        usefulFeatures: [
            {
                id: "gen-adv-1",
                name: "Automated Batch Processing & Templates",
                category: "Automation",
                description: "Save standardized setup templates to reuse across projects.",
                whyUseful: "Saves hours of setup time for repetitive weekly or monthly tasks.",
                howToUse: "Save project as Template → Load template when starting new item."
            },
            {
                id: "gen-adv-2",
                name: "Custom Keyboard Command Shortcuts",
                category: "Shortcut",
                description: "Custom keybindings for frequently executed menu actions.",
                whyUseful: "Triples execution speed by removing repetitive mouse clicks.",
                howToUse: "Preferences → Keyboard Shortcuts → Assign key sequences."
            }
        ],
        learningPath: [
            { id: "gen-lp-1", stage: "Beginner", title: "Interface Navigation & Initial Setup", explanation: `Understand the core layout, menu bars, and basic project configuration in ${appName}.`, practicalActivity: `Launch ${appName}, configure primary preferences, and save a initial test file.` },
            { id: "gen-lp-2", stage: "Core Features", title: "Essential Operations & Tool Mastery", explanation: "Master the fundamental tools required for 80% of daily tasks.", practicalActivity: "Complete a basic end-to-end task utilizing core feature controls." },
            { id: "gen-lp-3", stage: "Productivity", title: "Workflow Speed & Keyboard Shortcuts", explanation: "Integrate keyboard shortcuts, rapid asset selection, and UI customization.", practicalActivity: "Execute an entire task using keyboard shortcuts exclusively where possible." },
            { id: "gen-lp-4", stage: "Advanced", title: "Custom Presets & Deep Customization", explanation: "Explore advanced sub-menus, plugin integrations, and custom template creation.", practicalActivity: "Build and save a master custom template for team reuse." },
            { id: "gen-lp-5", stage: "Practical Workflows", title: "Real-World Execution & Export Mastery", explanation: "Handle edge-case scenarios, optimize export file sizes, and enforce quality control.", practicalActivity: "Export a production-ready final deliverable according to industry standards." }
        ],
        tutorials: [
            {
                id: "gen-tut-1",
                title: `Mastering Project Setup & Export in ${appName}`,
                goal: "Set up a clean project workspace and export a production-ready deliverable.",
                steps: [
                    `Launch ${appName} and select 'New Project' or 'New Workspace'.`,
                    "Configure project resolution, dimensions, or initial preference parameters.",
                    "Execute primary tasks using core toolbar items.",
                    "Review completed work for errors or formatting issues.",
                    "Go to File → Export / Save As → Choose target file format and save."
                ],
                expectedResult: "A clean, error-free final output file saved in your desired target directory.",
                usefulTip: "Always save a backup project file before running high-resource export operations."
            }
        ],
        shortcuts: [
            { id: "gen-sc-1", keyCombination: "Ctrl + S / Cmd + S", action: "Save Project", description: "Saves current workspace state immediately." },
            { id: "gen-sc-2", keyCombination: "Ctrl + Z / Cmd + Z", action: "Undo Action", description: "Reverts last performed action." },
            { id: "gen-sc-3", keyCombination: "Ctrl + Shift + S", action: "Save As / Export", description: "Opens target save prompt for custom filenames or locations." }
        ],
        commonMistakes: [
            { id: "gen-cm-1", mistake: "Skipping initial project setup preferences", whyItHappens: "Rushing directly into task execution without verifying settings.", howToAvoid: "Always verify project dimensions, units, or paths before starting work." }
        ],
        realWorldUseCases: [
            { id: "gen-uc-1", userRole: "Professional Practitioner", scenario: `Executing client deliverables using ${appName}.`, outcome: "Delivers consistent high-quality results efficiently." }
        ],
        whatToLearnNext: [`Advanced plugin extensions for ${appName}`, "Automation scripting and external integrations"],
        sources: [
            { title: `${appName} Documentation Search`, url: `https://google.com/search?q=${encodeURIComponent(appName + " official documentation")}`, type: "Official Docs" }
        ]
    };
}

// Main generator entry point
export function generateApplicationGuide(appNameInput: string): ApplicationGuideData {
    const cleanName = appNameInput.trim();
    const lowerKey = cleanName.toLowerCase();

    // 1. Check curated exact matches
    if (CURATED_GUIDES[lowerKey]) {
        const match = CURATED_GUIDES[lowerKey];
        return {
            appName: match.appName || cleanName,
            normalizedName: lowerKey,
            category: match.category || "Software Application",
            tagline: match.tagline || `Complete guide to ${cleanName}`,
            overview: match.overview!,
            coreFeatures: match.coreFeatures || [],
            usefulFeatures: match.usefulFeatures || [],
            learningPath: match.learningPath || [],
            tutorials: match.tutorials || [],
            shortcuts: match.shortcuts || [],
            commonMistakes: match.commonMistakes || [],
            realWorldUseCases: match.realWorldUseCases || [],
            whatToLearnNext: match.whatToLearnNext || [],
            sources: match.sources || []
        };
    }

    // 2. Synthesize dynamic domain-based guide for ANY input
    const domainData = classifyAppDomain(cleanName);
    return {
        appName: cleanName,
        normalizedName: lowerKey,
        category: domainData.category,
        tagline: domainData.tagline,
        overview: domainData.overview,
        coreFeatures: domainData.coreFeatures,
        usefulFeatures: domainData.usefulFeatures,
        learningPath: domainData.learningPath,
        tutorials: domainData.tutorials,
        shortcuts: domainData.shortcuts,
        commonMistakes: domainData.commonMistakes,
        realWorldUseCases: domainData.realWorldUseCases,
        whatToLearnNext: domainData.whatToLearnNext,
        sources: domainData.sources
    };
}
