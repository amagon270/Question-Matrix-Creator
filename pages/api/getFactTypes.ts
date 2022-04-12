import { PrismaClient } from '@prisma/client'

export default async function handler(res) {
  const prisma = new PrismaClient();

  const questionTypes = await prisma.questionType.findMany();
  res.status(200).json({ text: questionTypes })

  prisma.$disconnect();
}