"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const slug_utils_1 = require("../utils/slug.utils");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting Slug Backfill...');
    // 1. Projects
    const projects = await prisma.project.findMany({ where: { slug: null } });
    console.log(`Found ${projects.length} projects without slugs.`);
    for (const project of projects) {
        let baseSlug = (0, slug_utils_1.slugify)(project.name);
        let uniqueSlug = baseSlug;
        let counter = 1;
        // Check uniqueness
        while (await prisma.project.findUnique({ where: { slug: uniqueSlug } })) {
            uniqueSlug = `${baseSlug}-${counter}`;
            counter++;
        }
        await prisma.project.update({
            where: { id: project.id },
            data: { slug: uniqueSlug }
        });
        console.log(`Updated Project: ${project.name} -> ${uniqueSlug}`);
    }
    // 2. Users (Employees)
    const users = await prisma.user.findMany({ where: { slug: null } });
    console.log(`Found ${users.length} users without slugs.`);
    for (const user of users) {
        const fullName = `${user.firstName} ${user.lastName}`;
        let baseSlug = (0, slug_utils_1.slugify)(fullName);
        let uniqueSlug = baseSlug;
        let counter = 1;
        while (await prisma.user.findUnique({ where: { slug: uniqueSlug } })) {
            uniqueSlug = `${baseSlug}-${counter}`;
            counter++;
        }
        await prisma.user.update({
            where: { id: user.id },
            data: { slug: uniqueSlug }
        });
        console.log(`Updated User: ${fullName} -> ${uniqueSlug}`);
    }
    console.log('Slug Backfill Complete!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
