import React from "react";
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { useState } from 'react'
import { CreateRuleForm } from '../../lib/createRuleForm.jsx'
import { useRouter } from 'next/router';

export async function getServerSideProps() {
  if (!global.facts || !global.questions || !global.ruleOperations|| !global.ruleTriggers) {
    const prisma = new PrismaClient();
    global.facts = await prisma.fact.findMany();
    global.questions = await prisma.question.findMany()
    global.ruleOperations = await prisma.ruleOperation.findMany()
    global.ruleTriggers = await prisma.ruleTrigger.findMany()
    await prisma.$disconnect()
  }

  
  const facts = global.facts;
  const questions = global.questions;
  const ruleOperations = global.ruleOperations;
  const ruleTriggers = global.thruleTriggersemes;

  return {
    props: {
      facts,
      questions,
      ruleOperations,
      ruleTriggers
    }
  }
}

export default function CreateRule({ ruleTriggers, ruleOperations, questions, facts }) {
  const [ruleData, setRuleData] = useState({numberOfTests: 0, tests: []})
  const router = useRouter();
  const refreshData = () => {router.reload()}

  return (
    <Layout>
      <p>Rules made here</p><br/>
      {Form()}
    </Layout>
  )

  function Form() {
    return (
      CreateRuleForm({
        ruleTriggers: ruleTriggers,
        ruleOperations: ruleOperations,
        questions: questions,
        facts: facts,
        ruleData: ruleData,
        setRuleData: setRuleData, 
        formSubmit: createRule,
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
        // factAction: ruleData.chosenFact,
        factActionValue: event.target.factValue.value,
        tests: ruleData.tests
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })

    await res.json();

    setRuleData({numberOfTests: 0, tests: []})
    refreshData();
  }
}