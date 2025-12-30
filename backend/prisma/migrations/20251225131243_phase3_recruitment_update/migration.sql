-- AlterTable
ALTER TABLE "Applicant" ADD COLUMN     "experienceYears" INTEGER,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "residence" TEXT;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "level" TEXT;
