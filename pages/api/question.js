import { PrismaClient } from '@prisma/client'
import { NaNSafeParse, nullParse } from '../../lib/utility'

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

  if (req.method === "DELETE") {
    try {
      let response = await deleteQuestionReq(req.body)
      res.status(200).json({text: response})
    } catch (e) {
      console.log(e)
      res.status(500).json({text: "Something went wrong"})
    }
  }
}

async function writeQuestionReq(data) {
  console.log(data)
  const prisma = new PrismaClient();
  if (data.theme == null || data.theme == '') {
    data.theme = 1;
  }
  
  const question = await prisma.question.create({
    data: {
      code: data.code,
      text: data.text,
      type: data.type,
      factSubject: data.factSubject.toString(),
      min: NaNSafeParse(data.min),
      max: NaNSafeParse(data.max),
      theme: nullParse(data.theme)
    }
  })

  for (const label of data.labels) {
    await prisma.questionLables.create({
      data: {
        questionId: question.id,
        label: label
      }
    })
  };

  for (const option of data.options) {
    await prisma.questionOptions.create({
      data: {
        questionId: question.id,
        optionOrder: NaNSafeParse(option._optionOrder),
        code: option._code,
        value: option._value,
        text: option._text,
        image: option._image,
        factId: option._fact
      }
    })
  };

  prisma.$disconnect();
  return ("Created Question " + data.code)
}

async function updateQuestionReq(data) {
  console.log(data)
  const prisma = new PrismaClient();
  if (data.theme == null || data.theme == '') {
    data.theme = 1;
  }

  const question = await prisma.question.update({
    where: {
      id: data.id
    },
    data: {
      code: data.code,
      text: data.text,
      type: data.type,
      factSubject: data.factSubject.toString(),
      min: NaNSafeParse(data.min),
      max: NaNSafeParse(data.max),
      theme: nullParse(data.theme)
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
        optionOrder: NaNSafeParse(option.optionOrder),
        code: option.code,
        value: option.value,
        text: option.text,
        image: option.image,
        factId: option.fact
      },
      update: {
        code: option.code,
        value: option.value,
        text: option.text,
        image: option.image,
        factId: option.fact
      }
    })
  };

  prisma.$disconnect();
  return ("Updated Question " + data.code)
}

async function deleteQuestionReq(data) {
  const prisma = new PrismaClient();

  const questionId = NaNSafeParse(data.id);

  await prisma.questionLables.deleteMany({
    where: {
      questionId: questionId
    }
  });

  await prisma.questionOptions.deleteMany({
    where: {
      questionId: questionId
    }
  })

  await prisma.question.delete({
    where: {
      id: questionId
    },
  })

  prisma.$disconnect();
  return ("Deleted Question " + data.code)
}