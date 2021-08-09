import Head from 'next/head'
import Image from 'next/image'
import styles from './layout.module.css'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import { Navbar, NavDropdown } from 'react-bootstrap'


const name = "robert Bartlett"
export const siteTitle = 'Question Matrix Creator'

export default function Layout({ children, home }) {
  return (
    <div className={styles.container}>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="/">Home</Navbar.Brand>
        <NavDropdown title="Create" id="basic-nav-dropdown">
          <NavDropdown.Item href="/posts/createFact">Fact</NavDropdown.Item>
          <NavDropdown.Item href="/posts/createQuestion">Question</NavDropdown.Item>
          <NavDropdown.Item href="/posts/createRule">Rule</NavDropdown.Item>
          <NavDropdown.Item href="/posts/createTheme">Theme</NavDropdown.Item>
        </NavDropdown>
        <NavDropdown title="View" id="basic-nav-dropdown">
          <NavDropdown.Item href="/posts/viewFacts">Facts</NavDropdown.Item>
          <NavDropdown.Item href="/posts/viewQuestions">Questions</NavDropdown.Item>
          <NavDropdown.Item href="/posts/viewRules">Rules</NavDropdown.Item>
          <NavDropdown.Item href="/posts/viewThemes">Themes</NavDropdown.Item>
        </NavDropdown>
      </Navbar>
      <main>{children}</main>
    </div>
  )
}
