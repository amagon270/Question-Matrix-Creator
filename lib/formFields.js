import React from "react";
import { QuestionOption } from './classes.js'
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

export function QuestionFields(facts, questionTypes, questionType, questionLabels, options, setQuestionType, setQuestionLabels, setOptions, formSubmit, existingQuestion = null) {
  var optionQuestionTypes = ["MultipleChoice", "Polygon", "MultiPolygon", "MultipleSelect"];
  const sliderQuestions = ["Slider", "TextSlider"];
  var numberOfOptions = 6;

  var currentLabel;

  var optionFields = [];
  if (optionQuestionTypes.includes(questionType)) {
    for (var i = 0; i < numberOfOptions; i++) {
      optionFields.push(QuestionOptionField(i, options[i]));
    }
  }

  var labelFields = [];
  if (questionLabels.length > 0) {
    labelFields.push(
      <span key="label0">{questionLabels[0]}</span>
    )
    for (var i = 1; i < questionLabels.length; i++) {
      labelFields.push(
        <span key={"label"+i}> : {questionLabels[i]}</span>
      )
    }
  }

  var minMax;
  if (sliderQuestions.includes(questionType)) {
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

      <button type="submit">Create</button>
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
    var questionType = event.target.value;
    setQuestionType(questionType);

    if (questionType == "Slider" || questionType == "TextSlider") {
      setQuestionLabels([""]);
    } else {
      setQuestionLabels([]);
    }
  }

  function handleQuestionLabelChange(event) {
    currentLabel = event.target.value;
  }

  function handleQuestionOptionChange(event) {
    var optionNumber = event.target.id.substring(0,1);

    var option = options.find(item => {
      return item.order.toString() == event.target.id.substring(0,1);
    });

    if (option == undefined) {
      option = new QuestionOption(optionNumber, "", "", "");
      var newOptions = options;
      newOptions.push(option);
      setOptions(newOptions)
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
    var _labels = questionlabels;
    _labels.push(currentLabel ?? "");
    var labels = _labels.filter(item => {
      return item != "";
    });
    setquestionlabels(labels);
  }
}

export function RuleFields() {

}