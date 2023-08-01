import Head from "next/head";
import { SetStateAction, Dispatch } from "react";

// Components
import { BotForm } from "../components/BotForm";
import { NextPage } from "next";
import { Process } from "../utils/Process";
import { BotFormData } from "../utils";
import { ApiDevices } from "../utils/Types";

type Props = {
  setError: (error: string) => void;
  setData: (data: string) => void;
  data: string;
  getDevices: () => void;
  error: string;
  logData: (data: string) => void;
  devices: ApiDevices;
  processes: Process[];
  setProcesses: Dispatch<SetStateAction<Process[]>>;
  updateDevices: (device: {
    id: string;
    name: string;
    battery: string;
    process: Process | null;
  }) => Promise<void>;
  addToPool: (process: Process) => void;
  killBot: (process: Process) => void;
  updateProcessResult: (process: Process, output: string) => void;
  timeout: (
    p: Process,
    formData: BotFormData,
    duration: number,
    setAlreadyCalled: (value: boolean) => void
  ) => NodeJS.Timeout;
};
const AddBot: NextPage<Props> = ({
  setData,
  logData,
  addToPool,
  updateProcessResult,
  killBot,
  updateDevices,
  getDevices,
  processes,
  devices,
}) => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Sinteza Description" />
        <meta name="title" content="Sinteza " />
        <meta
          name="description"
          content="A simple UI for Sinteza to start and monitor their devices."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.BASE_URL}`} />
        <meta property="og:title" content="Sinteza " />
        <meta
          property="og:description"
          content="A simple UI for Sinteza to start and monitor their devices."
        />
        <meta
          property="og:image"
          content={`${process.env.BASE_URL}/images/svg/logo-color.svg`}
        />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`${process.env.BASE_URL}`} />
        <meta property="twitter:creator" content="" />
        <meta property="twitter:title" content="Sinteza " />
        <meta
          property="twitter:description"
          content="A simple UI for Sinteza to start and monitor their devices."
        />
        <meta
          property="twitter:image"
          content={`${process.env.BASE_URL}/images/svg/logo-color.svg`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Sinteza | Add Bot</title>
      </Head>
      <BotForm
        setData={setData}
        logData={logData}
        updateProcessResult={updateProcessResult}
        processes={processes}
        updateDevices={updateDevices}
        devices={devices}
        killBot={killBot}
        addToPool={addToPool}
        getDevices={getDevices}
      />
    </>
  );
};
export default AddBot;
