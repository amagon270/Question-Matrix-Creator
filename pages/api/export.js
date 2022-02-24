import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

import Cors from 'cors'

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors)
  const prisma = new PrismaClient();
  if (req.method === "GET") {
    try {
      await createJson();
    } catch(error) {
      console.log(error)
      res.status(500).json({ text: error })
    }
    prisma.$disconnect();
  }

  async function createJson() {
    var factExport = [];
    var questionExport = [];
    var ruleExport = [];
    const questions = await prisma.question.findMany();
    const questionOptions = await prisma.questionOptions.findMany();
    const questionLabels = await prisma.questionLables.findMany();
    const facts = await prisma.fact.findMany();
    const rules = await prisma.rule.findMany();
    const ruleTests = await prisma.ruleTests.findMany();
    const themes = await prisma.theme.findMany();


    //null safety in the app
    factExport.push({
      id: 0,
      text: "blank",
      tags: [],
      value: ""
    })
    facts.forEach(fact => {
      factExport.push({
        id: fact.id,
        text: fact.name,
        tags: [],
        value: "",
        negatedFacts: fact.negatedFacts
      })
    });
    
    questions.forEach(question => {
      const filteredOptions = questionOptions.filter(option => option.questionId == question.id);
      const filteredLabels = questionLabels.filter(label => label.questionId == question.id);
      var options = [];
      var labels = [];
      filteredOptions.forEach(option => {
        options.push({
          code: option.code,
          value: option.value,
          text: option.text,
          image: option.image,
          order: option.optionOrder,
          factId: option.factId
        })
      });
      filteredLabels.forEach(label => {
        labels.push(label.label)
      });

      if (question.type == "Theme") {
        const filteredFacts = facts.filter(fact => fact.theme == question.theme);
        filteredFacts.forEach((fact, index) => {
          options.push({
            code: fact.id.toString(),
            value: true,
            text: fact.name,
            order: index,
            factId: fact.id
          });
        });
      }
      questionExport.push({
        id: question.id,
        code: question.code,
        type: question.type,
        text: question.text,
        factSubject: question.factSubject,
        options: options,
        min: question.min,
        max: question.max,
        labels: labels
      })
    });

    rules.forEach(rule => {
      const filteredtests = ruleTests.filter(test => test.ruleId == rule.id);

      var tests = [];
      filteredtests.forEach(test => {
        tests.push({
          factId: test.factId,
          operation: test.operation,
          parameter: test.parameter
        })
      });

      ruleExport.push({
        id: rule.id,
        priority: rule.priority,
        triggerType: rule.triggerType,
        tests: tests,
        questionId: rule.questionId,
        factId: rule.factId,
        factAction: rule.factAction
      });
    });

    const exportData = JSON.stringify({
      facts: factExport,
      questions: questionExport,
      rules: ruleExport
    });

    // const supabase = createClient(
    //   "https://usqmtvptioodqnbokizz.supabase.co",
    //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjI1NDUwMDUyLCJleHAiOjE5NDEwMjYwNTJ9.XHUkRUAdDQ5UxsjB9ZyWnNZcf3h0B8kPHAqYkvRjqi8"
    // );
    //let { error } = await supabase.storage.from("personas").update("export.json", exportData);
    // console.log(error);
    res.status(200).json(exportData)
  }
}