import React from "react";
import { useState } from 'react'
import { QuestionOption, RuleTest } from './classes.js'
import { makeDropdownable } from './utility'
import utilStyles from '../styles/utils.module.css'
import { SearchButtonMatrix } from "./search.js";
import { Form, Button, FloatingLabel } from "react-bootstrap";
import { Card } from "reactstrap";

export function Dropdown(fieldName, labels, onChangeFunction, state, setState, name, defaultValue = null) {
  state[name] ??= {selectedValue: defaultValue};
  const search = state[name].search;
  const selectedValue = state[name].selectedValue;
  const visibility = state[name].visibility;
  const filteredLabels = new Map([...labels].filter(([id, label]) => label?.toLowerCase()?.includes(search ?? "")))

  const dropdownDisplay = [];
  filteredLabels.forEach((label, id) => {
    dropdownDisplay.push(
      <li key={id}>
        <Button 
        className="dropdown-item" 
        type="button" 
        onClick={() => {
          onChangeFunction(id);
          state[name].selectedValue = id;
          setState({...state});
        }}>
           {label}
        </Button>
      </li>
    );
  });

  return (
    <div className="dropdown" key={fieldName}>
      <Button
        className="btn"
        type="button"
        id={fieldName}
        value={selectedValue ?? ""}
        onClick={() => {
          state[name].visibility = !state[name].visibility;
          setState({...state});
      }}>
        {labels.get(selectedValue)}
      </Button>
      {visibility ?
      <ul>
        <li>
          <input 
            key="DropdownSearch" 
            id="dropdownSearch" 
            type="text" 
            onChange={(event) => {
              state[name].search = event.target.value;
              setState({...state});
            }}>
          </input>
        </li>
        {dropdownDisplay}
      </ul> : null
      }
    </div>
  )
}

export function FactCreateLayout(props) {
  const factState = props.factState;
  const setFactState = props.setFactState;
  const formSubmit = props.formSubmit;
  const factTypes = props.factTypes;
  var existingFact = props.existingFact;
  const submitButtonLabel = props.submitButtonLabel ?? "Create";
  const facts = factState.facts;

  factState.negateFacts ??= [];
  console.log(factState.negateFacts);

  var negateFactFields = [];
  for (var i = 0; i < factState.negateFacts.length; i++) {
    const index = i;
    negateFactFields.push(
      Dropdown(
        i+"Fact",
        makeDropdownable(facts, 'id', 'name'),
        (id)=>{setNegateFact(id, index)},
        factState, setFactState,
        i+"negateFacts",
        existingFact?.negateFacts[i]
      )
    );
  }

  function setNegateFact(id, index) {
    factState.negateFacts[index] = id
  }

  function AddNegateFact() {
    factState.negateFacts.push("");
    setFactState({...factState});
  }

  function RemoveNegateFact() {
    factState.negateFacts.pop();
    setFactState({...factState});
  }

  return (
    <Form onSubmit={formSubmit} key="createFact">
      <Form.Group controlId="name">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          defaultValue={existingFact?.name}
          required
        />
      </Form.Group>
      Fact Types
      {Dropdown("factType", makeDropdownable(factTypes, 'type', 'type'), ()=>{}, factState, setFactState, "factFormFactType", existingFact?.type)}

      {negateFactFields}
      <Button type="button" onClick={AddNegateFact}>Add Test</Button>
      <Button type="button" onClick={RemoveNegateFact}>Remove Test</Button>
      <br/>

      <Button type="submit">{submitButtonLabel}</Button>
    </Form>
  )
}

export function ThemeCreateLayout(props) {
  const themeState = props.themeState;
  const setThemeState = props.setThemeState;
  const formSubmit = props.formSubmit;
  var existingTheme = props.existingTheme;
  const submitButtonLabel = props.submitButtonLabel ?? "Create";

  return (
    <Form onSubmit={formSubmit} key="createTheme">
      <Form.Group controlId="name">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          defaultValue={existingTheme?.name}
          required
        />
      </Form.Group>
      <Button type="submit">{submitButtonLabel}</Button>
    </Form>
  )
}

