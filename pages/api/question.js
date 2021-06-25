import { PrismaClient } from '@prisma/client'
import { NaNSafeParse} from '../../lib/utility'

export default async function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json({ text: 'Questions' });
  } 

  if (req.method === "POST") {
    try {
      let response = await writeQuestionReq(req.body)
      res.status(200).json({text: response})
    } catch (e) {
      console.log(e)
      res.status(500).json({text: "Something went wrong"})
    }
  }

  if (req.method === "PUT") {
    try {
      let response = await updateQuestionReq(req.body)
      res.status(200).json({text: response})
    } catch (e) {
      console.log(e)
      res.status(500).json({text: "Something went wrong"})
    }
  }
}

async function writeQuestionReq(data) {
  const prisma = new PrismaClient();
  
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

  for (label of data.labels) {
    await prisma.questionLables.create({
      data: {
        questionId: question.id,
        label: label
      }
    })
  };

  for (option of data.options) {
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
  };

  prisma.$disconnect();
  return ("Created Question " + data.code)
}

async function updateQuestionReq(data) {
  const prisma = new PrismaClient();

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

  //there isn't anything identifying a label so i just 
  //delete all labels for this question and re-create them all
  await prisma.questionLables.deleteMany({
    where: {
      questionId: data.id
    }
  });
  for (const label of data.labels) {
    await prisma.questionLables.create({
      data: {
        questionId: question.id,
        label: label
      }
    });
  };

  for (const option of data.options) {
    await prisma.questionOptions.upsert({
      where: {
        id: option.id ?? -1,
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
  };

  prisma.$disconnect();
  return ("Updated Question " + data.code)
}