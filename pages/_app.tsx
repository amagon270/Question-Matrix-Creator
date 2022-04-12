import '../styles/global.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import * as React from 'react'

export default function App({Component, pageProps }) {
  return <Component {...pageProps} />
}