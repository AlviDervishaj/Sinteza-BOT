import "./global.css";
import { useEffect, useRef, useState } from "react";
import type { AppProps } from "next/app";
import { Navigation } from "../components/Navigation";
import { Process, ProcessesPool } from "../utils/Process";
import { Output } from "../components/Output";
import { NextRouter, useRouter } from "next/router";
import { ShowProcesses } from "../components/ShowProcesses";

export default function Sinteza({ Component, pageProps }: AppProps) {
  const router: NextRouter = useRouter();
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<string>("");
  const [devices, setDevices] = useState<string[]>([]);
  const [device, setDevice] = useState<string>("");
  const [processes, setProcesses] = useState<ProcessesPool>(
    new ProcessesPool()
  );

  // remove process
  const removeProcess = (process: Process) => {
    processes.removeProcess(process);
    setProcesses(processes);
  };

  // remove all processes
  const removeAllProcesses = () => {
    processes.removeAllProcesses();
  };

  const scrollToMe = useRef<HTMLDivElement>(null);

  const condition =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/"
      : "https://sinteza.vercel.app/";

  // get adb devices
  const getDevices = async () => {
    const result = await fetch(`${condition}api/getDevices`);
    const listOfDevices: string = (await result.text())
      .replace("List of devices attached", "")
      .replace("device", "");
    const devices = listOfDevices.trim().split("\n");
    logData(
      `[INFO] ${devices.length} device${
        devices.length > 1 ? "s" : ""
      } connected.`
    );
    setDevices(devices);
  };

  const displayError = (error: string) => {
    setError((prevError) => prevError + `${error}\n`);
    return;
  };
  const logData = (data: string) => {
    return setData((prevData) => prevData + `${data}\n`);
  };
  const handleScroll = () => {
    setTimeout(() => {
      scrollToMe.current?.scrollIntoView({ behavior: "smooth" });
    }, 60);
  };
  useEffect(() => {
    getDevices();
  }, []);

  useEffect(() => {
    // handle device selection
    if (devices.length === 0) {
      logData("[INFO] No devices connected");
      return;
    } else if (device === "") {
      logData("[INFO] Please select a device");
      return;
    } else {
      logData(`[INFO] Device ${device} selected.`);
    }
  }, [device]);

  return (
    <>
      <Navigation />
      <Component
        {...pageProps}
        setData={setData}
        logData={logData}
        displayError={displayError}
        setError={setError}
        handleScroll={handleScroll}
        removeProcess={removeProcess}
        setDevices={setDevices}
        getDevices={getDevices}
        removeAllProcesses={removeAllProcesses}
        devices={devices}
        setDevice={setDevice}
        processes={processes}
      />
      {router.pathname === "/" ? (
        <ShowProcesses
          removeProcess={removeProcess}
          removeAllProcesses={removeAllProcesses}
          processes={processes}
        />
      ) : null}
      {router.pathname !== "/" ? <Output data={data} error={error} /> : null}
    </>
  );
}
