import { PrismaClient } from '@prisma/client';
import Cors from 'cors'
import { checkAuth } from '../../../lib/auth';
import runMiddleware from '../../../lib/runMiddleware'

export default async function handler(req, res) {
  await runMiddleware(req, res, Cors({methods: ['POST', 'HEAD']}));
  if (req.method === "POST") {
    try {
      await savePersona();
    } catch(error) {
      console.log(error)
      res.status(500).json({ text: error, id: "1" })
    }
  }

  async function savePersona() {
    const _user = await checkAuth(req, res);
    if (_user) {
      const prisma = new PrismaClient();
      const _body = JSON.parse(req.body);
      const _id = parseInt(_body.id) ? parseInt(_body.id): 0;
      const _persona = await prisma.personas.upsert({
        where: {
          id: _id
        },
        create: {
          user: _user.id,
          data: _body.data
        }, 
        update: {
          data: _body.data
        }
      });
      await prisma.$disconnect();
      res.status(200).json({text: "Persona saved", id: _persona.id});
      return;
    }
  }
}