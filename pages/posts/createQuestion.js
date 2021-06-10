import React from "react";
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { useState } from 'react'
import utilStyles from '../../styles/utils.module.css'
import { QuestionOption } from '../../lib/classes.js'
import { Dropdown } from '../../lib/formFields.js'
import { makeDropdownable } from '../../lib/utility'

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
  const [questionType, setQuestionType] = useState("TextOnly");
  const [questionlabels, setquestionlabels] = useState([]);

  var optionQuestionTypes = ["MultipleChoice", "Polygon", "MultiPolygon", "MultipleSelect"];
  var numberOfOptions = 6;
  var options = [];

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
  if (questionType == "Slider") {
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
  
  var optionFields = [];
  if (optionQuestionTypes.includes(questionType)) {
    for (var i = 0; i < numberOfOptions; i++) {
      optionFields.push(QuestionOptionField(i));
    }
  }
  
  return (
    <Layout>
      <p>Questions!!!</p>
      <br/>
      {Form()}
    </Layout>
  )

  function Form() {
    return (
      <form onSubmit={registerUser}>
        <label htmlFor="code">Description </label>
        <input id="code" type="text" autoComplete="description" required/><br/>
  
        <label htmlFor="type">Type </label>
        {Dropdown("QuestionType", makeDropdownable(questionTypes, 'type', 'type'), handleQuestionTypeChange)}<br/>
  
        <label htmlFor="facts">Fact </label>
        {Dropdown("Facts", makeDropdownable(facts, 'id', 'name'))}<br/>
  
        <label htmlFor="text">Text </label>
        <input id="text" type="text" autoComplete="display" required/><br/>
  
        {minMax}

        {optionFields}
  
        <button type="submit">Create</button>
      </form>
    )
  }

  function QuestionOptionField(order) {
    return (
      <>
        <h4>Option {order+1}</h4>
        <label htmlFor={order+"-description"}>Description </label>
        <input id={order+"-description"} type="text" onChange={handleQuestionOptionChange} /><br/>

        <label htmlFor={order+"-text"}>Text </label>
        <input id={order+"-text"} type="text" onChange={handleQuestionOptionChange} /><br/>

        <label htmlFor={order+"-image"}>Image </label>
        <input id={order+"-image"} type="text" onChange={handleQuestionOptionChange} /><br/>
      </>
    )
  }

  async function registerUser (event) {
    event.preventDefault() // don't redirect the page
    console.log(options);
    const res = await fetch('/api/createQuestion', {
      body:  JSON.stringify({
        code: event.target.code.value,
        type: event.target.QuestionType.value,
        text: event.target.text.value,
        factSubject: event.target.Facts.value,
        options: options,
        min: event.target.min?.value,
        max: event.target.max?.value,
        labels: questionlabels
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })

    const result = await res.json();
  }

  function handleQuestionTypeChange(event) {
    var questionType = event.target.value;
    setQuestionType(questionType);

    if (questionType == "Slider" || questionType == "TextSlider") {
      setquestionlabels([""]);
    } else {
      setquestionlabels([]);
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
      options.push(option);
    }

    if (event.target.id.includes("description")) {
      option.code = event.target.value;
    }
    if (event.target.id.includes("text")) {
      option.text = event.target.value;
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


