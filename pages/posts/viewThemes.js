import React from "react";
import { useState } from 'react'
import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'
import { Search } from '../../lib/search.js'
import { ThemeCreateLayout as ThemeCreateLayout } from '../../lib/formFields.js'
import { useRouter } from "next/router";
import { Card, ListGroup, Button } from "react-bootstrap";

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();
  var themes = await prisma.theme.findMany()
  .finally(async () => {
    await prisma.$disconnect()
  });

  return {
    props: {
      themes,
    }
  }
}

export default function ViewThemes({ themes }) {
  const [shownThemes, setShownThemes] = useState(themes);
  const [editTheme, setEditTheme] = useState(null);

  const router = useRouter();
  const refreshData = () => {router.reload()}

  var themeHtml = [];
  if (editTheme != null) {
    themeHtml.push(
      ThemeCreateLayout({
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

    const result = await res.json();
    
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

    const result = await res.json();
    
    setEditTheme(null);
    refreshData()
  }

  function themeViewLayout() {
    var layout = [];

    //searchBar
    layout.push(
      <div key = "Search">
        <>Search: </>
        {Search(themes, "name", setShownThemes)}
      </div>
    );

    //themes
    for (var i = 0; i < shownThemes.length; i++) {
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