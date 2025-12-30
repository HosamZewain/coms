import { prisma } from './utils/prisma';

async function main() {
    console.log("Starting PM Module Verification...");

    // 1. Get a user
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("No user found!");
        return;
    }
    console.log(`Using user: ${user.email} (${user.id})`);

    // 2. Create Board
    console.log("Creating Board...");
    const board = await prisma.board.create({
        data: {
            name: "Verification Board",
            ownerUserId: user.id
        }
    });
    console.log(`Board created: ${board.id}`);

    // Add access
    await prisma.boardAccess.create({
        data: {
            boardId: board.id,
            userId: user.id,
            role: 'ADMIN'
        }
    });

    // 3. Create Plan
    console.log("Creating Plan...");
    const plan = await prisma.plan.create({
        data: {
            boardId: board.id,
            name: "Sprint 1",
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdByUserId: user.id
        }
    });
    console.log(`Plan created: ${plan.id}`);

    // 4. Create Epic
    console.log("Creating Epic...");
    const epic = await prisma.epic.create({
        data: {
            boardId: board.id,
            planId: plan.id,
            title: "Core Features",
            createdByUserId: user.id
        }
    });
    console.log(`Epic created: ${epic.id}`);

    // 5. Create Task
    console.log("Creating Task...");
    const task = await prisma.task.create({
        data: {
            title: "Verify Backend",
            boardId: board.id,
            planId: plan.id,
            epicId: epic.id,
            status: 'IN_PROGRESS',
            createdByUserId: user.id
        }
    });
    console.log(`Task created: ${task.id}`);

    // 6. Assign
    console.log("Assigning Task...");
    await prisma.taskAssignment.create({
        data: {
            taskId: task.id,
            userId: user.id
        }
    });

    // 7. Add Comment
    console.log("Adding Comment...");
    await prisma.taskComment.create({
        data: {
            taskId: task.id,
            authorUserId: user.id,
            body: "Verification comment"
        }
    });

    // 8. Verify Data with Query
    console.log("Verifying Data...");
    const tasks = await prisma.task.findMany({
        where: { boardId: board.id },
        include: { assignments: true, comments: true, epic: true, plan: true }
    });

    if (tasks.length === 1 && tasks[0].assignments.length === 1 && tasks[0].comments.length === 1) {
        console.log("SUCCESS: Task data strictly verified.");
    } else {
        console.error("FAILURE: Data mismatch.", JSON.stringify(tasks, null, 2));
    }

    // Cleanup
    console.log("Cleaning up...");
    // Reverse order delete or cascade? Manual cleanup for safety
    await prisma.taskComment.deleteMany({ where: { taskId: task.id } });
    await prisma.taskAssignment.deleteMany({ where: { taskId: task.id } });
    await prisma.taskActivity.deleteMany({ where: { taskId: task.id } });
    await prisma.task.delete({ where: { id: task.id } });
    await prisma.epic.delete({ where: { id: epic.id } });
    await prisma.plan.delete({ where: { id: plan.id } });
    await prisma.boardAccess.deleteMany({ where: { boardId: board.id } });
    await prisma.board.delete({ where: { id: board.id } });

    console.log("Verification Complete!");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
