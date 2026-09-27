-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "hostId" INTEGER;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
