import { PrismaClient } from '@prisma/client'
import Cors from 'cors'
import { doesPasswordMatchHash, userToJWT } from '../../../lib/auth';
import runMiddleware from '../../../lib/runMiddleware'

export default async function handler(req, res) {
  await runMiddleware(req, res, Cors({methods: ['POST', 'HEAD']}));
  const prisma = new PrismaClient();
  if (req.method === "POST") {
    try {
      await login();
    } catch(error) {
      console.log(error)
      await prisma.$disconnect();
      res.status(500).json({ text: error })
    }
  }

  async function login() {
    const _body = req.body as auth.loginRequestBody;

    _body.username = _body.username.toLowerCase();
    const _user = await prisma.users.findFirst({
      where: {
        username: _body.username
      }
    });

    if (!_user) {
      res.status(404).json({text: "User not found"})
      return;
    }

    const passwordMatchesHash = await doesPasswordMatchHash(
      _body.password,
      _user.password,
    );

    if (!passwordMatchesHash) {
      res.status(404).json({text: "User not found"})
      return;
    }

    await prisma.$disconnect();
    res.status(200).json(userToJWT(_user));
  }
}