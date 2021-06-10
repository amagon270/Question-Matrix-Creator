import React from "react";
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { useState } from 'react'
import utilStyles from '../../styles/utils.module.css'

export async function getStaticProps(context) {
  const prisma = new PrismaClient();
  var questionTypes = await prisma.questionType.findMany()
  var facts = await prisma.fact.findMany()
  .finally(async () => {
    await prisma.$disconnect()
  });

  return {
    props: {
      questionTypes,
      facts
    }
  }
}

export default function CreateQuestion({ questionTypes, facts }) {
  const [sliderFields, setSliderFields] = useState(false);
  const [questionlabels, setquestionlabels] = useState([]);

  var questionTypeStrings = [];
  questionTypes.forEach(questionType => {
    questionTypeStrings.push(questionType.type);
  })
  var factStrings = [];
  facts.forEach(fact => {
    factStrings.push(fact.name);
  })
  var currentLabel = "";

  var labelFields = [];
  if (questionlabels.length > 0) {
    labelFields.push(
      <>{questionlabels[0]}</>
    )
    for (var i = 1; i < questionlabels.length; i++) {
      labelFields.push(
        <span> : {questionlabels[i]}</span>
      )
    }
  }

  var minMax;
  if (sliderFields === true) {
    console.log(labelFields);
    var temptext="hi\ntest"
    minMax = (
      <>
        <label htmlFor="min">Min </label>
        <input id="min" type="int" autoComplete="0" /><br/>

        <label htmlFor="max">Max </label>
        <input id="max" type="int" autoComplete="10" /><br/>
        
        <label>Labels </label>
        <textarea rows="3" onChange={handleQuestionLabelChange}/>
        <button type="button" onClick={submitQuestionLabel}>Add Label</button><br/>

        <div class={utilStyles.allowNewline}>{labelFields}</div><br/>
    </>
    )
  }
  return (
    <Layout>
      <p>Questions!!!</p>
      <br/>
      {Form(questionTypeStrings, factStrings)}
    </Layout>
  )
  
  function Form(questionTypes, facts) {
    const registerUser = async event => {
      event.preventDefault() // don't redirect the page
      
      const res = await fetch('/api/createQuestion', {
        body:  JSON.stringify({
          code: event.target.code.value,
          type: event.target.QuestionType.value,
          text: event.target.text.value,
          factSubject: event.target.Facts.value,
          options: event.target.name.value,
          min: event.target.min.value,
          max: event.target.max.value,
          labels: questionlabels
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      })
  
      const result = await res.json();
    }
  
    return (
      <form onSubmit={registerUser}>
        <label htmlFor="code">Description </label>
        <input id="code" type="text" autoComplete="description" required/><br/>
  
        <label htmlFor="type">Type </label>
        {Dropdown("QuestionType", questionTypes, handleQuestionTypeChange)}<br/>
  
        <label htmlFor="facts">Fact </label>
        {Dropdown("Facts", facts)}<br/>
  
        <label htmlFor="text">Text </label>
        <input id="text" type="text" autoComplete="display" required/><br/>
  
        {minMax}
  
        <button type="submit">Create</button>
      </form>
    )
  }

  function handleQuestionTypeChange(event) {
    var questionType = event.target.value;
    if (questionType == "Slider") {
      setSliderFields(true);
    } else {
      setSliderFields(false);
    }

    if (questionType == "Slider" || questionType == "TextSlider") {
      setquestionlabels([""]);
    } else {
      setquestionlabels([]);
    }
  }

  function handleQuestionLabelChange(event) {
    currentLabel = event.target.value;
  }

  function submitQuestionLabel() {
    var _labels = questionlabels;
    _labels.push(currentLabel ?? "");
    var labels = _labels.filter(item => {
      return item != "";
    });
    setquestionlabels(labels);
  }
  
  function Dropdown(fieldName, Labels, onChangeFunction) {
    const dropdownDisplay = [];
    Labels.forEach(questionType => {
      dropdownDisplay.push(
        <option value={questionType} key={questionType}>{questionType}</option>
      );
    });
    return (
      <select 
        id={fieldName} 
        name={fieldName} 
        onChange={onChangeFunction}
      >
        {dropdownDisplay}
      </select>
    )
  }
}


