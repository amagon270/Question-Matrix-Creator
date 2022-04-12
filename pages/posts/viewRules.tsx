import React from "react";
import {useState} from 'react'
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { Search } from '../../lib/search.js'
import { CreateRuleForm } from '../../lib/createRuleForm.jsx'
import { useRouter } from 'next/router';
import { Card, ListGroup, Button } from "react-bootstrap";

export async function getServerSideProps() {
  if (!global.themes || !global.facts || !global.questionTypes) {
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

export default function ViewRules({ questions, rules, ruleTests, ruleTriggers, ruleOperations, facts, themes }) {
  const [shownRules, setShownRules] = useState(rules);
  const [editRuleData, setEditRuleData] = useState(null);

  const router = useRouter();
  const refreshData = () => {router.reload()}

  const ruleHtml = [];
  if (editRuleData != null) { 
    ruleHtml.push(
      CreateRuleForm({
        ruleTriggers: ruleTriggers,
        ruleOperations: ruleOperations,
        questions: questions,
        facts: facts,
        themes: themes,
        ruleData: editRuleData,
        setRuleData: setEditRuleData, 
        formSubmit: updateRule
      })
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
        id: editRuleData.rule.id,
        code: event.target.code.value,
        trigger: event.target.triggers.value,
        priority: event.target.priority.value,
        questionAction: event.target.questions.value,
        factAction: event.target.facts.value,
        factActionValue: event.target.factValue.value,
        tests: editRuleData.tests
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PUT'
    })

    await res.json();

    const rule = rules.find(rule => rule.id == editRuleData.rule.id);
    rule.code = event.target.code.value;
    rule.trigger = event.target.triggers.value;
    rule.priority = event.target.priority.value;
    rule.questionAction = event.target.questions.value;
    rule.factAction = event.target.facts.value;
    rule.factActionValue = event.target.factValue.value;
    rule.tests = editRuleData.tests;
    setEditRuleData(null);
  }

  function pushEditRuleButton(event) {
    const newRule = rules.find(rule => rule.id == event.target.id.substring(4))
    const tests = ruleTests.filter(test => test.ruleId == newRule.id)
      .map((e,i) => {
        e.order = i;
        return e;
      })

    setEditRuleData({
      rule: newRule,
      numberOfTests: tests.length,
      tests: tests,
      submitLabel: "submit"
    })
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
    setEditRuleData(null);
  }

  function ruleViewLayout() {
    const layout = [];

    layout.push(
      <div key="Search">
        <>Search: </>
        {Search(rules, "code", setShownRules)}
      </div>
    );
    
    for (let i = 0; i < shownRules.length; i++) {
      const testOptions = [];

      const currentRuleTests = ruleTests.filter(test => test.ruleId == shownRules[i].id);
      for (let j = 0; j < currentRuleTests.length; j++) {
        testOptions.push(
          <div key={"test"+i+j}>
            {facts.find(fact => fact.id == currentRuleTests[j].factId).name}: {currentRuleTests[j].operation}: {currentRuleTests[j].parameter}<br/>
          </div>
        )
      }

      const actionQuestion = questions.find(q => q.id == shownRules[i].questionId).code;
      const actionFact = facts.find(f => f.id == shownRules[i].factId)?.name;

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