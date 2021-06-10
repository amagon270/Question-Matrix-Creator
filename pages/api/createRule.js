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

    var factAction = await prisma.fact.findFirst({
      where: {
        name: data.factAction
      }
    })
    const action = await prisma.ruleAction.create({
      data: {
        data
      }
    })

    const rule = await prisma.rule.create({
      data: {
        triggerType: data.trigger
      }
    })

    await asyncForEach(data.tests ?? [], async (test) => {
      var factId = await prisma.fact.findFirst({
        where: {name: test.fact}
      })
      var testId = await prisma.ruleTest.create({
        data: {
          factId: factId,
          operation: test.operator,
          parameter: test.parameter
        }
      })
    });

    await asyncForEach(data.options ?? [], async (option) => {
      await prisma.questionOptions.create({
        data: {
          questionId: question.id,
          optionOrder: NaNSafeParse(option._order),
          code: option._code,
          text: option._text,
          image: option._image
        }
      })
    })

    prisma.$disconnect();
  }
}