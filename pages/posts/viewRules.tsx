import React from "react";
import {useState} from 'react'
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { Search } from '../../lib/search.js'
import { CreateRuleForm } from '../../lib/createRuleForm.jsx'
import { useRouter } from 'next/router';
import { Card, ListGroup, Button } from "react-bootstrap";
import { Matrix } from "../../types/matrix";

export async function getServerSideProps() {
  if (!global.questions || !global.rules || !global.ruleTests || !global.ruleTriggers || !global.ruleOperations || !global.facts || !global.themes) {
    const prisma = new PrismaClient();
    global.questions = await prisma.question.findMany();
    global.rules = await prisma.rule.findMany()
    global.ruleTests = await prisma.ruleTests.findMany()
    global.ruleTriggers = await prisma.ruleTrigger.findMany()
    global.ruleOperations = await prisma.ruleOperation.findMany()
    global.facts = await prisma.fact.findMany()
    global.themes = await prisma.theme.findMany()
    await prisma.$disconnect()
  }

  const questions = global.questions;
  const rules = global.rules;
  const ruleTests = global.ruleTests;
  const ruleTriggers = global.ruleTriggers;
  const ruleOperations = global.ruleOperations;
  const facts = global.facts;
  const themes = global.themes;

  return {
    props: {
      questions,
      rules,
      ruleTests,
      ruleTriggers,
      ruleOperations,
      facts,
      themes
    }
  }
}

type Props = {
  questions: Matrix.Question[],
  rules: Matrix.Rule[],
  ruleTests: Matrix.RuleTest[],
  ruleTriggers: Matrix.RuleTrigger[],
  ruleOperations: Matrix.RuleOperation[],
  facts: Matrix.Fact[],
  themes: Matrix.Theme[],
}

export default function ViewRules(props: Props) {
  const [shownRules, setShownRules] = useState<Matrix.Rule[]>(props.rules);
  const [ruleData, setRuleData] = useState<Matrix.Rule>(null)
  const [tests, setTests] = useState<Matrix.RuleTest[]>([])

  const router = useRouter();
  const refreshData = () => {router.reload()}

  const ruleHtml = [];
  if (ruleData != null) { 
    ruleHtml.push(
      <CreateRuleForm
        allFacts={props.facts}
        allQuestions={props.questions}
        allRulesTriggers={props.ruleTriggers}
        allRuleOperations={props.ruleOperations}
        rule={ruleData}
        setRule={setRuleData} 
        tests={tests}
        setTests={setTests}
        submit={updateRule}
        submitButtonLabel="Create Rule"
      />
    )
  } else {
    ruleHtml.push(...ruleViewLayout());
  }
  return (
    <Layout>
      <h2>View Rules</h2>
      {ruleHtml}
    </Layout>
  )

  async function updateRule (event) {
    event.preventDefault() // don't redirect the page
    const res = await fetch('/api/rule', {
      body:  JSON.stringify({
        id: ruleData.id,
        code: event.target.code.value,
        trigger: event.target.triggers.value,
        priority: event.target.priority.value,
        questionAction: event.target.questions.value,
        factAction: event.target.facts.value,
        factActionValue: event.target.factValue.value,
        tests: tests
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PUT'
    })

    await res.json();

    setRuleData(null);
  }

  function pushEditRuleButton(event) {
    const newRule = props.rules.find(rule => rule.id == event.target.id.substring(4));
    const tests = props.ruleTests.filter(test => test.ruleId == newRule.id);

    setRuleData(newRule);
    setTests(tests);
  }

  async function pushDeleteRuleButton(event) {
    event.preventDefault() // don't redirect the page
    const res = await fetch('/api/rule', {
      body:  JSON.stringify({
        id: event.target.id.substring(6),
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'DELETE'
    })

    await res.json();

    refreshData();
    setRuleData(null);
  }

  function ruleViewLayout() {
    const layout = [];

    layout.push(
      <div key="Search">
        <>Search: </>
        {Search(props.rules, "code", setShownRules)}
      </div>
    );
    
    for (let i = 0; i < shownRules.length; i++) {
      const testOptions = [];

      const currentRuleTests = props.ruleTests.filter(test => test.ruleId == shownRules[i].id);
      for (let j = 0; j < currentRuleTests.length; j++) {
        testOptions.push(
          <div key={"test"+i+j}>
            {props.facts.find(fact => fact.id == currentRuleTests[j].factId).name}: {currentRuleTests[j].operation}: {currentRuleTests[j].parameter}<br/>
          </div>
        )
      }

      const actionQuestion = props.questions.find(q => q.id == shownRules[i].questionId).code;
      const actionFact = props.facts.find(f => f.id == shownRules[i].factId)?.name;

      layout.push(
        <Card key={"rule"+i}>
          <Card.Header>{shownRules[i].code}</Card.Header>
          <ListGroup>
            <ListGroup.Item>Priority: {shownRules[i].priority}</ListGroup.Item>
            <ListGroup.Item>Trigger: {shownRules[i].triggerType}</ListGroup.Item>
            {/* <ListGroup.Item>Tests</ListGroup.Item> */}
            {/* {testOptions} */}
            <ListGroup.Item>Action</ListGroup.Item>
            <ListGroup.Item>Question: {actionQuestion}</ListGroup.Item>
            <ListGroup.Item>Fact: {actionFact}</ListGroup.Item>
            <ListGroup.Item>Fact Value: {shownRules[i].factAction}</ListGroup.Item>
          </ListGroup>
          <Card.Body>
            <Button id={"edit"+shownRules[i].id} type="button" onClick={pushEditRuleButton} className='mx-2'>Edit</Button>
            <Button id={"delete"+shownRules[i].id} type="button" onClick={pushDeleteRuleButton}>Delete</Button>
          </Card.Body>
        </Card>
      )
    }
    return(layout);
  }
}