import Cors from "cors";
import initMiddleware from "../../lib/initMiddleware";
import { PrismaClient } from '@prisma/client'
import { NaNSafeParse } from "../../lib/utility";
import { Matrix } from "../../types/matrix";

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
    res.status(200).json({ text: 'Facts' });
  } 

  try {
    if (req.method === "POST") {
      const response = await writeFactReq(req.body);
      res.status(200).json({text: response})
    } 
    if (req.method === "PUT") {
      const response = await updateFactReq(req.body);
      res.status(200).json({text: response})
    }
    if (req.method === "DELETE") {
      const response = await deleteFactReq(req.body);
      res.status(200).json({text: response})
    }
  } catch (e) {
    console.log(e)
    res.status(500).json({text: "Something went wrong"})
  }
}

async function writeFactReq(data: Matrix.Fact) {
  const prisma = new PrismaClient();

  let theme;
  if (NaNSafeParse(data.theme) == 0) {
    theme = null;
  } else {
    theme = NaNSafeParse(data.theme);
  }

  await prisma.fact.create({
    data: {
      name: data.name,
      type: data.type,
      theme: theme,
      negatedFacts: data.negatedFacts
    }
  })
  prisma.$disconnect();
  global.facts = (global.facts as Matrix.Fact[]).push(data);
  return ("Created Fact " + data.name);
}

async function updateFactReq(data: Matrix.Fact) {
  const prisma = new PrismaClient();
  await prisma.fact.update({
    where: { id: data.id },
    data: {
      name: data.name,
      type: data.type,
      theme: NaNSafeParse(data.theme),
      negatedFacts: data.negatedFacts
    }
  })
  prisma.$disconnect();

  global.facts = (global.facts as Matrix.Fact[]).map(fact => (fact.id === data.id ? data : fact));
  return("Updated Fact " + data.name);
}

async function deleteFactReq(data: Matrix.Fact) {
  const prisma = new PrismaClient();
  await prisma.fact.delete({
    where: { id: NaNSafeParse(data.id) },
  })
  prisma.$disconnect();
  global.facts = (global.facts as Matrix.Fact[]).filter(fact => fact.id !== data.id);
  return("Deleted Fact " + data.name);
}