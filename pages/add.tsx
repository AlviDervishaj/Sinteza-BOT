import Head from "next/head";
import { SetStateAction, Dispatch } from "react";

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
  addToPool: (process: Process) => void;
  killBot: (process: Process) => void;
  updateProcessResult: (process: Process, output: string) => void;
};
const AddBot: NextPage<Props> = ({
  setData,
  logData,
  displayError,
  setError,
  getDevices,
  processes,
  setDevices,
  devices,
  addToPool,
  updateProcessResult,
  killBot,
}) => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Sinteza Description" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Sinteza Add Bot</title>
      </Head>
      <BotForm
        setData={setData}
        logData={logData}
        updateProcessResult={updateProcessResult}
        displayError={displayError}
        setError={setError}
        processes={processes}
        setDevices={setDevices}
        devices={devices}
        killBot={killBot}
        addToPool={addToPool}
        getDevices={getDevices}
      />
    </>
  );
};
export default AddBot;
