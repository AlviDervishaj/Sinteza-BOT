import { Head, Html, Main, NextScript } from 'next/document'

export default function MyDocument() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Sinteza Description"/>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </Head>
      <body>
        <Main/>
        <NextScript />
      </body>
    </Html>
  )
}
