import Head from "next/head";
import Image from "next/image";
import { useState, useEffect, SetStateAction, Dispatch } from "react";

// Components
import { BotForm } from "../components/BotForm";
import { NextPage } from "next";
import { Process } from "../utils/Process";

type Props = {
  setError: (error: string) => void;
  setData: (data: string) => void;
  data: string;
  getDevices: () => void;
  error: string;
  logData: (data: string) => void;
  setDevices: Dispatch<SetStateAction<string[]>>;
  devices: string[];
  processes: Process[];
  setProcesses: Dispatch<SetStateAction<Process[]>>;
  displayError: (error: string) => void;
  handleScroll: () => void;
  addToPool: (process: Process) => void;
  killBot: (process: Process) => void;
  updateProcessResult: (process: Process, output: string) => void;
};
const AddBot: NextPage<Props> = ({
  setData,
  logData,
  displayError,
  setError,
  handleScroll,
  getDevices,
  processes,
  setDevices,
  devices,
  addToPool,
  updateProcessResult,
  killBot,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // const renderTabs = useCallback(() => {
  //   return <Tabs devices={devices} />;
  // }, [devices]);
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
        <title>Sinteza Add Bot</title>
      </Head>
      <main className="px-4 py-6 overflow-x-hidden">
        <section className="container mx-auto space-y-4">
          <BotForm
            setData={setData}
            logData={logData}
            updateProcessResult={updateProcessResult}
            displayError={displayError}
            setError={setError}
            handleScroll={handleScroll}
            processes={processes}
            setDevices={setDevices}
            devices={devices}
            killBot={killBot}
            addToPool={addToPool}
            getDevices={getDevices}
          />
        </section>
      </main>
    </>
  );
};
export default AddBot;
