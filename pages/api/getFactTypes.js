import { PrismaClient } from '@prisma/client'

export default async function handler(req, res) {
  const prisma = new PrismaClient();
  var questionTypes;

  questionTypes = await prisma.questionType.findMany();
  res.status(200).json({ text: questionTypes })

}