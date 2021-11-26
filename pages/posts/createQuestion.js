import React from "react";
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { useState } from 'react'
import { QuestionCreateLayout } from '../../lib/formFields.js'
import { useRouter } from 'next/router';

export async function getStaticProps(context) {
  const prisma = new PrismaClient();
  var themes = await prisma.theme.findMany();
  var questionTypes = await prisma.questionType.findMany();
  var facts = await prisma.fact.findMany()
  await prisma.$disconnect()

  return {
    props: {
      questionTypes,
      facts,
      themes
    }
  }
}

export default function CreateQuestion({ questionTypes, facts, themes }) {
  const [questionData, setQuestionData] = useState({labels: [], questionType: null, options: []});
  const optionQuestionTypes = ["MultipleChoice", "Polygon", "MultiPolygon", "MultipleSelect"];
  const sliderQuestionTypes = ["Slider", "TextSlider"];
  const numberOfOptions = 6;
  const router = useRouter();
  const refreshData = () => {router.reload()}

  return (
    <Layout>
      <p>Questions!!!</p>
      <br/>
      {Form()}
    </Layout>
  )

  function Form() {
    return (
      QuestionCreateLayout({
        facts: facts,
        questionTypes: questionTypes, 
        questionData: questionData,
        setQuestionData: setQuestionData,
        formSubmit: createQuestion,
        optionQuestionTypes: optionQuestionTypes,
        sliderQuestionTypes: sliderQuestionTypes,
        numberOfOptions: numberOfOptions,
        themes: themes
      })
    )
  }

  async function createQuestion (event) {
    event.preventDefault() // don't redirect the page
    const res = await fetch('/api/question', {
      body:  JSON.stringify({
        code: event.target.code.value,
        type: event.target.QuestionType.value,
        text: event.target.text.value,
        factSubject: questionData.chosenFact,
        options: questionData.options,
        min: event.target.min?.value,
        max: event.target.max?.value,
        labels: questionData.labels,
        theme: event.target.theme?.value,
        timer: event.target.timer.value
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })

    const result = await res.json();

    setQuestionData({labels: [], questionType: "", options: []})
    refreshData();
  }
}


