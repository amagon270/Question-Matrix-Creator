import React from "react";
import { useState } from 'react'
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { Search } from '../../lib/search'
import { Card, ListGroup, Button } from "react-bootstrap";
import CreateFactForm from "../../lib/createFactForm";
import { Matrix } from "../../types/matrix";


export async function getServerSideProps() {
  if (!global.themes || !global.facts || !global.factTypes) {
    const prisma = new PrismaClient();
    global.themes = await prisma.theme.findMany();
    global.facts = await prisma.fact.findMany();
    global.factTypes = await prisma.factType.findMany()
    await prisma.$disconnect()
  }

  const themes = global.themes;
  const facts = global.facts.sort((a, b) => a.id - b.id);
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

export default function ViewFacts(props: Props) {
  const [allFacts, setAllFacts] = useState<Matrix.Fact[]>(props.facts);
  const [shownFacts, setShownFacts] = useState<Matrix.Fact[]>(props.facts);
  const [editFact, setEditFact] = useState<Matrix.Fact | null>(null);

  return (
    <Layout>
      <h2>View Facts</h2>
      {editFact != null
        ? <CreateFactForm
          fact={editFact}
          setFact={setEditFact}
          submit={updateFact}
          allFactTypes={props.factTypes}
          allFacts={allFacts}
          allThemes={props.themes}
          submitButtonLabel={"update"}
        />
        : <div>
          <div key = "Search">
            Search:
            {Search(allFacts, "name", setShownFacts)}
          </div>
          {shownFacts.map((fact, index) => 
            <Card key={index}>
              <Card.Header>{fact.name}</Card.Header>
              <ListGroup>
                <ListGroup.Item>Type: {fact.type}</ListGroup.Item>
              </ListGroup>
              <Card.Body>
                <Button id={"edit"+fact.id} type="button" onClick={pushEditFactButton} className='mx-2'>Edit</Button>
                <Button id={"delete"+fact.id} type="button" onClick={pushDeleteFactButton}>Delete</Button>
              </Card.Body>
            </Card>
          )}
        </div>
      }
    </Layout>
  )

  async function updateFact(event) {
    event.preventDefault()
  
    const res = await fetch('/api/fact', {
      body:  JSON.stringify({
        id: editFact.id,
        name: event.target.name.value,
        type: event.target.factType.value,
        theme: event.target.theme.value,
        negateFacts: editFact.negatedFacts
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PUT'
    })

    await res.json();
    
    setAllFacts(allFacts.map(fact => (fact.id === editFact.id ? editFact : fact)));
    setShownFacts(shownFacts.map(fact => (fact.id === editFact.id ? editFact : fact)))
    setEditFact(null);
  }

  function pushEditFactButton(event) {
    const fact = allFacts.find(fact => fact.id == event.target.id.substring(4));
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

    await res.json();
    
    setEditFact(null);
  }
}