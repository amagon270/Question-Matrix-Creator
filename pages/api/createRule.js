import { prisma, PrismaClient } from '@prisma/client'
import { asyncForEach, NaNSafeParse} from '../../lib/utility'

export default function handler(req, res) {
  const prisma = new PrismaClient();
  writeToDatabase(req.body)
    .catch(e => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    });
  res.status(200).json({ text: 'Created Rule' })

  async function writeToDatabase(data) {
    console.log(data);

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
}