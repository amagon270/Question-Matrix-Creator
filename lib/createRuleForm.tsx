import React from "react";
import { objectArrayToMap } from './utility';
import { Form, Button } from "react-bootstrap";
import { Card } from "reactstrap";
import Dropdown from "./dropdown";
import { Matrix } from "../types/matrix";

export type Props = {
  allFacts: Matrix.Fact[],
  allQuestions: Matrix.Question[],
  allRulesTriggers: Matrix.RuleTrigger[],
  allRuleOperations: Matrix.RuleOperation[],
  rule: Matrix.Rule,
  setRule: (rule: Matrix.Rule) => void,
  tests: Matrix.RuleTest[],
  setTests: (tests: Matrix.RuleTest[]) => void,
  submit: (event) => void,
  submitButtonLabel?: string,
}

export function CreateRuleForm(props: Props) {

  const testFields = [];
  for (let i = 0; i < props.tests.length; i++) {
    testFields.push(Test(i, props.tests[i]));
  }

  return (
    <Form onSubmit={props.submit} key="RuleFields">
      <Form.Group controlId="code">
        <Form.Label>code</Form.Label>
        <Form.Control type="text" defaultValue={props.rule?.code} required/>
      </Form.Group>

      Trigger Type
      <Dropdown
        id={"triggers"}
        labels={objectArrayToMap(props.allRulesTriggers, 'type', 'type')}
        value={props.rule?.triggerType}
      />

      <Form.Group controlId="priority">
        <Form.Label>Priority</Form.Label>
        <Form.Control type="text" defaultValue={props.rule?.priority} required/>
      </Form.Group>

      {testFields}
      <Button type="button" onClick={AddTest}>Add Test</Button>
      <Button type="button" onClick={RemoveTest}>Remove Test</Button>
      {Action()}

      <Button type="submit">{props.submitButtonLabel ?? "Create"}</Button>
    </Form>
  )

  function Test(order, data: Matrix.RuleTest = null) {
    return (
      <Card key={"test"+order}>
        Fact
        <Dropdown
          id={order+'-fact'}
          labels={objectArrayToMap(props.allFacts, 'type', 'type')}
          onSelect={handleTestFactOperationChange}
          value={data.factId.toString()}
        />
        Operator
        <Dropdown
          id={order+'-operator'}
          labels={objectArrayToMap(props.allRuleOperations, 'type', 'type')}
          onSelect={handleTestFactOperationChange}
          value={data.operation}
        />
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
        <Dropdown
          id={"questions"}
          labels={objectArrayToMap(props.allQuestions, 'id', 'code')}
          value={props.rule?.questionId.toString()}
        />
        <label>Fact</label>
        <Dropdown
          id={"facts"}
          labels={objectArrayToMap(props.allFacts, 'id', 'display', 'name')}
          value={props.rule?.factId.toString()}
        />
        <Form.Group controlId='factValue'>
          <Form.Label>Fact Value</Form.Label>
          <Form.Control type="text" defaultValue={props.rule?.factAction}/>
        </Form.Group>
      </>
    )
  }

  function AddTest() {
    props.setTests([...props.tests, Matrix.blankRuleTest]);
  }

  function RemoveTest() {
    props.setTests([...props.tests.slice(0, props.tests.length - 1)]);
  }

  function handleTestFactOperationChange(event) {
    const keys = Object.keys(props.rule).filter((key) => {
      return key.includes("TestFact") || key.includes("TestOperator");
    });

    keys.forEach(key => {
      console.log(`${key} : ${props.rule[key]}`)
      handleTestChange({target: {id: key, value: props.rule[key].selectedValue}});
    })
  }

  function handleTestChange(event) {
    const testNumber = event.target.id.substring(0,1);
    console.log(event)

    const test = props.tests[testNumber];

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