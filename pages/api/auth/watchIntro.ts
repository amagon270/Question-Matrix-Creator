import { PrismaClient } from '@prisma/client';
import Cors from 'cors'
import { checkAuth } from '../../../lib/auth';
import runMiddleware from '../../../lib/runMiddleware'

export default async function handler(req, res) {
  await runMiddleware(req, res, Cors({methods: ['POST', 'HEAD']}));
  if (req.method === "POST") {
    try {
      await watchIntro();
    } catch(error) {
      console.log(error)
      res.status(500).json({ text: error })
    }
  }

  async function watchIntro() {
    const _user = await checkAuth(req, res);
    if (_user) {
      const prisma = new PrismaClient();
      await prisma.users.update({
        where: {
          id: _user.id
        },
        data: {
          seenIntro: true,
        }
      });
      await prisma.$disconnect();
      res.status(200).json({"text": "success"});
      return;
    }
  }
}