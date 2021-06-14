import React from "react";
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();
  var rules = await prisma.rule.findMany()
  var ruleActions = await prisma.ruleAction.findMany()
  var ruleTest = await prisma.ruleTest.findMany()
  var ruleTests = await prisma.ruleTests.findMany()
  var questions = await prisma.question.findMany()
  var facts = await prisma.fact.findMany()
  .finally(async () => {
    await prisma.$disconnect()
  });

  return {
    props: {
      rules,
      ruleActions,
      ruleTest,
      ruleTests,
      questions,
      facts
    }
  }
}

export default function ViewRules({ rules, ruleActions, ruleTest, ruleTests, questions, facts }) {
  var questionHtml = [];
  for (var i = 0; i < rules.length; i++) {
    var testOptions = [];
    var actionOptions = [];

    var currentRuleTests = ruleTest.filter(test => test.id == ruleTests.find(test => test.ruleId == rules[i].id)?.testId);
    for (var j = 0; j < currentRuleTests.length; j++) {
      testOptions.push(
        <>
          {facts.find(fact => fact.id == currentRuleTests[j].factId).name}: {currentRuleTests[j].operation}: {currentRuleTests[j].parameter}<br/>
        </>
      )
    }

    var currentRuleActions = ruleActions.filter(action => action.id == rules[i].action);
    for (var j = 0; j < currentRuleActions.length; j++) {
      actionOptions.push(
        <>
          {facts.find(fact => fact.id == currentRuleActions[j].factId)?.name}: {currentRuleActions[j].factAction}: {questions.find(question => question.id == currentRuleActions[j].questionId)?.code} <br/>
        </>
      )
    }
    questionHtml.push(
      <>
        <b>Id: </b>{rules[i].id}<br/>
        <b>Priority: </b>{rules[i].priority}<br/>
        <b>Trigger: </b>{rules[i].triggerType}<br/>
        {testOptions}
        {actionOptions}
        <br/>
      </>
    )
  }
  return (
    <Layout>
      <h2>View Rules</h2>
      {questionHtml}
    </Layout>
  )
}