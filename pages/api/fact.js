import Cors from "cors";
import initMiddleware from "../../lib/initMiddleware";
import { PrismaClient } from '@prisma/client'

const cors = initMiddleware(
  Cors({
    methods: ["Get", "Post", "Put", "OPTIONS"],
    origin: "*",
    credentials: true
  })
);

export default async function handler(req, res) {
  await cors(req, res);
  const prisma = new PrismaClient();

  if (req.method === "GET") {
    res.status(200).json({ text: 'Facts' });
  } else if (req.method === "POST") {
    writeFact(req.body.name, req.body.type);
  } else if (req.method === "PUT") {
    updateFact(req.body.id, req.body.name, req.body.type);
  }

  async function writeFact(name, type) {
    await prisma.fact.create({
      data: {
        name: name,
        type: type
      }
    })

    prisma.$disconnect();
    res.status(200);
  }

  async function updateFact(id, name, type) {
    await prisma.fact.update({
      where: { id: id },
      data: {
        name: name,
        type: type
      }
    })
    prisma.$disconnect();
    res.status(200);
  }
}