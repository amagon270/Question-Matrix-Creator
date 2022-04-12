import Head from 'next/head'
import Layout, {siteTitle} from '../components/layout'
import Link from 'next/link'
import * as React from 'react'

import { getSortedPostsData } from '../lib/posts'

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css"
        integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l"
        crossOrigin="anonymous"
      />
      <Link href='posts/createFact'>
        <a>Create a Fact</a>
      </Link><br/>
      <Link href='posts/createQuestion'>
        <a>Create a Question</a>
      </Link><br/>
      <Link href='posts/createRule'>
        <a>Create a Rule</a>
      </Link><br/>
      <Link href='posts/viewFacts'>
        <a>View Facts</a>
      </Link><br/>
      <Link href='posts/viewQuestions'>
        <a>View Questions</a>
      </Link><br/>
      <Link href='posts/viewRules'>
        <a>View Rules</a>
      </Link><br/>
    </Layout>
  )
}

export async function getStaticProps() {
  const allPostsData = getSortedPostsData()
  return {
    props: {
      allPostsData
    }
  }
}
