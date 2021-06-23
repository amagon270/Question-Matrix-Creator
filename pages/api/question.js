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
  }
  if (req.method === "PUT") {
    updateDatabase(req.body)
    .finally(async () => {
      await prisma.$disconnect()
    })
  }
  res.status(200).json({ text: 'Created Question' })

  async function writeToDatabase(data) {
    const question = await prisma.question.create({
      data: {
        code: data.code,
        text: data.text,
        type: data.type,
        factSubject: data.factSubject,
        min: NaNSafeParse(data.min),
        max: NaNSafeParse(data.max)
      }
    })

    await asyncForEach(data.labels ?? [], async (label) => {
      await prisma.questionLables.create({
        data: {
          questionId: question.id,
          label: label
        }
      })
    });

    await asyncForEach(data.options ?? [], async (option) => {
      await prisma.questionOptions.create({
        data: {
          questionId: question.id,
          optionOrder: NaNSafeParse(option._order),
          code: option._code,
          value: option._value,
          text: option._text,
          image: option._image
        }
      })
    })

    prisma.$disconnect();
  }

  async function updateDatabase(data) {
    console.log(data)
    const question = await prisma.question.update({
      where: {
        id: data.id
      },
      data: {
        code: data.code,
        text: data.text,
        type: data.type,
        factSubject: data.factSubject,
        min: NaNSafeParse(data.min),
        max: NaNSafeParse(data.max)
      }
    })

    await prisma.questionLables.deleteMany({
      where: {
        questionId: data.id
      }
    });
    
    await asyncForEach(data.labels ?? [], async (label) => {
      await prisma.questionLables.create({
        data: {
          questionId: question.id,
          label: label
        }
      });
    });

    await asyncForEach(data.options ?? [], async (option) => {
      await prisma.questionOptions.upsert({
        where: {
          questionId_optionOrder: {
            questionId: data.id,
            optionOrder: NaNSafeParse(option._optionOrder)
          },
        },
        create: {
          questionId: data.id,
          optionOrder: NaNSafeParse(option._optionOrder),
          code: option._code,
          value: option._value,
          text: option._text,
          image: option._image
        },
        update: {
          code: option._code,
          value: option._value,
          text: option._text,
          image: option._image
        }
      })
    })

    prisma.$disconnect();
  }
}