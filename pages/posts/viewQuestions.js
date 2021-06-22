import React, { useState } from "react";
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { Search } from '../../lib/search.js'

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();
  var questions = await prisma.question.findMany()
  var questionLabels = await prisma.questionLables.findMany()
  var questionOptions = await prisma.questionOptions.findMany()
  var facts = await prisma.fact.findMany()
  .finally(async () => {
    await prisma.$disconnect()
  });

  return {
    props: {
      questions,
      questionLabels,
      questionOptions,
      facts
    }
  }
}

export default function ViewQuestion({ questions, questionLabels, questionOptions, facts }) {
  const [shownQuestions, setShownQuestions] = useState(questions)
  const sliderQuestions = ["Slider", "TextSlider"];
  const optionQuestions = ["MultipleChoice", "Polygon", "MultiPolygon", "MultipleSelect"];
  var questionHtml = [];
  for (var i = 0; i < shownQuestions.length; i++) {
    var sliderOptions = [];
    var optionOptions = [];
    if (optionQuestions.includes(shownQuestions[i].type)) {
      var currentQuestionOptions = questionOptions.filter(option => option.questionId == shownQuestions[i].id);
      for (var j = 0; j < currentQuestionOptions.length; j++) {
        optionOptions.push(
          <>
            {currentQuestionOptions[j].code}: {currentQuestionOptions[j].text}: {currentQuestionOptions[j].value}: {currentQuestionOptions[j].image}<br/>
          </>
        )
      }
    }

    if (sliderQuestions.includes(shownQuestions[i].type)) {
      var currentQuestionLabels = questionLabels.filter(label => label.questionId == shownQuestions[i].id);
      for (var j = 0; j < currentQuestionLabels.length; j++) {
        sliderOptions.push(
          <>
            {currentQuestionLabels[j].label} <br/>
          </>
        )
      }
    }
    questionHtml.push(
      <>
        <b>Code: </b>{shownQuestions[i].code}<br/>
        <b>Text: </b>{shownQuestions[i].text}<br/>
        <b>Fact: </b>{facts.find(fact => fact.id == shownQuestions[i].factSubject)?.name ?? ""}<br/>
        <b>Type: </b>{shownQuestions[i].type}<br/>
        {sliderOptions}
        {optionOptions}
        <br/>
      </>
    )
  }
  return (
    <Layout>
      <h2>View Questions</h2>
      {Search(questions, "code", setShownQuestions)}
      {questionHtml}
    </Layout>
  )
}