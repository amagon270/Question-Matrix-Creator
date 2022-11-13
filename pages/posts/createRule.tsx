import React from "react";
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { useState } from 'react'
import { CreateRuleForm } from '../../lib/createRuleForm'
import { useRouter } from 'next/router';
import { Matrix } from "../../types/matrix";

export async function getServerSideProps() {
  if (!global.facts || !global.questions || !global.ruleOperations|| !global.ruleTriggers || !global.ruleTests) {
    const prisma = new PrismaClient();
    global.facts = await prisma.fact.findMany();
    global.questions = await prisma.question.findMany()
    global.ruleOperations = await prisma.ruleOperation.findMany()
    global.ruleTriggers = await prisma.ruleTrigger.findMany()
    global.ruleTests = await prisma.ruleTests.findMany()
    await prisma.$disconnect()
  }
  
  const facts = global.facts;
  const questions = global.questions;
  const ruleOperations = global.ruleOperations;
  const ruleTriggers = global.thruleTriggersemes;
  const ruleTests = global.ruleTests;

  return {
    props: {
      facts,
      questions,
      ruleOperations,
      ruleTriggers,
      ruleTests
    }
  }
}

type Props = {
  facts: Matrix.Fact[],
  questions: Matrix.Question[],
  ruleOperations: Matrix.RuleOperation[],
  ruleTriggers: Matrix.RuleTrigger[],
  ruleTests: Matrix.RuleTest[],
}

export default function CreateRule(props: Props) {
  const [ruleData, setRuleData] = useState<Matrix.Rule>(Matrix.blankRule)
  const [tests, setTests] = useState<Matrix.RuleTest[]>([])
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
      <CreateRuleForm
        allFacts={props.facts}
        allQuestions={props.questions}
        allRulesTriggers={props.ruleTriggers}
        allRuleOperations={props.ruleOperations}
        rule={ruleData}
        setRule={setRuleData} 
        tests={tests}
        setTests={setTests}
        submit={createRule}
        submitButtonLabel="Create Rule"
      />
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
        factAction: ruleData.factAction,
        factActionValue: event.target.factValue.value,
        tests: tests
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })

    await res.json();

    setRuleData(Matrix.blankRule)
    refreshData();
  }
}