import React from "react";
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { FactFields } from '../../lib/formFields.js'

export async function getStaticProps(context) {
  const prisma = new PrismaClient();
  var factTypes = await prisma.factType.findMany()
    .finally(async () => {
      await prisma.$disconnect()
    });
  return {
    props: {
      factTypes
    }
  }
}

export default function CreateFact({ factTypes }) {
  return (
    <Layout>
      <p>We are here to create a fact </p>
      <br/>
      {Form(factTypes)}
    </Layout>
  )
}

function Form(factTypes) {
  const registerUser = async event => {
    event.preventDefault() // don't redirect the page
    
    const res = await fetch('/api/fact', {
      body:  JSON.stringify({
        name: event.target.name.value,
        type: event.target.factType.value
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })

    const result = await res.json();
  }

  return (
    FactFields(registerUser, factTypes)
  )
}