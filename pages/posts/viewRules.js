import React from "react";
import {useState} from 'react'
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { Search } from '../../lib/search.js'
import { RuleFields } from '../../lib/formFields.js'
import { useRouter } from 'next/router';

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
  const refreshData = () => {
    router.reload();
  }

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

  function pushDeleteRuleButton(event) {
    console.log("Not yet Implemented")
  }

  function ruleViewLayout() {
    var layout = [];

    layout.push(Search(rules, "triggerType", setShownRules));
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
        <div key={"rule"+i}>
          <b>Code: </b>{shownRules[i].code}<br/>
          <b>Priority: </b>{shownRules[i].priority}<br/>
          <b>Trigger: </b>{shownRules[i].triggerType}<br/>
          <b>Tests</b>
          {testOptions}
          <b>Action</b><br/>
          <b>Question: </b>{shownRules[i].questionId}<br/>
          <b>Fact: </b>{shownRules[i].factId}<br/>
          <b>Fact Value: </b>{shownRules[i].factAction}<br/>
          <button id={"edit"+shownRules[i].id} type="button" onClick={pushEditRuleButton}>Edit</button>
          <button id={"delete"+shownRules[i].id} type="button" onClick={pushDeleteRuleButton}>Delete</button><br/>
          <br/>
        </div>
      )
    }
    return(layout);
  }
}