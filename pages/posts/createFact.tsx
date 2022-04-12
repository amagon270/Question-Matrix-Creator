import React from "react";
import Layout from '../../components/layout'
import { useState } from 'react'
import CreateFactForm from "../../lib/createFactForm";
import { Matrix } from "../../types/matrix";
import { PrismaClient } from "@prisma/client";

export async function getServerSideProps() {
  if (!global.themes || !global.facts || !global.factTypes) {
    const prisma = new PrismaClient();
    global.themes = await prisma.theme.findMany();
    global.facts = await prisma.fact.findMany()
    global.factTypes = await prisma.factType.findMany()
    await prisma.$disconnect()
  }

  const themes = global.themes;
  const facts = global.facts;
  const factTypes = global.factTypes;

  return {
    props: {
      facts,
      factTypes,
      themes
    }
  }
}

type Props = {
  facts: Matrix.Fact[],
  factTypes: Matrix.FactType[],
  themes: Matrix.Theme[]
}

export default function CreateFact({facts, factTypes, themes}: Props) {
  const [fact, setFact] = useState<Matrix.Fact>({id: null, name: "", type: "", negatedFacts: [], theme: null, display: ""});

  return (
    <Layout>
      <p>Create a fact </p>
      <br/>
      <CreateFactForm
        fact={fact}
        setFact={setFact}
        submit={createFact} 
        allFactTypes={factTypes}
        allFacts={facts}
        allThemes={themes}
        submitButtonLabel={"create"}
      />
    </Layout>
  )

  async function createFact (event) {
    event.preventDefault() // don't redirect the page
    
    const res = await fetch('/api/fact', {
      body:  JSON.stringify({
        name: event.target.name.value,
        type: event.target.factType.value,
        theme: event.target.theme.value,
        negateFacts: fact.negatedFacts
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })

    await res.json();
  }
}