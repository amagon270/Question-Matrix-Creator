import React from "react";
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { useState } from 'react'
import { QuestionFields } from '../../lib/formFields.js'
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
  const [questionlabels, setQuestionlabels] = useState([]);
  const [options, setOptions] = useState([]);
  
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
        questionType, 
        questionlabels, 
        options,
        setQuestionType,
        setQuestionlabels,
        setOptions,
        registerUser)
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
}


