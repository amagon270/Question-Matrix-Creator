import React, { useState } from "react";
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { Search } from '../../lib/search.js'
import { QuestionFields } from '../../lib/formFields.js'

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();
  var questions = await prisma.question.findMany()
  var questionLabels = await prisma.questionLables.findMany()
  var questionOptions = await prisma.questionOptions.findMany()
  var facts = await prisma.fact.findMany()
  var questionTypes = await prisma.questionType.findMany()
  .finally(async () => {
    await prisma.$disconnect()
  });

  return {
    props: {
      questions,
      questionLabels,
      questionOptions,
      facts,
      questionTypes
    }
  }
}

export default function ViewQuestion({ questions, questionLabels, questionOptions, facts, questionTypes }) {
  const [shownQuestions, setShownQuestions] = useState(questions);
  const [editQuestion, setEditQuestion] = useState(null);
  const [editQuestionType, setEditQuestionType] = useState("TextOnly");
  const [editQuestionLabels, setEditQuestionLabels] = useState([]);
  const [options, setOptions] = useState([]);
  const sliderQuestions = ["Slider", "TextSlider"];
  const optionQuestions = ["MultipleChoice", "Polygon", "MultiPolygon", "MultipleSelect"];
  var questionHtml = [];

  console.log(editQuestion)
  if (editQuestion == null) {
    for (var i = 0; i < shownQuestions.length; i++) {
      var sliderOptions = [];
      var optionOptions = [];
      if (optionQuestions.includes(shownQuestions[i].type)) {
        var currentQuestionOptions = questionOptions.filter(option => option.questionId == shownQuestions[i].id);
        for (var j = 0; j < currentQuestionOptions.length; j++) {
          optionOptions.push(
            <div key={"QuestionOptions"+j}>
              {currentQuestionOptions[j].code}: {currentQuestionOptions[j].text}: {currentQuestionOptions[j].value}: {currentQuestionOptions[j].image}<br/>
            </div>
          )
        }
      }

      if (sliderQuestions.includes(shownQuestions[i].type)) {
        var currentQuestionLabels = questionLabels.filter(label => label.questionId == shownQuestions[i].id);
        for (var j = 0; j < currentQuestionLabels.length; j++) {
          sliderOptions.push(
            <div key={"sliderOptions"+j}>
              {currentQuestionLabels[j].label} <br/>
            </div>
          )
        }
      }
      questionHtml.push(
        <div key={"Question"+i}>
          <b>Code: </b>{shownQuestions[i].code}<br/>
          <b>Text: </b>{shownQuestions[i].text}<br/>
          <b>Fact: </b>{facts.find(fact => fact.id == shownQuestions[i].factSubject)?.name ?? ""}<br/>
          <b>Type: </b>{shownQuestions[i].type}<br/>
          {sliderOptions}
          {optionOptions}
          <button id={"edit"+shownQuestions[i].id} type="button" onClick={pushEditFactButton}>Edit</button><br/>
          <br/>
        </div>
      )
    }
  } else {
    questionHtml.push(QuestionFields(
      facts,
      questionTypes, 
      editQuestionType, 
      editQuestionLabels, 
      options, 
      setEditQuestionType,
      setEditQuestionLabels,
      setOptions,
      updateQuestion,
      editQuestion
    ))
  }
  return (
    <Layout>
      <h2>View Questions</h2>
      {Search(questions, "code", setShownQuestions)}
      {questionHtml}
    </Layout>
  )

  async function updateQuestion(event) {
    event.preventDefault() // don't redirect the page
    const res = await fetch('/api/createQuestion', {
      body:  JSON.stringify({
        id: editQuestion.id,
        code: event.target.code.value,
        type: event.target.QuestionType.value,
        text: event.target.text.value,
        factSubject: event.target.Facts.value,
        options: options,
        min: event.target.min?.value,
        max: event.target.max?.value,
        labels: editQuestionLabels
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PUT'
    })

    const result = await res.json();

    questions[questions.findIndex(e => e.id == editQuestion.id)] = editQuestion;
    questionLabels = questionLabels.map(e => {
      if (e.questionId != editQuestion.id) {
        return e;
      }
    })
    questionOptions = questionOptions.map(e => {
      if (e.questionId == editQuestion.id) {
        e = options.find(a => a.optionOrder == e.optionOrder)
      }
      return e;
    })
    setEditQuestion(null)
    setEditQuestionType("")
    setEditQuestionLabels([])
    setOptions([])
  }

  function pushEditFactButton(event) {
    var newQuestion = questions.find(question => question.id == event.target.id.substring(4))
    setEditQuestion(newQuestion)
    setEditQuestionType(newQuestion.type)
    setEditQuestionLabels(questionLabels.filter(label => label.questionId == newQuestion.id))
    setOptions(questionOptions.filter(option => option.questionId == newQuestion.id))
  }
}