export function QuestionCreateLayout(props) {
  const facts = props.facts;
  const questionTypes = props.questionTypes;
  const questionData = props.questionData ?? {};
  const setQuestionData = props.setQuestionData;
  const formSubmit = props.formSubmit;
  const existingQuestion = props.existingQuestion;
  const optionQuestionTypes = props.optionQuestionTypes;
  const sliderQuestionTypes = props.sliderQuestionTypes;
  const numberOfOptions = props.numberOfOptions;

  questionData.chosenFact ??= existingQuestion?.factSubject ?? 0;
  const existingFact = facts.find(fact => fact.id == questionData.chosenFact)?.name

  const firstRun = questionData.firstRun ?? true;
  questionData.firstRun = false;

  //used to store the currently typed label before it is saved
  var currentLabel;

  var optionFields = [];
  //if this question type needs options
  if (optionQuestionTypes.includes(questionData.type)) {
    for (var i = 0; i < numberOfOptions; i++) {
      optionFields.push(QuestionOptionField(i, questionData.options[i]));
      if (questionData.options.find(option => option.optionOrder == i) == null) {
        questionData.options.push(new QuestionOption(i, "", "", ""))
      }
    }
  }

  var sliderFields;
  //if this questions type needs slider fields
  if (sliderQuestionTypes.includes(questionData.type)) {
    var labelFields = [];
    if (questionData.labels.length > 0) {
      for (var i = 0; i < questionData.labels.length; i++) {
        labelFields.push(
          <Card key={"label"+i}>
              {questionData.labels[i]}
          </Card>
        )
      }
    }
    
    sliderFields = (
      <>
        <Form.Group controlId="min">
          <Form.Label>Min</Form.Label>
          <Form.Control 
            type="int" 
            defaultValue={questionData.question?.min} 
          />
        </Form.Group>

        <Form.Group controlId="max">
          <Form.Label>Max</Form.Label>
          <Form.Control 
            type="int" 
            defaultValue={questionData.question?.max} 
          />
        </Form.Group>
        
        <label>Labels </label>
        <Form.Control
          as="textarea"
          style={{ height: '100px' }}
          onChange={handleQuestionLabelChange}
        />
        <Button type="button" onClick={submitQuestionLabel}>Add Label</Button>
        <Button type="button" onClick={removeQuestionLabel}>remove Label</Button><br/>

        <div className={utilStyles.allowNewline}>{labelFields}</div><br/>
    </>
    )
  }

  return(
    <Form onSubmit={formSubmit} key="questionFields">
      <Form.Group controlId="code">
        <Form.Label>code</Form.Label>
        <Form.Control type="text" defaultValue={existingQuestion?.code} required/>
      </Form.Group>

      Type
      {Dropdown("QuestionType", makeDropdownable(questionTypes, 'type', 'type'), handleQuestionTypeChange, questionData, setQuestionData, "questionType", existingQuestion?.type)}

      <Form.Group controlId="text">
        <Form.Label>Text</Form.Label>
        <Form.Control type="text" defaultValue={existingQuestion?.text} required/>
      </Form.Group>

      Fact: {existingFact} <br/>
      {Dropdown("QuestionFact", makeDropdownable(facts, 'id', 'name'), ()=>{}, questionData, setQuestionData, "questionFact", existingQuestion?.fact)}
      {questionData.shownFacts}<br/>
      <br/>

      {sliderFields}
      {optionFields}

      <Button type="submit">{questionData.submitLabel ?? "Create"}</Button>
    </Form>
  )

  function setFactField(searchedFacts) {
    questionData.shownFacts = searchedFacts;
    setQuestionData({...questionData})
  }

  function clickFact(event) {
    questionData.chosenFact = event.target.id.substring(5);
    setQuestionData({...questionData});
  }

  function QuestionOptionField(order, existingData = null) {
    return (
      <div key={"option"+order}>
        <h4>Option {order+1}</h4>

        <Form.Group controlId={order+"-description"}>
          <Form.Label>Description</Form.Label>
          <Form.Control 
            num = {order}
            type="text" 
            defaultValue={existingData?.code} 
            onChange={handleQuestionOptionChange} 
          />
        </Form.Group>

        <Form.Group controlId={order+"-text"}>
          <Form.Label>Text</Form.Label>
          <Form.Control 
            num = {order}
            type="text" 
            defaultValue={existingData?.text} 
            onChange={handleQuestionOptionChange} 
          />
        </Form.Group>

        <Form.Group controlId={order+"-value"}>
          <Form.Label>value</Form.Label>
          <Form.Control 
            num = {order}
            type="text" 
            defaultValue={existingData?.value} 
            onChange={handleQuestionOptionChange} 
          />
        </Form.Group>

        <Form.Group controlId={order+"-Image"}>
          <Form.Label>Image</Form.Label>
          <Form.Control 
            num = {order}
            type="text" 
            defaultValue={existingData?.Image} 
            onChange={handleQuestionOptionChange} 
          />
        </Form.Group>

        {Dropdown(
          "Fact",
           makeDropdownable(facts, 'id', 'name'),
          (id)=>{handleQuestionOptionChange({target: {value: id, id: order+"fact", attributes: {num: {value: order}}}})},
          questionData, setQuestionData,
          order+"questionOptionFact",
          existingData?.factId
        )}

      </div>
    )
  }

  function handleQuestionTypeChange(type) {
    questionData.type = type;
    setQuestionData({...questionData});
  }

  function handleQuestionOptionChange(event) {
    //Trying out custom attribute in input tag
    var optionNumber = event.target.attributes.num.value;

    //find existing option
    var option = questionData.options.find(item => {
      return item.optionOrder?.toString() == optionNumber;
    });

    //if option doesn't exist create it
    if (option == undefined) {
      option = new QuestionOption(optionNumber, "", "", "");
      questionData.options.push(option);
      setQuestionData({...questionData});
    }

    if (event.target.id.includes("description")) {
      option.code = event.target.value;
    }
    if (event.target.id.includes("text")) {
      option.text = event.target.value;
    }
    if (event.target.id.includes("value")) {
      option.value = event.target.value;
    }
    if (event.target.id.includes("image")) {
      option.image = event.target.value;
    }
    if (event.target.id.includes("fact")) {
      option.fact = event.target.value;
    }
  }

  //every character typed in label field
  function handleQuestionLabelChange(event) {
    currentLabel = event.target.value;
  }

  //when the add label button is pushed
  function submitQuestionLabel() {
    if (currentLabel != null) {
      questionData.labels.push(currentLabel);
    }
    setQuestionData({...questionData});
  }

  function removeQuestionLabel() {
    questionData.labels.pop();
    setQuestionData({...questionData});
  }
}

