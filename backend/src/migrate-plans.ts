
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting migration: Creating default plans for existing projects...');

    const projects = await prisma.project.findMany({
        include: {
            plans: true,
            tasks: {
                where: { planId: null }
            }
        }
    });

    for (const project of projects) {
        console.log(`Processing project: ${project.name} (${project.id})`);

        let defaultPlan = project.plans.find(p => p.name === 'Backlog' || p.name === 'General');

        if (!defaultPlan) {
            if (project.plans.length > 0) {
                console.log(`- Project already has plans, skipping default creation.`);
                // Optionally assign orphans to the first available plan?
                defaultPlan = project.plans[0];
            } else {
                console.log(`- Creating 'Backlog' plan...`);
                // We need a userId. Since this is a script, we might need a system user or pick an owner.
                // For now, let's try to find a user, or use a placeholder if the schema requires it.
                // Plan.createdByUserId is required.
                // We'll use the project owner if we can find one? Project doesn't have owner directly? 
                // Board has owner. Project doesn't in schema passed.
                // Let's just find the first admin user or any user.
                const user = await prisma.user.findFirst();
                if (!user) {
                    console.log('No users found to assign as creator. Skipping.');
                    continue;
                }

                defaultPlan = await prisma.plan.create({
                    data: {
                        name: 'Backlog',
                        startDate: new Date(),
                        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year out
                        projectId: project.id,
                        createdByUserId: user.id,
                        status: 'ACTIVE'
                    }
                });
            }
        }

        if (project.tasks.length > 0 && defaultPlan) {
            console.log(`- Moving ${project.tasks.length} orphaned tasks to plan '${defaultPlan.name}'...`);
            await prisma.task.updateMany({
                where: {
                    projectId: project.id,
                    planId: null
                },
                data: {
                    planId: defaultPlan.id
                }
            });
        }
    }

    console.log('Migration complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
