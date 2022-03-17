import { PrismaClient } from '@prisma/client'
import Cors from 'cors'
import { hashPassword, signJWT, userToJWT } from '../../../lib/auth';
import runMiddleware from '../../../lib/runMiddleware'

export default async function handler(req, res) {
  await runMiddleware(req, res, Cors({methods: ['GET', 'HEAD']}));
  const prisma = new PrismaClient();
  if (req.method === "POST") {
    try {
      await signup();
    } catch(error) {
      console.log(error)
      await prisma.$disconnect();
      res.status(500).json({ text: error })
    }
  }

  async function signup() {
    const body = JSON.parse(req.body);
    const existingUser = await prisma.users.findFirst({
      where: {
        username: body.username
      }
    });

    if (existingUser) {
      res.status(400).json({text: "This user already exists. Please log in instead."});
      return;
    }

    const password = await hashPassword(body.password, parseInt(process.env.SALTROUNDS));

    const newUser = await prisma.users.create({
      data: {
        username: body.username,
        password: password,
      }
    });

    await prisma.$disconnect();
    res.status(200).json(userToJWT(newUser));
  }
}