-- CreateTable
CREATE TABLE "_AllowedCandidates" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AllowedCandidates_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AllowedCandidates_B_index" ON "_AllowedCandidates"("B");

-- AddForeignKey
ALTER TABLE "_AllowedCandidates" ADD CONSTRAINT "_AllowedCandidates_A_fkey" FOREIGN KEY ("A") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AllowedCandidates" ADD CONSTRAINT "_AllowedCandidates_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
