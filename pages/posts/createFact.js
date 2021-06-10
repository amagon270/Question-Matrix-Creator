import React from "react";
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'

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
    
    const res = await fetch('/api/createFact', {
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
    <form onSubmit={registerUser}>
      <label htmlFor="name">Name </label>
      <input id="name" type="text" autoComplete="name" required /><br/>
      {Dropdown(factTypes)}
      <br/>
      <button type="submit">Create</button>
    </form>
  )
}

function Dropdown(factTypes) {
  const dropdownDisplay = [];
  factTypes.forEach(factType => {
    dropdownDisplay.push(
      <option value={factType.type}>{factType.type}</option>
    );
  });
  return (
    <select id="factType" name="type">
      {dropdownDisplay}
    </select>
  )
}