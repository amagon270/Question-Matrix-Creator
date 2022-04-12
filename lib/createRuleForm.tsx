import React from "react";
import { objectArrayToMap } from './utility';
import { Form, Button } from "react-bootstrap";
import { Card } from "reactstrap";
import Dropdown from "./dropdown";

export function CreateRuleForm(props) {
  const ruleTriggers = props.ruleTriggers;
  const ruleOperations = props.ruleOperations;
  const questions = props.questions;
  const facts = props.facts;
  const ruleData = props.ruleData;
  const setRuleData = props.setRuleData;
  const formSubmit = props.formSubmit;
  ruleData.testFacts ??= {};
  ruleData.testOperators ??= {};

  const testFields = [];
  for (let i = 0; i < ruleData.numberOfTests; i++) {
    testFields.push(Test(i, ruleData.tests[i]));
  }

  ruleData.firstRun = false;

  return (
    <Form onSubmit={formSubmit} key="RuleFields">
        <Form.Group controlId="code">
          <Form.Label>code</Form.Label>
          <Form.Control type="text" defaultValue={ruleData.rule?.code} required/>
        </Form.Group>

        Trigger Type
        {Dropdown("triggers", objectArrayToMap(ruleTriggers, 'type', 'type'), ()=>{}, ruleData, setRuleData, "Trigger Type", ruleData.rule?.triggerType)}

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
        {Dropdown(order+'-fact', objectArrayToMap(facts, 'id', 'display', 'name'), handleTestFactOperationChange, ruleData, setRuleData, order+"TestFact", data?.factId)}
        Operator
        {Dropdown(order+'-operator', objectArrayToMap(ruleOperations, 'type', 'type'), handleTestFactOperationChange, ruleData, setRuleData, order+"TestOperator", data?.operation)}
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
        {Dropdown("questions", objectArrayToMap(questions, 'id', 'code'), ()=>{}, ruleData, setRuleData, "actionQuestion", ruleData.rule?.questionId)}<br/>
        <label>Fact</label>
        {Dropdown("facts", objectArrayToMap(facts, 'id', 'display', 'name'), ()=>{}, ruleData, setRuleData, "actionFact", ruleData.rule?.factId)}<br/>
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
    const testNumber = event.target.id.substring(0,1);
    console.log(event)

    let test = ruleData.tests.find(item => {
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