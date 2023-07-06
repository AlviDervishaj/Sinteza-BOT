import "./global.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AppProps } from "next/app";
import { Navigation } from "../components/Navigation";
import { Process } from "../utils/Process";
import { Output } from "../components/Output";
import { NextRouter, useRouter } from "next/router";
import { ShowProcesses } from "../components/ShowProcesses";

export default function Sinteza({ Component, pageProps }: AppProps) {
  const router: NextRouter = useRouter();
  const scrollToMe = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<string>("");
  const [devices, setDevices] = useState<string[]>([]);
  const [device, setDevice] = useState<string>("");
  const [processes, setProcesses] = useState<Process[]>([
    new Process("ABCDEFGHIJK", "jonii", "PREMIUM", "STOPPED", "Empty"),
  ]);

  // remove process
  const removeProcess = (_process: Process) => {
    setProcesses((previous) =>
      previous.filter((process) => _process !== process)
    );
  };
  const addToPool = (_process: Process) => {
    setProcesses((previous) =>
      previous.find(
        (p) => p.device === _process.device && p.username === _process.username
      )
        ? [...previous]
        : [...previous, _process]
    );
  };
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
    const devices = listOfDevices
      .trim()
      .split("\n")
      .filter((d) => !d.includes("[PID]") && d.trim() !== "");
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
    }, 70);
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
        devices={devices}
        setDevice={setDevice}
        addToPool={addToPool}
        processes={processes}
      />
      {router.pathname === "/" ? (
        <ShowProcesses removeProcess={removeProcess} processes={processes} />
      ) : null}
      <div ref={scrollToMe}>
        {router.pathname !== "/" ? <Output data={data} error={error} /> : null}
      </div>
    </>
  );
}
