import React from "react";
import { QuestionOption, RuleTest } from './classes.js'
import { makeDropdownable } from './utility'
import utilStyles from '../styles/utils.module.css'

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

export function FactFields(formSubmit, factTypes, existingFact = null, submitButtonLabel = "Create") {
  return (
    <form onSubmit={formSubmit} key="createFact">
      <label htmlFor="name">Name </label>
      <input id="name" type="text" defaultValue={existingFact?.name} required /><br/>
      {Dropdown("factType", makeDropdownable(factTypes, 'type', 'type'), ()=>{}, existingFact?.type)}<br/>
      <button type="submit">{submitButtonLabel}</button>
    </form>
  )
}

export function QuestionFields(facts, questionTypes, questionData, setQuestionData, formSubmit, existingQuestion = null) {
  var optionQuestionTypes = ["MultipleChoice", "Polygon", "MultiPolygon", "MultipleSelect"];
  const sliderQuestionTypes = ["Slider", "TextSlider"];
  var numberOfOptions = 6;

  var currentLabel;

  var optionFields = [];
  if (optionQuestionTypes.includes(questionData.type)) {
    for (var i = 0; i < numberOfOptions; i++) {
      optionFields.push(QuestionOptionField(i, questionData.options[i]));
      if (questionData.options.find(option => option.optionOrder == i) == null) {
        questionData.options.push(new QuestionOption(i, "", "", ""))
      }
    }
  }

  var labelFields = [];
  console.log(questionData.labels)
  if (questionData.labels.length > 0) {
    labelFields.push(
      <span key="label0">{questionData.labels[0]}</span>
    )
    for (var i = 1; i < questionData.labels.length; i++) {
      labelFields.push(
        <span key={"label"+i}> : {questionData.labels[i]}</span>
      )
    }
  }

  var minMax;
  if (sliderQuestionTypes.includes(questionData.type)) {
    minMax = (
      <>
        <label htmlFor="min">Min </label>
        <input id="min" type="int" autoComplete="0" /><br/>

        <label htmlFor="max">Max </label>
        <input id="max" type="int" autoComplete="10" /><br/>
        
        <label>Labels </label>
        <textarea rows="3" onChange={handleQuestionLabelChange}/>
        <button type="button" onClick={submitQuestionLabel}>Add Label</button><br/>

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
      {Dropdown("Facts", makeDropdownable(facts, 'id', 'name'), ()=>{}, existingQuestion?.factSubject)}<br/>

      <label htmlFor="text">Text </label>
      <input id="text" type="text" defaultValue={existingQuestion?.text} required/><br/>

      {minMax}

      {optionFields}

      <button type="submit">{questionData.submitLabel ?? "Create"}</button>
    </form>
  )

  function QuestionOptionField(order, data = null) {
    return (
      <div key={"option"+order}>
        <h4>Option {order+1}</h4>
        <label htmlFor={order+"-description"}>Description </label>
        <input id={order+"-description"} type="text" defaultValue={data?.code} onChange={handleQuestionOptionChange} /><br/>

        <label htmlFor={order+"-text"}>Text </label>
        <input id={order+"-text"} type="text" defaultValue={data?.text} onChange={handleQuestionOptionChange} /><br/>

        <label htmlFor={order+"-value"}>value </label>
        <input id={order+"-value"} type="text" defaultValue={data?.value} onChange={handleQuestionOptionChange} /><br/>

        <label htmlFor={order+"-image"}>Image </label>
        <input id={order+"-image"} type="text" defaultValue={data?.image} onChange={handleQuestionOptionChange} /><br/>
      </div>
    )
  }

  function handleQuestionTypeChange(event) {
    questionData.type = event.target.value;

    if (sliderQuestionTypes.includes(questionData.type)) {
      questionData.labels = [""];
    } else {
      questionData.labels = [];
    }
    setQuestionData({...questionData});
  }

  function handleQuestionLabelChange(event) {
    currentLabel = event.target.value;
  }

  function handleQuestionOptionChange(event) {
    var optionNumber = event.target.id.substring(0,1);

    var option = questionData.options.find(item => {
      return item.optionOrder.toString() == event.target.id.substring(0,1);
    });

    if (option == undefined) {
      option = new QuestionOption(optionNumber, "", "", "");
      var newOptions = questionData.options;
      newOptions.push(option);
      questionData.options = newOptions;
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

  function submitQuestionLabel() {
    console.log(currentLabel)
    var _labels = questionData.labels;
    if (currentLabel != null) {
      _labels.push(currentLabel);
    }
    questionData.labels = _labels
    setQuestionData({...questionData});
  }
}

export function RuleFields(database, ruleData, setRuleData, formSubmit, existingRule = null) {
  const ruleTriggers = database.ruleTriggers;
  const ruleOperations = database.ruleOperations;
  const questions = database.questions;
  const facts = database.facts

  console.log(ruleData);
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
        {Dropdown("questions", makeDropdownable(questions, 'id', 'code'), ()=>{}, ruleData.action?.questionId)}<br/>
        <label>Fact</label>
        {Dropdown("facts", makeDropdownable(facts, 'id', 'name'), ()=>{}, ruleData.action?.factId)}<br/>
        <label>Fact Value </label>
        <input id='factValue' type="text" defaultValue={ruleData.action?.factAction}/><br/>
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