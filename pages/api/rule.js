import { prisma, PrismaClient } from '@prisma/client'
import { asyncForEach, NaNSafeParse} from '../../lib/utility'

export default function handler(req, res) {
  const prisma = new PrismaClient();
  if (req.method === "POST") {
    writeToDatabase(req.body)
    .catch(e => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    });
  } else if(req.method === "PUT") {
    updateDatabase(req.body)
    .finally(async () => {
      await prisma.$disconnect()
    });
  }
  res.status(200).json({ text: 'Created Rule' })

  async function writeToDatabase(data) {
    console.log(data);

    //I had trouble getting null to work with dropdowns so I just set 0 to mean null
    var ruleActionData = {};
    if (data.factAction != "0") {
      ruleActionData.factId = NaNSafeParse(data.factAction);
    } if (data.factActionValue != "") {
      ruleActionData.factAction = data.factActionValue;
    } if (data.questionAction != "0") {
      ruleActionData.questionId = NaNSafeParse(data.questionAction);
    }
    const action = await prisma.ruleAction.create({
      data: ruleActionData
    })

    const rule = await prisma.rule.create({
      data: {
        code: data.code,
        triggerType: data.trigger,
        priority: NaNSafeParse(data.priority),
        action: action.id
      }
    })

    await asyncForEach(data.tests ?? [], async (test) => {
      const testId = await prisma.ruleTest.create({
        data: {
          factId: NaNSafeParse(test._fact),
          operation: test._operator,
          parameter: test._parameter
        }
      })
      await prisma.ruleTests.create({
        data: {
          ruleId: rule.id,
          testId: testId.id
        }
      })
    });

    prisma.$disconnect();
  }

  async function updateDatabase(data) {
    console.log(data);

    var ruleObject = await prisma.rule.findFirst({
      where: {id: data.id}
    })
    var actionId = ruleObject.action
    //I had trouble getting null to work with dropdowns so I just set 0 to mean null
    var ruleActionData = {};
    if (data.factAction != "0") {
      ruleActionData.factId = NaNSafeParse(data.factAction);
    } if (data.factActionValue != "") {
      ruleActionData.factAction = data.factActionValue;
    } if (data.questionAction != "0") {
      ruleActionData.questionId = NaNSafeParse(data.questionAction);
    }
    const action = await prisma.ruleAction.update({
      where: {
        id: actionId
      },
      data: ruleActionData
    })

    const rule = await prisma.rule.update({
      where: {
        id: data.id
      },
      data: {
        code: data.code,
        triggerType: data.trigger,
        priority: NaNSafeParse(data.priority),
        action: action.id
      }
    })

    await asyncForEach(data.tests ?? [], async (test) => {
      console.log(test)
      const testId = await prisma.ruleTest.upsert({
        where: {
          id: test.id ?? -1
        },
        create: {
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
      await prisma.ruleTests.upsert({
        where: {
          ruleId_testId: {
            ruleId: data.id,
            testId: testId.id
          }
        },
        create: {
          ruleId: rule.id,
          testId: testId.id
        },
        update: {}
      })
    });

    prisma.$disconnect();
  }
}