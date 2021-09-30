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
    res.status(200).json({ text: 'Facts' });
  } 
  
  if (req.method === "POST") {
    try {
      let response = await writeFactReq(req.body);
      res.status(200).json({text: response})
    } catch (e) {
      console.log(e)
      res.status(500).json({text: "Something went wrong"})
    }
  } 
  
  if (req.method === "PUT") {
    try {
      let response = await updateFactReq(req.body);
      res.status(200).json({text: response})
    } catch (e) {
      console.log(e)
      res.status(500).json({text: "Something went wrong"});
    }
  }

  if (req.method === "DELETE") {
    try {
      let response = await deleteFactReq(req.body);
      res.status(200).json({text: response})
    } catch (e) {
      console.log(e)
      res.status(500).json({text: "Something went wrong"});
    }
  }
}

async function writeFactReq(data) {
  console.log(data);
  const prisma = new PrismaClient();

  var theme;
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
      negatedFacts: data.negateFacts
    }
  })
  prisma.$disconnect();
  return ("Created Fact " + data.name);
}

async function updateFactReq(data) {
  const prisma = new PrismaClient();
  await prisma.fact.update({
    where: { id: data.id },
    data: {
      name: data.name,
      type: data.type,
      theme: NaNSafeParse(data.theme),
      negatedFacts: data.negateFacts
    }
  })
  prisma.$disconnect();
  return("Updated Fact " + data.name);
}

async function deleteFactReq(data) {
  const prisma = new PrismaClient();
  await prisma.fact.delete({
    where: { id: NaNSafeParse(data.id) },
  })
  prisma.$disconnect();
  return("Deleted Fact " + data.name);
}