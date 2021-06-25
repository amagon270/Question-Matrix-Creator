import React from "react";
import { QuestionOption, RuleTest } from './classes.js'
import { makeDropdownable } from './utility'
import utilStyles from '../styles/utils.module.css'
import { Search } from "./search.js";

export function Dropdown(fieldName, Labels, onChangeFunction, defaultValue = null) {
  const dropdownDisplay = [];
  Labels.forEach((label, id) => {
    dropdownDisplay.push(
      <option value={id} key={id}>{label}</option>
    );
  });
  return (
    <select 
      id={fieldName} 
      name={fieldName} 
      onChange={onChangeFunction}
      defaultValue={defaultValue}
    >
      {dropdownDisplay}
    </select>
  )
}

export function FactCreateLayout(props) {
  const formSubmit = props.formSubmit;
  const factTypes = props.factTypes;
  var existingFact = props.existingFact;
  const submitButtonLabel = props.submitButtonLabel ?? "Create";

  return (
    <form onSubmit={formSubmit} key="createFact">
      <label htmlFor="name">Name </label>
      <input id="name" type="text" defaultValue={existingFact?.name} required /><br/>
      {Dropdown("factType", makeDropdownable(factTypes, 'type', 'type'), ()=>{}, existingFact?.type)}<br/>
      <button type="submit">{submitButtonLabel}</button>
    </form>
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
          <span key={"label"+i}> : {questionData.labels[i]}</span>
        )
      }
    }
    
    sliderFields = (
      <>
        <label htmlFor="min">Min </label>
        <input id="min" type="int" defaultValue={questionData.question?.min} autoComplete="0" /><br/>

        <label htmlFor="max">Max </label>
        <input id="max" type="int" defaultValue={questionData.question?.max} autoComplete="10" /><br/>
        
        <label>Labels </label>
        <textarea rows="3" onChange={handleQuestionLabelChange}/>
        <button type="button" onClick={submitQuestionLabel}>Add Label</button>
        <button type="button" onClick={removeQuestionLabel}>remove Label</button><br/>

        <div className={utilStyles.allowNewline}>{labelFields}</div><br/>
    </>
    )
  }

  return(
    <form onSubmit={formSubmit} key="questionFields">
      <label htmlFor="code">Description </label>
      <input id="code" type="text" defaultValue={existingQuestion?.code} required/><br/>

      <label htmlFor="type">Type </label>
      {Dropdown("QuestionType", makeDropdownable(questionTypes, 'type', 'type'), handleQuestionTypeChange, existingQuestion?.type)}<br/>

      <label htmlFor="facts">Fact </label>
      {Search(facts, "name", factField)}
      {questionData.shownFacts}
      <br/>

      <label htmlFor="text">Text </label>
      <input id="text" type="text" defaultValue={existingQuestion?.text} required/><br/>

      {sliderFields}
      {optionFields}

      <button type="submit">{questionData.submitLabel ?? "Create"}</button>
    </form>
  )

  function factField(searchedFacts) {
    var newLine = 0;
    var totalFacts = 0;
    questionData.shownFacts = [];
    searchedFacts.forEach(fact => {
      if (totalFacts < 20) {
        questionData.shownFacts.push(
          <button id={"fact-"+fact.id} type="button" onClick={clickFact}>{fact.name} </button>
        )
        newLine++;
        if (newLine > 4) {
          questionData.shownFacts.push(<br/>);
          newLine = 0;
        }
      }
    })
    setQuestionData({...questionData});
  }

  function clickFact(event) {
    questionData.chosenFact = event.target.id.substring(5);
    setQuestionData({...questionData});
  }

  function QuestionOptionField(order, existingData = null) {
    return (
      <div key={"option"+order}>
        <h4>Option {order+1}</h4>

        <label htmlFor={order+"-description"}>Description </label>
        <input 
          num = {order}
          id={order+"-description"} 
          type="text" 
          defaultValue={existingData?.code} 
          onChange={handleQuestionOptionChange} 
        /><br/>

        <label htmlFor={order+"-text"}>Text </label>
        <input 
          num = {order}
          id={order+"-text"} 
          type="text" 
          defaultValue={existingData?.text} 
          onChange={handleQuestionOptionChange} 
        /><br/>

        <label htmlFor={order+"-value"}>value </label>
        <input 
          num = {order}
          id={order+"-value"} 
          type="text" 
          defaultValue={existingData?.value} 
          onChange={handleQuestionOptionChange} 
        /><br/>

        <label htmlFor={order+"-image"}>Image </label>
        <input 
          num = {order}
          id={order+"-image"} 
          type="text" 
          defaultValue={existingData?.image} 
          onChange={handleQuestionOptionChange} 
        /><br/>
      </div>
    )
  }

  function handleQuestionTypeChange(event) {
    questionData.type = event.target.value;
    setQuestionData({...questionData});
  }

  function handleQuestionOptionChange(event) {
    //Trying out custom attribute in input tag
    var optionNumber = event.target.attributes.num.value;

    //find existing option
    var option = questionData.options.find(item => {
      //console.log(item);
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
  const existingRule = props.existingRule;

  var testFields = [];
  for (var i = 0; i < ruleData.numberOfTests; i++) {
    testFields.push(Test(i, ruleData.tests[i]));
  }

  return (
    <form onSubmit={formSubmit} key="RuleFields">
      <label htmlFor="code">code </label>
      <input id="code" type="text" defaultValue={ruleData.rule?.code} required/><br/>

      <label>Trigger Type </label>
      {Dropdown("triggers", makeDropdownable(ruleTriggers, 'type', 'type'), ()=>{}, ruleData.rule?.triggerType)}<br/>
      <label>Priority </label>
      <input id="priority" type="text" defaultValue={ruleData.rule?.priority} /><br/>
      {testFields}
      <button type="button" onClick={AddTest}>Add Test</button>
      <button type="button" onClick={RemoveTest}>Remove Test</button><br/>
      {Action()}

      <button type="submit">Create</button>
    </form>
  )

  function Test(order, data = null) {
    return (
      <div key={"test"+order}>
        <h4>Test {order+1}</h4>
        <label>Fact </label>
        {Dropdown(order+'-fact', makeDropdownable(facts, 'id', 'name'), handleTestChange, data?.factId)}<br/>
        <label>Operator </label>
        {Dropdown(order+'-operator', makeDropdownable(ruleOperations, 'type', 'type'), handleTestChange, data?.operation)}<br/>
        <label>Parameter </label>
        <input id={order+'-parameter'} type="text" defaultValue={data?.parameter} onChange={handleTestChange}/><br/>
      </div>
    )
  }

  function Action() {
    return (
      <>
        <h4>Action</h4>
        <label>Question</label>
        {Dropdown("questions", makeDropdownable(questions, 'id', 'code'), ()=>{}, ruleData.rule?.questionId)}<br/>
        <label>Fact</label>
        {Dropdown("facts", makeDropdownable(facts, 'id', 'name'), ()=>{}, ruleData.rule?.factId)}<br/>
        <label>Fact Value </label>
        <input id='factValue' type="text" defaultValue={ruleData.rule?.factAction}/><br/>
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