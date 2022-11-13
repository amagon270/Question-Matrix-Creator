import React from "react";
import { useState } from 'react'
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { Search } from '../../lib/search.js'
import { useRouter } from "next/router";
import { Card, Button } from "react-bootstrap";
import CreateThemeForm from "../../lib/createThemeForm";

export async function getServerSideProps() {
  if (!global.themes) {
    const prisma = new PrismaClient();
    global.themes = await prisma.theme.findMany()
    await prisma.$disconnect()
  }
  const themes = global.themes;

  return {
    props: {
      themes
    }
  }
}

export default function ViewThemes({ themes }) {
  const [shownThemes, setShownThemes] = useState(themes);
  const [editTheme, setEditTheme] = useState(null);

  const router = useRouter();
  const refreshData = () => {router.reload()}

  const themeHtml = [];
  if (editTheme != null) {
    themeHtml.push(
      CreateThemeForm({
        themeState: editTheme,
        setThemeState: setEditTheme,
        formSubmit: updateTheme,
        existingTheme: editTheme,
        submitButtonLabel: "save"
      })
    )
  } else {
    themeHtml.push(...themeViewLayout())
  }
  return (
    <Layout>
      <h2>View Themes</h2>
      {themeHtml}
    </Layout>
  )

  async function updateTheme(event) {
    event.preventDefault()
  
    const res = await fetch('/api/theme', {
      body:  JSON.stringify({
        id: editTheme.id,
        name: event.target.name.value,
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'PUT'
    })

    await res.json();
    
    setEditTheme(null);
    refreshData()
  }

  function pushEditThemeButton(event) {
    setEditTheme(themes.find(theme => theme.id == event.target.id.substring(4)))
  }

  async function pushDeleteThemeButton(event) {
    event.preventDefault()
    const res = await fetch('/api/theme', {
      body:  JSON.stringify({
        id: event.target.id.substring(6),
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'DELETE'
    })

    await res.json();
    
    setEditTheme(null);
    refreshData()
  }

  function themeViewLayout() {
    const layout = [];

    //searchBar
    layout.push(
      <div key = "Search">
        <>Search: </>
        {Search(themes, "name", setShownThemes)}
      </div>
    );

    //themes
    for (let i = 0; i < shownThemes.length; i++) {
      layout.push(
        <Card key={i}>
          <Card.Header>{shownThemes[i].name}</Card.Header>
          <Card.Body>
            <Button id={"edit"+shownThemes[i].id} type="button" onClick={pushEditThemeButton} className='mx-2'>Edit</Button>
            <Button id={"delete"+shownThemes[i].id} type="button" onClick={pushDeleteThemeButton}>Delete</Button>
          </Card.Body>
        </Card>
      )
    }
    return layout;
  }
}