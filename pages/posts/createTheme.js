import React from "react";
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { ThemeCreateLayout } from '../../lib/formFields.js'
import { useRouter } from 'next/router';
import { useState } from 'react'

export default function CreateTheme() {
  const [themeState, setThemeState] = useState({})
  const router = useRouter();
  const refreshData = () => {router.reload()}

  return (
    <Layout>
      <p>Create a theme </p>
      <br/>
      {Form()}
    </Layout>
  )

  function Form() {
    return (
      ThemeCreateLayout({
        themeState: themeState,
        setThemeState: setThemeState,
        formSubmit: createTheme, 
      })
    )
  }

  async function createTheme (event) {
    event.preventDefault() // don't redirect the page
    
    const res = await fetch('/api/theme', {
      body:  JSON.stringify({
        name: event.target.name.value,
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