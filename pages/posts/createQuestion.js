import React from "react";
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { useState } from 'react'
import { QuestionFields } from '../../lib/formFields.js'
import { makeDropdownable } from '../../lib/utility'

export async function getServerSideProps(context) {
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
  const [questionData, setQuestionData] = useState({labels: [], type: "", options: []});
  
  return (
    <Layout>
      <p>Questions!!!</p>
      <br/>
      {Form()}
    </Layout>
  )

  function Form() {
    return (
      QuestionFields(
        facts,
        questionTypes, 
        questionData,
        setQuestionData,
        registerUser)
    )
  }

  async function registerUser (event) {
    event.preventDefault() // don't redirect the page
    const res = await fetch('/api/question', {
      body:  JSON.stringify({
        code: event.target.code.value,
        type: event.target.QuestionType.value,
        text: event.target.text.value,
        factSubject: event.target.Facts.value,
        options: questionData.options,
        min: event.target.min?.value,
        max: event.target.max?.value,
        labels: questionData.labels
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })

    const result = await res.json();
  }
}


