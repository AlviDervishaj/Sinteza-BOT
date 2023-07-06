import Head from "next/head";
import Image from "next/image";
import {
  useState,
  useEffect,
  SetStateAction,
  Dispatch,
  useCallback,
} from "react";

// Components
import { BotForm } from "../components/BotForm";
import { NextPage } from "next";
import { Process, ProcessesPool } from "../utils/Process";
import { Tabs } from "../components/Tabs";

type Props = {
  setError: (error: string) => void;
  setData: (data: string) => void;
  data: string;
  getDevices: () => void;
  error: string;
  logData: (data: string) => void;
  setDevices: Dispatch<SetStateAction<string[]>>;
  devices: string[];
  processes: ProcessesPool;
  setProcesses: Dispatch<SetStateAction<Process[]>>;
  displayError: (error: string) => void;
  handleScroll: () => void;
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
      <main className="px-4 py-6 overflow-hidden">
        <section className="container mx-auto space-y-4">
          <BotForm
            setData={setData}
            logData={logData}
            displayError={displayError}
            setError={setError}
            handleScroll={handleScroll}
            processes={processes}
            setDevices={setDevices}
            devices={devices}
            getDevices={getDevices}
          />
        </section>
      </main>
    </>
  );
};
export default AddBot;
