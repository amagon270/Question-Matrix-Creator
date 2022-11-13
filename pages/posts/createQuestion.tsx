import React from "react";
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { useState } from 'react'
import CreateQuestionForm from "../../lib/createQuestionForm";
import { Matrix } from "../../types/matrix";

export async function getServerSideProps() {
  if (!global.themes || !global.facts || !global.questionTypes) {
    const prisma = new PrismaClient();
    global.themes = await prisma.theme.findMany();
    global.facts = await prisma.fact.findMany()
    global.questionTypes = await prisma.questionType.findMany()
    await prisma.$disconnect()
  }

  const themes = global.themes;
  const facts = global.facts;
  const questionTypes = global.questionTypes;

  return {
    props: {
      facts,
      questionTypes,
      themes
    }
  }
}

type Props = {
  facts: Matrix.Fact[],
  questionTypes: Matrix.QuestionType[],
  themes: Matrix.Theme[]
}

export default function CreateQuestion(props: Props) {
  const [questionData, setQuestionData] = useState<Matrix.Question>(Matrix.blankQuestion);

  return (
    <Layout>
      <p>Questions!!!</p>
      <br/>
      {Form()}
    </Layout>
  )

  function Form() {
    return (
      <CreateQuestionForm
        allFacts={props.facts}
        allQuestionTypes={props.questionTypes} 
        question={questionData}
        setQuestion={setQuestionData}
        submit={createQuestion}
        allThemes={props.themes}
        submitButtonLabel={"Create Question"}
      />
    )
  }

  async function createQuestion (event) {
    event.preventDefault() // don't redirect the page
    const res = await fetch('/api/question', {
      body:  JSON.stringify({
        code: event.target.code.value,
        type: event.target.QuestionType.value,
        text: event.target.text.value,
        // factSubject: questionData.chosenFact,
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

    await res.json();

    setQuestionData({
      id: 0,
      code: "",
      text: "",
      factSubject: "",
      type: "",
      min: 0,
      max: 0,
      theme: 0,
      options: [],
      labels: [],
    })
  }
}


