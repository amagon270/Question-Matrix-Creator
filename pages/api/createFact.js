import { PrismaClient } from '@prisma/client'

export default function handler(req, res) {
  writeToDatabase(req.body.name, req.body.type);
  res.status(200).json({ text: 'Hello' })
}

async function writeToDatabase(name, type) {
  const prisma = new PrismaClient();
  await prisma.fact.create({
    data: {
      name: name,
      type: type
    }
  })

  const allFacts = await prisma.fact.findMany();
  console.log(allFacts);
}