import React from "react";
import { useState } from 'react'
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { Search } from '../../lib/search.js'
import { FactCreateLayout as FactCreateLayout } from '../../lib/formFields.js'
import { useRouter } from "next/router";
import { Card, ListGroup, Button } from "react-bootstrap";

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();
  var themes = await prisma.theme.findMany();
  var facts = await prisma.fact.findMany()
  var factTypes = await prisma.factType.findMany()
  .finally(async () => {
    await prisma.$disconnect()
  });

  return {
    props: {
      facts,
      factTypes,
      themes
    }
  }
}

export default function ViewFacts({ facts, factTypes, themes }) {
  const [shownFacts, setShownFacts] = useState(facts);
  const [editFact, setEditFact] = useState(null);

  const router = useRouter();
  const refreshData = () => {router.reload()}

  var factHtml = [];
  if (editFact != null) {
    factHtml.push(
      FactCreateLayout({
        factState: editFact,
        setFactState: setEditFact,
        formSubmit: updateFact,
        factTypes: factTypes,
        themes: themes,
        existingFact: editFact,
        submitButtonLabel: "save"
      })
    )
  } else {
    factHtml.push(...factViewLayout())
  }
  return (
    <Layout>
      <h2>View Facts</h2>
      {factHtml}
    </Layout>
  )

  async function updateFact(event) {
    event.preventDefault()
  
    const res = await fetch('/api/fact', {
      body:  JSON.stringify({
        id: editFact.id,
        name: event.target.name.value,
        type: event.target.factType.value,
        negateFacts: editFact.negateFacts
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PUT'
    })

    const result = await res.json();
    
    setEditFact(null);
    refreshData()
  }

  function pushEditFactButton(event) {
    var fact = facts.find(fact => fact.id == event.target.id.substring(4));
    fact.facts = facts;
    setEditFact(fact);

  }

  async function pushDeleteFactButton(event) {
    event.preventDefault()
    const res = await fetch('/api/fact', {
      body:  JSON.stringify({
        id: event.target.id.substring(6),
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'DELETE'
    })

    const result = await res.json();
    
    setEditFact(null);
    refreshData()
  }

  function factViewLayout() {
    var layout = [];

    //searchBar
    layout.push(
      <div key = "Search">
        <>Search: </>
        {Search(facts, "name", setShownFacts)}
      </div>
    );

    //facts
    for (var i = 0; i < shownFacts.length; i++) {
      layout.push(
        <Card key={i}>
          <Card.Header>{shownFacts[i].name}</Card.Header>
          <ListGroup>
            <ListGroup.Item>Type: {shownFacts[i].type}</ListGroup.Item>
          </ListGroup>
          <Card.Body>
            <Button id={"edit"+shownFacts[i].id} type="button" onClick={pushEditFactButton} className='mx-2'>Edit</Button>
            <Button id={"delete"+shownFacts[i].id} type="button" onClick={pushDeleteFactButton}>Delete</Button>
          </Card.Body>
        </Card>
      )
    }
    return layout;
  }
}