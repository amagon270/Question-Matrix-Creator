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
  var ruleActions = await prisma.ruleAction.findMany()
  var ruleTest = await prisma.ruleTest.findMany()
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
      ruleActions,
      ruleTest,
      ruleTests,
      ruleTriggers,
      ruleOperations,
      questions,
      facts
    }
  }
}

export default function ViewRules({ rules, ruleActions, ruleTest, ruleTests, ruleTriggers, ruleOperations, questions, facts }) {
  const [shownRules, setShownRules] = useState(rules);
  const [editRuleData, setEditRuleData] = useState(null)
  var database = {
    ruleTriggers: ruleTriggers,
    ruleOperations: ruleOperations,
    questions: questions,
    facts: facts
  }

  const router = useRouter();
  const refreshData = () => {
    router.reload();
    //router.replace(router.asPath);
  }

  var ruleHtml = [];
  if (editRuleData == null) { 
    for (var i = 0; i < shownRules.length; i++) {
      var testOptions = [];
      var actionOptions = [];

      var testIds = ruleTests.filter(e => e.ruleId == shownRules[i].id).map(e => e.testId)
      var currentRuleTests = ruleTest.filter(test => testIds.includes(test.id));
      for (var j = 0; j < currentRuleTests.length; j++) {
        testOptions.push(
          <div key={"test"+i+j}>
            {facts.find(fact => fact.id == currentRuleTests[j].factId).name}: {currentRuleTests[j].operation}: {currentRuleTests[j].parameter}<br/>
          </div>
        )
      }

      var currentRuleActions = ruleActions.filter(action => action.id == shownRules[i].action);
      for (var j = 0; j < currentRuleActions.length; j++) {
        actionOptions.push(
          <div key={"action"+i+j}>
            {facts.find(fact => fact.id == currentRuleActions[j].factId)?.name}: {currentRuleActions[j].factAction}: {questions.find(question => question.id == currentRuleActions[j].questionId)?.code} <br/>
          </div>
        )
      }
      ruleHtml.push(
        <div key={"rule"+i}>
          <b>Id: </b>{shownRules[i].id}<br/>
          <b>Priority: </b>{shownRules[i].priority}<br/>
          <b>Trigger: </b>{shownRules[i].triggerType}<br/>
          <b>Tests</b>
          {testOptions}
          <b>Action</b>
          {actionOptions}
          <button id={"edit"+shownRules[i].id} type="button" onClick={pushEditRuleButton}>Edit</button><br/>
          <br/>
        </div>
      )
    }
  } else {
    ruleHtml.push(RuleFields(database, editRuleData, setEditRuleData, updateRule))
  }
  return (
    <Layout>
      <h2>View Rules</h2>
      {Search(rules, "triggerType", setShownRules)}
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
    var testIds = ruleTests.filter(e => e.ruleId == newRule.id).map((e) => e.testId);
    var tests = ruleTest.filter(test => {
      return testIds.includes(test.id)
    }).map((e,i) => {
      e.order = i;
      return e;
    })
    var action = ruleActions.find(e => e.id == newRule.action)
    setEditRuleData({
      rule: newRule,
      action: action,
      numberOfTests: tests.length,
      tests: tests,
      submitLabel: "submit"
    })
    console.log(editRuleData);
  }
}