-- AlterTable
ALTER TABLE "EmployeeProfile" ADD COLUMN     "attendanceRequired" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tasksLogRequired" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "workOutsideOfficeAllowed" BOOLEAN NOT NULL DEFAULT true;
