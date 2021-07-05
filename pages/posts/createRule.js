import React from "react";
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { useState } from 'react'
import { RuleFields } from '../../lib/formFields.js'

export async function getStaticProps(context) {
  const prisma = new PrismaClient();

  var questions = await prisma.question.findMany();
  var facts = await prisma.fact.findMany();
  questions.unshift({id: null, code: null, type: 'TextOnly'});
  facts.unshift({id: null, name: null, type: "bool"});

  var ruleTriggers = await prisma.ruleTrigger.findMany();
  var ruleOperations = await prisma.ruleOperation.findMany()
  .finally(async () => {
    await prisma.$disconnect()
  });

  return {
    props: {
      ruleTriggers,
      ruleOperations,
      questions,
      facts
    }
  }
}

export default function CreateRule({ ruleTriggers, ruleOperations, questions, facts }) {
  const [ruleData, setRuleData] = useState({numberOfTests: 0, tests: []})
  const refreshData = () => {router.reload()}

  return (
    <Layout>
      <p>Rules made here</p><br/>
      {Form()}
    </Layout>
  )

  function Form() {
    return (
      RuleFields({
        ruleTriggers: ruleTriggers,
        ruleOperations: ruleOperations,
        questions: questions,
        facts: facts,
        ruleData: ruleData,
        setRuleData: setRuleData, 
        formSubmit: createRule
      })
    )
  }

  async function createRule (event) {
    event.preventDefault() // don't redirect the page
    const res = await fetch('/api/rule', {
      body:  JSON.stringify({
        code: event.target.code.value,
        trigger: event.target.triggers.value,
        priority: event.target.priority.value,
        questionAction: event.target.questions.value,
        factAction: ruleData.chosenFact,
        factActionValue: event.target.factValue.value,
        tests: ruleData.tests
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })

    const result = await res.json();

    setRuleData({numberOfTests: 0, tests: []})
    refreshData();
  }
}