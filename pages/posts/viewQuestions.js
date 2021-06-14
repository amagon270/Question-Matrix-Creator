import React from "react";
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'

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
  const sliderQuestions = ["Slider", "TextSlider"];
  const optionQuestions = ["MultipleChoice", "Polygon", "MultiPolygon", "MultipleSelect"];
  var questionHtml = [];
  for (var i = 0; i < questions.length; i++) {
    var sliderOptions = [];
    var optionOptions = [];
    if (optionQuestions.includes(questions[i].type)) {
      var currentQuestionOptions = questionOptions.filter(option => option.questionId == questions[i].id);
      for (var j = 0; j < currentQuestionOptions.length; j++) {
        optionOptions.push(
          <>
            {currentQuestionOptions[j].code}: {currentQuestionOptions[j].text}: {currentQuestionOptions[j].value}: {currentQuestionOptions[j].image}<br/>
          </>
        )
      }
    }

    if (sliderQuestions.includes(questions[i].type)) {
      var currentQuestionLabels = questionLabels.filter(label => label.questionId == questions[i].id);
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
        <b>Code: </b>{questions[i].code}<br/>
        <b>Text: </b>{questions[i].text}<br/>
        <b>Fact: </b>{facts.find(fact => fact.id == questions[i].factSubject)?.name ?? ""}<br/>
        <b>Type: </b>{questions[i].type}<br/>
        {sliderOptions}
        {optionOptions}
        <br/>
      </>
    )
  }
  return (
    <Layout>
      <h2>View Questions</h2>
      {questionHtml}
    </Layout>
  )
}