import React from "react";
import {useState} from 'react'
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { Search } from '../../lib/search.js'
import { RuleFields } from '../../lib/formFields.js'
import { useRouter } from 'next/router';
import { Card, ListGroup, Button } from "react-bootstrap";

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();
  var rules = await prisma.rule.findMany()
  var ruleTests = await prisma.ruleTests.findMany()
  var questions = await prisma.question.findMany()
  var facts = await prisma.fact.findMany()
  questions.unshift({id: 0, code: 'none', type: 'TextOnly'});
  facts.unshift({id: 0, name: "none", type: "bool"});
  var ruleTriggers = await prisma.ruleTrigger.findMany();
  var ruleOperations = await prisma.ruleOperation.findMany()
  .finally(async () => {
    await prisma.$disconnect()
  });

  return {
    props: {
      rules,
      ruleTests,
      ruleTriggers,
      ruleOperations,
      questions,
      facts
    }
  }
}

export default function ViewRules({ rules, ruleTests, ruleTriggers, ruleOperations, questions, facts }) {
  const [shownRules, setShownRules] = useState(rules);
  const [editRuleData, setEditRuleData] = useState(null);

  const router = useRouter();
  const refreshData = () => {router.reload()}

  var ruleHtml = [];
  if (editRuleData != null) { 
    ruleHtml.push(
      RuleFields({
        ruleTriggers: ruleTriggers,
        ruleOperations: ruleOperations,
        questions: questions,
        facts: facts,
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

    const result = await res.json();

    refreshData();
    setEditRuleData(null);
  }

  function pushEditRuleButton(event) {
    var newRule = rules.find(rule => rule.id == event.target.id.substring(4))
    var tests = ruleTests.filter(test => test.ruleId == newRule.id)
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

    const result = await res.json();

    refreshData();
    setEditRuleData(null);
  }

  function ruleViewLayout() {
    var layout = [];

    layout.push(
      <div key="Search">
        <>Search: </>
        {Search(rules, "triggerType", setShownRules)}
      </div>
    );
    
    for (var i = 0; i < shownRules.length; i++) {
      var testOptions = [];

      var currentRuleTests = ruleTests.filter(test => test.ruleId == shownRules[i].id);
      for (var j = 0; j < currentRuleTests.length; j++) {
        testOptions.push(
          <div key={"test"+i+j}>
            {facts.find(fact => fact.id == currentRuleTests[j].factId).name}: {currentRuleTests[j].operation}: {currentRuleTests[j].parameter}<br/>
          </div>
        )
      }

      layout.push(
        <Card key={"rule"+i}>
          <Card.Header>{shownRules[i].code}</Card.Header>
          <ListGroup>
            <ListGroup.Item>Priority: {shownRules[i].priority}</ListGroup.Item>
            <ListGroup.Item>Trigger: {shownRules[i].triggerType}</ListGroup.Item>
            <ListGroup.Item>Tests</ListGroup.Item>
            {/* {testOptions} */}
            <ListGroup.Item>Action</ListGroup.Item>
            <ListGroup.Item>Question: {shownRules[i].questionId}</ListGroup.Item>
            <ListGroup.Item>Fact: {shownRules[i].factId}</ListGroup.Item>
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