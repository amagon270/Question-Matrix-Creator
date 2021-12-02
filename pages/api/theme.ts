import Cors from "cors";
import initMiddleware from "../../lib/initMiddleware";
import { PrismaClient } from '@prisma/client'
import { NaNSafeParse } from "../../lib/utility";

const cors = initMiddleware(
  Cors({
    methods: ["Get", "Post", "Put", "OPTIONS"],
    origin: "*",
    credentials: true
  })
);

export default async function handler(req, res) {
  await cors(req, res);

  if (req.method === "GET") {
    res.status(200).json({ text: 'Themes' });
  } 
  
  if (req.method === "POST") {
    try {
      let response = await writeThemeReq(req.body);
      res.status(200).json({text: response})
    } catch (e) {
      console.log(e)
      res.status(500).json({text: "Something went wrong"})
    }
  } 
  
  if (req.method === "PUT") {
    try {
      let response = await updateThemeReq(req.body);
      res.status(200).json({text: response})
    } catch (e) {
      console.log(e)
      res.status(500).json({text: "Something went wrong"});
    }
  }

  if (req.method === "DELETE") {
    try {
      let response = await deleteThemeReq(req.body);
      res.status(200).json({text: response})
    } catch (e) {
      console.log(e)
      res.status(500).json({text: "Something went wrong"});
    }
  }
}

async function writeThemeReq(data) {
  const prisma = new PrismaClient();
  await prisma.theme.create({
    data: {
      name: data.name,
    }
  })
  prisma.$disconnect();
  return ("Created Theme " + data.name);
}

async function updateThemeReq(data) {
  const prisma = new PrismaClient();
  await prisma.theme.update({
    where: { id: data.id },
    data: {
      name: data.name,
    }
  })
  prisma.$disconnect();
  return("Updated Theme " + data.name);
}

async function deleteThemeReq(data) {
  const prisma = new PrismaClient();
  await prisma.theme.delete({
    where: { id: NaNSafeParse(data.id) },
  })
  prisma.$disconnect();
  return("Deleted Theme " + data.name);
}