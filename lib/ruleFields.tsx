import React from "react";
import { makeDropdownable } from './utility'
import { Form, Button } from "react-bootstrap";
import { Card } from "reactstrap";

export function RuleFields(props) {
  const ruleTriggers = props.ruleTriggers;
  const ruleOperations = props.ruleOperations;
  const questions = props.questions;
  const facts = props.facts;
  const ruleData = props.ruleData;
  const setRuleData = props.setRuleData;
  const formSubmit = props.formSubmit;
  ruleData.testFacts ??= {};
  ruleData.testOperators ??= {};

  var testFields = [];
  for (var i = 0; i < ruleData.numberOfTests; i++) {
    testFields.push(Test(i, ruleData.tests[i]));
  }

  const firstRun = ruleData.firstRun ?? true;
  ruleData.firstRun = false;

  return (
    <Form onSubmit={formSubmit} key="RuleFields">
        <Form.Group controlId="code">
          <Form.Label>code</Form.Label>
          <Form.Control type="text" defaultValue={ruleData.rule?.code} required/>
        </Form.Group>

        Trigger Type
        {Dropdown("triggers", makeDropdownable(ruleTriggers, 'type', 'type'), ()=>{}, ruleData, setRuleData, "Trigger Type", ruleData.rule?.triggerType)}

        <Form.Group controlId="priority">
          <Form.Label>Priority</Form.Label>
          <Form.Control type="text" defaultValue={ruleData.rule?.priority} required/>
        </Form.Group>

        {testFields}
        <Button type="button" onClick={AddTest}>Add Test</Button>
        <Button type="button" onClick={RemoveTest}>Remove Test</Button>
        {Action()}

        <Button type="submit">{ruleData.submitLabel ?? "Create"}</Button>
      </Form>
  )

  function Test(order, data = null) {
    return (
      <Card key={"test"+order}>
        Fact
        {Dropdown(order+'-fact', makeDropdownable(facts, 'id', 'display', 'name'), handleTestFactOperationChange, ruleData, setRuleData, order+"TestFact", data?.factId)}
        Operator
        {Dropdown(order+'-operator', makeDropdownable(ruleOperations, 'type', 'type'), handleTestFactOperationChange, ruleData, setRuleData, order+"TestOperator", data?.operation)}
        <Form.Group controlId={order+'-parameter'}>
          <Form.Label>Parameter</Form.Label>
          <Form.Control 
            type="text" 
            defaultValue={data?.parameter}
            onChange={handleTestChange}
          />
        </Form.Group>
      </Card>
    )
  }

  function Action() {
    return (
      <>
        <h4>Action</h4>
        <label>Question</label>
        {Dropdown("questions", makeDropdownable(questions, 'id', 'code'), ()=>{}, ruleData, setRuleData, "actionQuestion", ruleData.rule?.questionId)}<br/>
        <label>Fact</label>
        {Dropdown("facts", makeDropdownable(facts, 'id', 'display', 'name'), ()=>{}, ruleData, setRuleData, "actionFact", ruleData.rule?.factId)}<br/>
        <Form.Group controlId='factValue'>
          <Form.Label>Fact Value</Form.Label>
          <Form.Control type="text" defaultValue={ruleData.rule?.factAction}/>
        </Form.Group>
      </>
    )
  }

  function AddTest() {
    ruleData.numberOfTests++;
    setRuleData({...ruleData});
  }

  function RemoveTest() {
    ruleData.tests.pop();
    ruleData.numberOfTests--;
    setRuleData({...ruleData});
  }

  function factField(searchedFacts) {
    ruleData.shownFacts = searchedFacts;
    setRuleData({...ruleData})
  }

  function clickFact(event) {
    ruleData.chosenFact = event.target.id.substring(5);
    setRuleData({...ruleData});
  }

  function questionField(searchedQuestions) {
    ruleData.shownQuestions = searchedQuestions;
    setRuleData({...ruleData})
  }

  function clickQuestion(event) {
    ruleData.chosenQuestion = event.target.id.substring(5);
    setRuleData({...ruleData});
  }

  function handleTestFactOperationChange(unused) {
    const keys = Object.keys(ruleData).filter((key) => {
      return key.includes("TestFact") || key.includes("TestOperator");
    });

    keys.forEach(key => {
      console.log(`${key} : ${ruleData[key]}`)
      handleTestChange({target: {id: key, value: ruleData[key].selectedValue}});
    })
  }

  function handleTestChange(event) {
    var testNumber = event.target.id.substring(0,1);
    console.log(event)

    var test = ruleData.tests.find(item => {
      return item.order.toString() == event.target.id.substring(0,1);
    });

    if (test == undefined) {
      test = {order: testNumber, factId: "", operation: "GreaterThan", parameter: ""};
      ruleData.tests.push(test);
      setRuleData({...ruleData})
    }

    if (event.target.id.includes("TestFact")) {
      test.factId = event.target.value;
    }
    if (event.target.id.includes("TestOperator")) {
      test.operation = event.target.value;
    }
    if (event.target.id.includes("parameter")) {
      test.parameter = event.target.value;
    }
  }
}