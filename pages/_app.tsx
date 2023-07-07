import "./global.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AppProps } from "next/app";
import { Navigation } from "../components/Navigation";
import { Process, ProcessSkeleton } from "../utils/Process";
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
  const [processes, setProcesses] = useState<Process[]>([]);
  const [previousProcesses, setPreviousProcesses] = useState<Process[]>([]);

  // Remove process
  const removeProcess = (_process: Process) => {
    setProcesses((previous) =>
      previous.filter((process) => _process !== process)
    );
  };

  // Remove previous Process
  const removePreviousProcess = (_process: Process) => {
    setPreviousProcesses((previous) =>
      previous.filter((process) => _process !== process)
    );
  };

  // Add to previous Process pool
  const addPreviousProcess = (_process: Process) => {
    setPreviousProcesses((previous) =>
      previous.find(
        (p) => p.device === _process.device && p.username === _process.username
      )
        ? [...previous]
        : [...previous, _process]
    );
  };

  // Add to Process pool
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
  }, [devices]);

  useEffect(() => {
    function storeInLS() {
      localStorage.setItem(
        "processes",
        JSON.stringify(processes.length > 0 ? processes : [])
      );
    }
    //  add event listener to handle before unload event
    window.addEventListener("beforeunload", storeInLS);
    // clean up function
    return () => {
      window.removeEventListener("beforeunload", storeInLS);
    };
  }, [processes]);

  useEffect(() => {
    function storeInLS() {
      localStorage.setItem(
        "prevProcesses",
        JSON.stringify(previousProcesses.length > 0 ? previousProcesses : [])
      );
    }
    //  add event listener to handle before unload event
    window.addEventListener("beforeunload", storeInLS);
    // clean up function
    return () => {
      window.removeEventListener("beforeunload", storeInLS);
    };
  }, [previousProcesses]);

  useEffect(() => {
    const prevP: ProcessSkeleton[] | [] = localStorage.getItem("prevProcesses")
      ? JSON.parse(localStorage.getItem("prevProcesses") as string)
      : [];
    const prev =
      prevP.length > 0
        ? prevP.map((p) => {
            return new Process(
              p._device,
              p._user.username,
              p._user.membership,
              p._status,
              p._result
            );
          })
        : [];
    console.log({ prev });
    setPreviousProcesses(prev);
  }, []);

  useEffect(() => {
    const p: ProcessSkeleton[] | [] = localStorage.getItem("processes")
      ? JSON.parse(localStorage.getItem("processes") as string)
      : [];
    const proc =
      p.length > 0
        ? p.map((_p) => {
            return new Process(
              _p._device,
              _p._user.username,
              _p._user.membership,
              _p._status,
              _p._result
            );
          })
        : [];
    console.log({ proc });
    setProcesses(proc);
  }, []);

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
        <>
          <ShowProcesses
            removeProcess={removeProcess}
            removePreviousProcess={removePreviousProcess}
            processes={processes}
            text={"Running bots"}
            addPreviousProcess={addPreviousProcess}
            noProcessesText="No bots are currently running."
          />
          <ShowProcesses
            removeProcess={removeProcess}
            processes={previousProcesses}
            removePreviousProcess={removePreviousProcess}
            text={"Previous bots"}
            addPreviousProcess={addPreviousProcess}
            noProcessesText="No previous bots."
          />
        </>
      ) : null}
      <div ref={scrollToMe}>
        {router.pathname !== "/" ? <Output data={data} error={error} /> : null}
      </div>
    </>
  );
}
