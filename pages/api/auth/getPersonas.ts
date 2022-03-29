import { PrismaClient } from '@prisma/client';
import Cors from 'cors'
import { checkAuth, decodeJWT, doesPasswordMatchHash, getAuthHeader, userToJWT } from '../../../lib/auth';
import runMiddleware from '../../../lib/runMiddleware'

export default async function handler(req, res) {
  await runMiddleware(req, res, Cors({methods: ['GET', 'HEAD']}));
  if (req.method === "GET") {
    try {
      await getPersonas();
    } catch(error) {
      console.log(error)
      res.status(500).json({ text: error })
    }
  }

  async function getPersonas() {
    const _user = await checkAuth(req, res);
    if (_user) {
      const prisma = new PrismaClient();
      const _personas = await prisma.personas.findMany({
        where: {
          user: _user.id
        }
      });
      await prisma.$disconnect();
      res.status(200).json([..._personas]);
      return;
    }
  };
}