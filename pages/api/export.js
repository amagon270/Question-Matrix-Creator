import { PrismaClient } from '@prisma/client'

export default async function handler(req, res) {
  const prisma = new PrismaClient();
  if (req.method === "GET") {
    try {
      await createJson();
    } catch(error) {
      console.log(error)
      res.status(500).json({ text: error })
    }
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
    const ruleTest = await prisma.ruleTest.findMany();
    const ruleTests = await prisma.ruleTests.findMany();
    const ruleAction = await prisma.ruleAction.findMany();

    facts.forEach(fact => {
      factExport.push({
        id: fact.id,
        text: fact.name,
        tags: [],
        value: ""
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
          order: option.optionOrder
        })
      });
      filteredLabels.forEach(label => {
        labels.push(label.label)
      });
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
      const listOfTests = ruleTests.filter(test => test.ruleId == rule.id).map(test => test.testId);
      const filteredtests = ruleTest.filter(test => {
        if (listOfTests.includes(test.id)) {
          return test;
        }
      });

      var tests = [];
      filteredtests.forEach(test => {
        tests.push({
          factId: test.factId,
          operation: test.operation,
          parameter: test.parameter
        })
      });

      const filteredAction = ruleAction.filter(action => action.id == rule.action);
      var action = {
        questionId: filteredAction.questionId,
        factId: filteredAction.factId,
        factAction: filteredAction.factAction
      };

      ruleExport.push({
        id: rule.id,
        priority: rule.priority,
        triggerType: rule.triggerType,
        tests: tests,
        action: action
      });
    });

    const exportData = JSON.stringify({
      facts: factExport,
      questions: questionExport,
      rules: ruleExport
    });
    res.status(200).json(exportData)
  }
}