import React, { useState } from "react";
import { useRouter } from 'next/router';
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { Search } from '../../lib/search.js'
import { QuestionCreateLayout } from '../../lib/formFields.js'

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
  const [editQuestionData, setEditQuestionData] = useState(null);
  const sliderQuestionTypes = ["Slider", "TextSlider"];
  const optionQuestionTypes = ["MultipleChoice", "Polygon", "MultiPolygon", "MultipleSelect"];
  const numberOfOptions = 6;
  var questionHtml = [];

  const router = useRouter();
  const refreshData = () => {
    router.reload();
  }

  if (editQuestionData != null) {
    questionHtml.push(
      QuestionCreateLayout({
        facts: facts,
        questionTypes: questionTypes, 
        questionData: editQuestionData,
        setQuestionData: setEditQuestionData,
        formSubmit: updateQuestion,
        existingQuestion: editQuestionData.question,
        optionQuestionTypes: optionQuestionTypes,
        sliderQuestionTypes: sliderQuestionTypes,
        numberOfOptions: numberOfOptions
      })
    )
  } else {
    questionHtml.push(...questionViewLayout());
  }
  return (
    <Layout>
      <h2>View Questions</h2>
      {questionHtml}
    </Layout>
  )

  async function updateQuestion(event) {
    event.preventDefault() // don't redirect the page
    const res = await fetch('/api/question', {
      body:  JSON.stringify({
        id: editQuestionData.question.id,
        code: event.target.code.value,
        type: event.target.QuestionType.value,
        text: event.target.text.value,
        factSubject: event.target.Facts.value,
        options: editQuestionData.options,
        min: event.target.min?.value,
        max: event.target.max?.value,
        labels: editQuestionData.labels
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PUT'
    })

    const result = await res.json();

    setEditQuestionData(null);
    refreshData();
  }

  function pushEditQuestionButton(event) {
    var newQuestion = questions.find(question => question.id == event.target.id.substring(4))
    console.log(questionOptions.filter(option => option.questionId == newQuestion.id))
    setEditQuestionData({
      question: newQuestion,
      type: newQuestion.type, 
      labels: questionLabels.filter(label => label.questionId == newQuestion.id).map(label => label.label),
      options: questionOptions.filter(option => option.questionId == newQuestion.id).sort((a, b) => a.optionOrder-b.optionOrder),
      submitLabel: "submit"
    })
  }

  function questionViewLayout() {
    var layout = [];
    layout.push(Search(questions, "code", setShownQuestions));

    for (var i = 0; i < shownQuestions.length; i++) {
      var optionOptions = [];
      if (optionQuestionTypes.includes(shownQuestions[i].type)) {
        var currentQuestionOptions = 
          questionOptions.filter(option => option.questionId == shownQuestions[i].id)
          .sort((a, b) => a.optionOrder - b.optionOrder);
          
        for (var j = 0; j < currentQuestionOptions.length; j++) {
          optionOptions.push(
            <div key={"QuestionOptions"+j}>
              {currentQuestionOptions[j].code}: {currentQuestionOptions[j].text}: {currentQuestionOptions[j].value}: {currentQuestionOptions[j].image}<br/>
            </div>
          )
        }
      }

      var sliderOptions = [];
      if (sliderQuestionTypes.includes(shownQuestions[i].type)) {
        var currentQuestionLabels = questionLabels.filter(label => label.questionId == shownQuestions[i].id);
        sliderOptions.push(<div key="min"><b>Min: </b>{shownQuestions[i].min}</div>);
        sliderOptions.push(<div key="max"><b>Max: </b>{shownQuestions[i].max}</div>);
        for (var j = 0; j < currentQuestionLabels.length; j++) {
          sliderOptions.push(
            <div key={"sliderOptions"+j}>
              {currentQuestionLabels[j].label} <br/>
            </div>
          )
        }
      }
      layout.push(
        <div key={"Question"+i}>
          <b>Code: </b>{shownQuestions[i].code}<br/>
          <b>Type: </b>{shownQuestions[i].type}<br/>
          <b>Text: </b>{shownQuestions[i].text}<br/>
          <b>Fact: </b>{facts.find(fact => fact.id == shownQuestions[i].factSubject)?.name ?? ""}<br/>
          {sliderOptions}
          {optionOptions}
          <button id={"edit"+shownQuestions[i].id} type="button" onClick={pushEditQuestionButton}>Edit</button><br/>
          <br/>
        </div>
      )
    }
    return layout;
  }
}