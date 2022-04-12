import React from "react";
import Layout from '../../components/layout'
import { useRouter } from 'next/router';
import { useState } from 'react'
import CreateThemeForm from "../../lib/createThemeForm";

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
      CreateThemeForm({
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

    await res.json();
    refreshData();
  }
}