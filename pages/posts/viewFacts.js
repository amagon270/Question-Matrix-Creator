import React from "react";
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'

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
  var factHtml = [];
  for (var i = 0; i < facts.length; i++) {
    factHtml.push(
      <>
        <b>Name: </b>{facts[i].name}<br/>
        <b>Type: </b>{facts[i].type}<br/>
        <br/>
      </>
    )
  }
  return (
    <Layout>
      <h2>View Facts</h2>
      {factHtml}
    </Layout>
  )
}