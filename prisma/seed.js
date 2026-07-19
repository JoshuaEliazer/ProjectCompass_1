const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database with application learning roadmaps...');

    // Clean existing data
    await prisma.userProgress.deleteMany({});
    await prisma.quizQuestion.deleteMany({});
    await prisma.quiz.deleteMany({});
    await prisma.guideStep.deleteMany({});
    await prisma.learningPath.deleteMany({});
    await prisma.application.deleteMany({});
    await prisma.functionDefinition.deleteMany({});
    await prisma.codeModule.deleteMany({});
    await prisma.repoAnalysis.deleteMany({});
    await prisma.user.deleteMany({});

    // Seed default user
    const admin = await prisma.user.create({
        data: {
            email: 'student@projectcompass.io',
            name: 'Mentor Student',
            role: 'USER',
        },
    });

    // 1. Power BI
    const powerBI = await prisma.application.create({
        data: {
            name: 'Power BI',
            description: 'Business intelligence and rich data visualizations tool.',
            icon: '📊',
        },
    });

    const pbiPath = await prisma.learningPath.create({
        data: {
            appId: powerBI.id,
            title: 'Mastering Power BI DAX & Data Modeling',
            description: 'Learn relationships cardinality, filter propagation, and CALCULATE modifiers.',
            difficulty: 'Intermediate',
        },
    });

    await prisma.guideStep.createMany({
        data: [
            {
                learningPathId: pbiPath.id,
                order: 1,
                title: 'Understanding DAX Evaluation Contexts',
                content: 'Evaluation context is the foundation of DAX. It consists of Row Context (created during iteration) and Filter Context (created by PivotTable coordinate grids, slicers, and column headers). Understanding how CALCULATE overrides these contexts is key to mastering DAX formulas.',
                shortcuts: 'Ctrl + Alt + L (Format DAX Code)',
                productivityTips: 'Always write measure formulas cleanly; format them in DAX Studio before publication.',
                practiceTask: 'Write a measure mapping: Total Sales = SUM(Sales[Amount]). Describe the filter context context.',
            },
            {
                learningPathId: pbiPath.id,
                order: 2,
                title: 'Building Star Schema Architectures',
                content: 'Star schema is the gold standard for Power BI modeling. Keep your fact tables containing transactional records in the center, surrounded by dimension tables (Customers, Products, Dates) configured with 1-to-many relationship directions.',
                shortcuts: 'Ctrl + Y (Model view navigation)',
                productivityTips: 'Disable auto-date-time settings in file options to minimize local database bloat.',
                practiceTask: 'Draw relationship cardinality between Dimensions (Dates) and Facts (Sales).',
            }
        ],
    });

    const pbiQuiz = await prisma.quiz.create({
        data: {
            learningPathId: pbiPath.id,
            title: 'DAX Contexts Evaluation Check',
            description: 'A quick quiz validating row vs filter propagation contexts.',
        },
    });

    await prisma.quizQuestion.createMany({
        data: [
            {
                quizId: pbiQuiz.id,
                questionText: 'Which Dax function transforms Row Context into Filter Context?',
                options: JSON.stringify(['CALCULATE', 'RELATED', 'SUMX', 'FILTER']),
                correctAnswer: 'CALCULATE',
                explanation: 'CALCULATE triggers context transition, taking any active row contexts and merging them into the active filter context.',
            },
            {
                quizId: pbiQuiz.id,
                questionText: 'What is the recommended relationship cardinality in Star Schema?',
                options: JSON.stringify(['Many-to-many', 'One-to-many', 'One-to-one', 'Isolated']),
                correctAnswer: 'One-to-many',
                explanation: 'One-to-many from dimension tables to fact tables propagates filters cleanly and optimizes memory indexing compile formats.',
            }
        ],
    });

    // 2. Excel
    const excel = await prisma.application.create({
        data: {
            name: 'Excel',
            description: 'Advanced data computation and spreadsheet modeling engine.',
            icon: '📈',
        },
    });

    const excelPath = await prisma.learningPath.create({
        data: {
            appId: excel.id,
            title: 'Advanced Financial Modeling Keyboard Shortcuts',
            description: 'Ditch the mouse. Perform advanced lookup lookups and audits with hotkey shortcuts.',
            difficulty: 'Beginner',
        },
    });

    await prisma.guideStep.createMany({
        data: [
            {
                learningPathId: excelPath.id,
                order: 1,
                title: 'Navigating Ranges & Selecting Blocks',
                content: 'To audit large sheets, navigation should be instantaneous. Holding Ctrl lets you jump to range boundaries, while holding Shift extends selection scopes. Mastering these prevents mouse drag lag.',
                shortcuts: 'Ctrl + Arrow Keys (Select edge), Ctrl + Space (Select entire column), Shift + Space (Select entire row)',
                productivityTips: 'Use Ctrl + PgUp/PgDn to parse between sheet tabs without clicking.',
                practiceTask: 'Select a table array bounds using only Ctrl + Shift + Down/Right keys.',
            },
            {
                learningPathId: excelPath.id,
                order: 2,
                title: 'Mastering XLOOKUP & Precision Ranges',
                content: 'XLOOKUP is the modern successor to VLOOKUP. It searches arrays vertically, requires no column indices, supports default error outputs, and does not break when inserting columns.',
                shortcuts: 'Alt + A + C (Clear filter criteria)',
                productivityTips: 'Always default to exact match without specifying 0 value explicitly; XLOOKUP does it by default.',
                practiceTask: 'Write lookup matching: =XLOOKUP(A2, Products[ID], Products[Price], "Not Found").',
            }
        ],
    });

    // 3. Figma
    const figma = await prisma.application.create({
        data: {
            name: 'Figma',
            description: 'Modern collaborative design prototyping system.',
            icon: '🎨',
        },
    });

    const figmaPath = await prisma.learningPath.create({
        data: {
            appId: figma.id,
            title: 'Mastering Auto-Layout & Design tokens',
            description: 'Design UI layouts that resize dynamically like CSS flexbox structures.',
            difficulty: 'Intermediate',
        },
    });

    await prisma.guideStep.createMany({
        data: [
            {
                learningPathId: figmaPath.id,
                order: 1,
                title: 'Understanding Hug vs Fill vs Fixed resizing',
                content: 'Auto layout components wrap items and scale them. Fixed width locks constraints. Hug sizing shrinks container limits down to match content size. Fill container stretches components to absorb parent padding balances.',
                shortcuts: 'Shift + A (Create Auto-Layout Frame)',
                productivityTips: 'Ensure components spacing uses consistent scales (4px, 8px, 16px, 24px) for developer grid compliance.',
                practiceTask: 'Create a Card component. Apply auto-layout. Set children text boxes to Fill Container.',
            }
        ],
    });

    console.log('Database seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
