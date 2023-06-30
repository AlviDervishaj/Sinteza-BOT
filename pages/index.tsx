import Head from 'next/head';
import {useState, useCallback} from "react";
import {UsernameInput} from "../components/UsernameInput";

type Process = undefined;

export default function Home({processes}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<Response>(null);
  console.log({processes});
  return (
    <>
    <Head>
        <title>Sinteza</title>
    </Head>
    <main className="px-4 py-6">
      <main className="container mx-auto space-y-4">
        <h1 className="text-2xl">Sinteza Automation Bot</h1>
        <p className="text-lg">
          Enter username below and then press the button to start the bot
        </p>
        <UsernameInput/>
      </main>
    </main>
    </>
  )
}


export async function getStaticProps() {
  const condition = process.env.NODE_ENV === "development" ? "http://localhost:3000/" : "https://sinteza.vercel.app/";
  const result = await fetch(`${condition}api/fetchProcesses`);
  const data = await result.text();
  return {
    props: {
      processes: data,
    },
    revalidate: 15,
  }
}
