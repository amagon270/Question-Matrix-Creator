import React from "react";
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { FactCreateLayout } from '../../lib/formFields.js'
import { useRouter } from 'next/router';
import { useState } from 'react'

export async function getStaticProps(context) {
  const prisma = new PrismaClient();
  var themes = await prisma.theme.findMany();
  var facts = await prisma.fact.findMany();
  var factTypes = await prisma.factType.findMany()
    .finally(async () => {
      await prisma.$disconnect()
    });
  return {
    props: {
      factTypes,
      facts,
      themes
    }
  }
}

export default function CreateFact({ factTypes, facts, themes }) {
  const [factState, setFactState] = useState({facts: facts})
  const router = useRouter();
  const refreshData = () => {router.reload()}

  return (
    <Layout>
      <p>Create a fact </p>
      <br/>
      {Form(factTypes)}
    </Layout>
  )

  function Form(factTypes) {
    return (
      FactCreateLayout({
        factState: factState,
        setFactState: setFactState,
        formSubmit: createFact, 
        factTypes: factTypes,
        themes: themes
      })
    )
  }

  async function createFact (event) {
    event.preventDefault() // don't redirect the page
    
    const res = await fetch('/api/fact', {
      body:  JSON.stringify({
        name: event.target.name.value,
        type: event.target.factType.value,
        theme: event.target.theme.value,
        negateFacts: factState.negateFacts
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })

    const result = await res.json();
    refreshData();
  }
}