import { prisma, PrismaClient } from '@prisma/client'
import { asyncForEach, NaNSafeParse} from '../../lib/utility'

export default async function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json({ text: 'Rules' });
  } 

  if (req.method === "POST") {
    try {
      let response = await writeRuleReq(req.body)
      res.status(200).json({text: response})
    } catch (e) {
      console.log(e)
      res.status(500).json({text: "Something went wrong"})
    }
  }

  if (req.method === "PUT") {
    try {
      let response = await updateRuleReq(req.body)
      res.status(200).json({text: response})
    } catch (e) {
      console.log(e)
      res.status(500).json({text: "Something went wrong"})
    }
  }

  if (req.method === "DELETE") {
    try {
      let response = await deleteRuleReq(req.body)
      res.status(200).json({text: response})
    } catch (e) {
      console.log(e)
      res.status(500).json({text: "Something went wrong"})
    }
  }
}

async function writeRuleReq(data) {
  const prisma = new PrismaClient();

  var action = {questionId: null, factId: null, factAction: null};
  if (data.questionAction != "")
    action.questionId = NaNSafeParse(data.questionAction);
  if (data.factAction != null && data.factAction != 0)
    action.factId = NaNSafeParse(data.factAction);
  if (data.factActionValue != "")
    action.factAction = data.factActionValue;
  if (data.themeAction != 1 && data.themeAction != "")
    action.theme = data.themeAction
  
  const rule = await prisma.rule.create({
    data: {
      code: data.code,
      triggerType: data.trigger,
      priority: NaNSafeParse(data.priority),
      factId: action.factId,
      factAction: action.factAction,
      questionId: action.questionId,
      theme: action.theme
    }
  })

  for (const test of data.tests) {
    const testId = await prisma.ruleTests.create({
      data: {
        ruleId: rule.id,
        factId: NaNSafeParse(test.factId),
        operation: test.operation,
        parameter: test.parameter
      }
    })
  };

  prisma.$disconnect();
  return ("Created Rule " + rule.code);
}

async function updateRuleReq(data) {
  const prisma = new PrismaClient();

  var action = {questionId: null, factId: null, factAction: null};
  if (data.questionAction != "")
    action.questionId = NaNSafeParse(data.questionAction);
  if (data.factAction != null && data.factAction != 0)
    action.factId = NaNSafeParse(data.factAction);
  if (data.factActionValue != "")
    action.factAction = data.factActionValue;
  if (data.themeAction != 1 && data.themeAction != "")
    action.theme = data.themeAction

  const rule = await prisma.rule.update({
    where: {
      id: data.id
    },
    data: {
      code: data.code,
      triggerType: data.trigger,
      priority: NaNSafeParse(data.priority),
      factId: action.factId,
      factAction: action.factAction,
      questionId: action.questionId,
      theme: action.theme
    }
  })

  for (const test of data.tests) {
    const testId = await prisma.ruleTests.upsert({
      where: {
        id: test.id ?? -1
      },
      create: {
        ruleId: rule.id,
        factId: NaNSafeParse(test.factId),
        operation: test.operation,
        parameter: test.parameter
      },
      update: {
        factId: NaNSafeParse(test.factId),
        operation: test.operation,
        parameter: test.parameter
      }
    })
  };

  prisma.$disconnect();
  return ("Updated Rule " + rule.code);
}

async function deleteRuleReq(data) {
  const prisma = new PrismaClient();

  const ruleId = NaNSafeParse(data.id)

  const rule = await prisma.rule.delete({
    where: {
      id: ruleId
    }
  })

  await prisma.ruleTests.deleteMany({
    where: {
      ruleId: ruleId
    }
  })

  prisma.$disconnect();
  return ("Deleted Rule " + rule.code);
}