export function RuleFields(props) {
  const ruleTriggers = props.ruleTriggers;
  const ruleOperations = props.ruleOperations;
  const questions = props.questions;
  const facts = props.facts;
  const ruleData = props.ruleData;
  const setRuleData = props.setRuleData;
  const formSubmit = props.formSubmit;

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
        {Dropdown(order+'-fact', makeDropdownable(facts, 'id', 'name'), handleTestChange, ruleData, setRuleData, order+"TestFact", data?.factId)}
        Operator
        {Dropdown(order+'-operator', makeDropdownable(ruleOperations, 'type', 'type'), handleTestChange, ruleData, setRuleData, order+"TestOperator", data?.operation)}
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
        {Dropdown("facts", makeDropdownable(facts, 'id', 'name'), ()=>{}, ruleData, setRuleData, "actionFact", ruleData.rule?.factId)}<br/>
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

  function handleTestChange(event) {
    var testNumber = event.target.id.substring(0,1);

    var test = ruleData.tests.find(item => {
      return item.order.toString() == event.target.id.substring(0,1);
    });

    if (test == undefined) {
      test = {order: testNumber, factId: "", operation: "GreaterThan", parameter: ""};
      ruleData.tests.push(test);
      setRuleData({...ruleData})
    }

    if (event.target.id.includes("fact")) {
      test.factId = event.target.value;
    }
    if (event.target.id.includes("operator")) {
      test.operation = event.target.value;
    }
    if (event.target.id.includes("parameter")) {
      test.parameter = event.target.value;
    }
  }
}