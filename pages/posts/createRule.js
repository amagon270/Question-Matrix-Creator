import React from "react";
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { useState } from 'react'
import utilStyles from '../../styles/utils.module.css'
import { RuleTest } from '../../lib/classes.js'
import { Dropdown } from '../../lib/formFields.js'
import { makeDropdownable } from '../../lib/utility'

export async function getStaticProps(context) {
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
  const [numberOfTests, setNumberOfTests] = useState(1);
  var tests = [];

  var testFields = [];
  for (var i = 0; i < numberOfTests; i++) {
    testFields.push(Test(i));
  }

  return (
    <Layout>
      <p>Rules made here</p><br/>
      {Form()}
    </Layout>
  )

  function Form() {
    return (
      <form onSubmit={registerRule}>
        <label htmlFor="code">code </label>
        <input id="code" type="text" autoComplete="description" required/><br/>

        <label>Trigger Type </label>
        {Dropdown("triggers", makeDropdownable(ruleTriggers, 'type', 'type'))}<br/>
        <label>Priority </label>
        <input id="priority" type="text" /><br/>
        {testFields}
        <button type="button" onClick={AddTest}>Add Test</button>
        <button type="button" onClick={RemoveTest}>Remove Test</button><br/>
        {Action()}

        <button type="submit">Create</button>
      </form>
    )
  }

  function Test(order) {
    return (
      <>
        <h4>Test {order+1}</h4>
        <label>Fact </label>
        {Dropdown(order+'-fact', makeDropdownable(facts, 'id', 'name'), handleTestChange)}<br/>
        <label>Operator </label>
        {Dropdown(order+'-operator', makeDropdownable(ruleOperations, 'type', 'type'), handleTestChange)}<br/>
        <label>Parameter </label>
        <input id={order+'-parameter'} type="text" onChange={handleTestChange}/><br/>
      </>
    )
  }

  function Action() {
    return (
      <>
        <h4>Action</h4>
        <label>Question</label>
        {Dropdown("questions", makeDropdownable(questions, 'id', 'code'))}<br/>
        <label>Fact</label>
        {Dropdown("facts", makeDropdownable(facts, 'id', 'name'))}<br/>
        <label>Fact Value </label>
        <input id='factValue' type="text"/><br/>
      </>
    )
  }

  function AddTest() {
    var i = numberOfTests + 1;
    setNumberOfTests(i);
  }

  function RemoveTest() {
    var i = numberOfTests - 1;
    setNumberOfTests(i);
  }

  function handleTestChange(event) {
    var testNumber = event.target.id.substring(0,1);

    var test = tests.find(item => {
      return item.order.toString() == event.target.id.substring(0,1);
    });

    if (test == undefined) {
      test = new RuleTest(testNumber, "", "", "");
      tests.push(test);
    }

    if (event.target.id.includes("fact")) {
      test.fact = event.target.value;
    }
    if (event.target.id.includes("operator")) {
      test.operator = event.target.value;
    }
    if (event.target.id.includes("parameter")) {
      test.parameter = event.target.value;
    }
  }

  async function registerRule (event) {
    event.preventDefault() // don't redirect the page
    const res = await fetch('/api/createRule', {
      body:  JSON.stringify({
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
      method: 'POST'
    })

    const result = await res.json();
  }
}