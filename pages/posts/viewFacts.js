import React from "react";
import { useState } from 'react'
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { Search } from '../../lib/search.js'

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();
  var facts = await prisma.fact.findMany()
  .finally(async () => {
    await prisma.$disconnect()
  });

  return {
    props: {
      facts
    }
  }
}

export default function ViewFacts({ facts }) {
  const [shownFacts, setShownFacts] = useState(facts);
  var factHtml = [];
  for (var i = 0; i < shownFacts.length; i++) {
    factHtml.push(
      <>
        <b>Name: </b>{shownFacts[i].name}<br/>
        <b>Type: </b>{shownFacts[i].type}<br/>
        <button id={"edit"+shownFacts[i].id} type="button">Edit</button><br/>
        <br/>
      </>
    )
  }
  return (
    <Layout>
      <h2>View Facts</h2>
      {Search(facts, "name", searchCallback)}
      {factHtml}
    </Layout>
  )

  function searchCallback(data) {
    setShownFacts(data);
  }
}