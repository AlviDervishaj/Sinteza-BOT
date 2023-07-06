import Head from "next/head";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
type Props = {
  devices: string[];
  device: string;
  getDevices: () => void;
  setDevice: React.Dispatch<React.SetStateAction<string>>;
};
export default function Home({}: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);
  if (isLoading)
    return (
      <main className="relative w-screen h-screen grid place-items-center">
        <Image
          src="/rotate-right.svg"
          priority
          className="animate-spin"
          width={50}
          height={50}
          alt="Loading"
        />
      </main>
    );
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Sinteza Description" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Sinteza</title>
      </Head>
      <main className="px-4 py-6 overflow-hidden">
        <section className="container mx-auto space-y-4">
          <header className="w-full space-y-4">
            <h1 className="text-4xl text-center">Sinteza Automation Bot</h1>
          </header>
        </section>
      </main>
    </>
  );
}
