import React from "react";
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { useState } from 'react'
import utilStyles from '../../styles/utils.module.css'
import { Dropdown } from '../../lib/formFields.js'
import { makeDropdownable } from '../../lib/utility'
import { RuleFields } from '../../lib/formFields.js'

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();

  var questions = await prisma.question.findMany();
  var facts = await prisma.fact.findMany();
  questions.unshift({id: 0, code: 'none', type: 'TextOnly'});
  facts.unshift({id: 0, name: "none", type: "bool"});

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
  var database = {
    ruleTriggers: ruleTriggers,
    ruleOperations: ruleOperations,
    questions: questions,
    facts: facts
  }

  return (
    <Layout>
      <p>Rules made here</p><br/>
      {Form()}
    </Layout>
  )

  function Form() {
    return (
      RuleFields(database, ruleData, setRuleData, registerRule)
    )
  }

  async function registerRule (event) {
    event.preventDefault() // don't redirect the page
    const res = await fetch('/api/rule', {
      body:  JSON.stringify({
        code: event.target.code.value,
        trigger: event.target.triggers.value,
        priority: event.target.priority.value,
        questionAction: event.target.questions.value,
        factAction: event.target.facts.value,
        factActionValue: event.target.factValue.value,
        tests: ruleData.tests
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })

    const result = await res.json();
  }
}