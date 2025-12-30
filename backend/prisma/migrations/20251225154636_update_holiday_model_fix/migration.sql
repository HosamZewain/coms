/*
  Warnings:

  - Added the required column `updatedAt` to the `Holiday` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Holiday" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
