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

    const action = await prisma.ruleAction.create({
      data: {
        factId: data.factAction,
        factAction: data.factActionValue,
        questionId: data.questionAction
      }
    })

    const rule = await prisma.rule.create({
      data: {
        triggerType: data.trigger,
        priority: data.priority,
        action: action
      }
    })

    await asyncForEach(data.tests ?? [], async (test) => {
      const testId = await prisma.ruleTest.create({
        data: {
          factId: test.fact,
          operation: test.operator,
          parameter: test.parameter
        }
      })

      await prisma.ruleTests.create({
        data: {
          ruleId: rule,
          testId: testId
        }
      })
    });

    prisma.$disconnect();
  }
}