/*
  Warnings:

  - You are about to drop the column `rules` on the `WorkRegulation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkRegulation" DROP COLUMN "rules",
ADD COLUMN     "casualLeaveCredit" INTEGER DEFAULT 0,
ADD COLUMN     "flexibleHours" INTEGER,
ADD COLUMN     "normalLeaveCredit" INTEGER DEFAULT 0,
ADD COLUMN     "sickLeaveCredit" INTEGER DEFAULT 0,
ADD COLUMN     "startTime" TEXT,
ADD COLUMN     "workingDays" TEXT[],
ADD COLUMN     "workingHours" DOUBLE PRECISION;
