import React from "react";
import { useState } from 'react'
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { Search } from '../../lib/search.js'
import { FactFields } from '../../lib/formFields.js'

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();
  var facts = await prisma.fact.findMany()
  var factTypes = await prisma.factType.findMany()
  .finally(async () => {
    await prisma.$disconnect()
  });

  return {
    props: {
      facts,
      factTypes
    }
  }
}

export default function ViewFacts({ facts, factTypes }) {
  const [shownFacts, setShownFacts] = useState(facts);
  const [editFact, setEditFact] = useState(null);
  var factHtml = [];
  if (editFact == null) {
    factHtml.push(Search(facts, "name", searchCallback));
    for (var i = 0; i < shownFacts.length; i++) {
      factHtml.push(
        <div key={i}>
          <b>Name: </b>{shownFacts[i].name}<br/>
          <b>Type: </b>{shownFacts[i].type}<br/>
          <button id={"edit"+shownFacts[i].id} type="button" onClick={pushEditFactButton}>Edit</button><br/>
          <br/>
        </div>
      )
    }
  } else {
    factHtml.push(FactFields(editFactCallback, factTypes, editFact, "save"))
  }
  return (
    <Layout>
      <h2>View Facts</h2>
      {factHtml}
    </Layout>
  )

  function searchCallback(data) {
    setShownFacts(data);
  }

  async function editFactCallback(event) {
    event.preventDefault()
  
    const res = await fetch('/api/fact', {
      body:  JSON.stringify({
        id: editFact.id,
        name: event.target.name.value,
        type: event.target.factType.value
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PUT'
    })

    const result = await res.json();
    editFact.name = event.target.name.value;
    editFact.type = event.target.factType.value
    setEditFact(null);
  }

  function pushEditFactButton(event) {
    setEditFact(facts.find(fact => fact.id == event.target.id.substring(4)))
  }
}