import "./global.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { useEffect, useRef, useState } from "react";
import type { AppProps } from "next/app";
import { Navigation } from "../components/Navigation";
import { Process, ProcessSkeleton } from "../utils/Process";
import { Output } from "../components/Output";
import { NextRouter, useRouter } from "next/router";
import { ShowProcesses } from "../components/ShowProcesses";
import { GetSessionFromPython } from "../utils/Types";
import axios from "axios";

export default function Sinteza({ Component, pageProps }: AppProps) {
  const router: NextRouter = useRouter();
  const scrollToMe = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<string>("");
  const [devices, setDevices] = useState<string[]>([]);
  const [device, setDevice] = useState<string>("");
  const [processes, setProcesses] = useState<Process[]>([]);
  const [previousProcesses, setPreviousProcesses] = useState<Process[]>([]);

  const condition =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/"
      : "https://sinteza.vercel.app/";

  const killBot = async (event: any, proc: Process) => {
    event.preventDefault();
    // call terminateProcess
    const result = await fetch(
      `${condition}api/fetchProcesses?${new URLSearchParams({
        username: proc.username,
      })}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "text/plain",
        },
      }
    );
    const data = await result.text();
    const _processes = data.split("\n").map((p) =>
      p
        .split("   ")
        .filter((s) => s.length)
        .join(" ")
    );
    // remove all elements except the last one.
    const command = _processes[0];
    // get pid of command
    const pid = command
      .split(" ")
      .filter((elem) => elem.trim() !== "")[1]
      .trim();
    await fetch(
      `${condition}api/terminateProcess?${new URLSearchParams({ pid })}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "text/plain",
        },
      }
    );
    proc.status = "STOPPED";
    logData("[INFO] Bot stopped.");
    // remove process
    removeProcess(proc);
    // add it to previous processes
    addPreviousProcess(proc);
  };

  const updateSessionData = async (proc: Process, result: string) => {
    setProcesses((previous) =>
      previous.map((process) => {
        if (
          process.username === proc.username &&
          process.device === proc.device
        ) {
          process.session = result;
        }
        return process;
      })
    );
  };

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

  const updateProcessResult = (_process: Process, output: string) => {
    setProcesses((previous) =>
      previous.map((process) => {
        if (process === _process) {
          if (output.includes(`INFO | Hello, @${process.username}`)) {
            const c = output.split(" ").filter((el) => el);
            const following = c[8];
            const followers = c[11];
            process.followers = parseInt(followers);
            process.following = parseInt(following);
          } else if (!process.result.includes(output)) {
            process.result = output;
          }
        }
        return process;
      })
    );
  };

  const getSession = async (process: Process) => {
    if (
      !process.username ||
      process.username.trim() === "" ||
      process.following === 0 ||
      process.followers === 0
    )
      return;
    const _data: GetSessionFromPython = {
      username: process.username,
      followers_now: process.followers,
      following_now: process.following,
    };
    const result = await axios.post(`${condition}api/getSession`, _data);
    console.log(result.data as string);
    process.session = result.data as string;
  };

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
    setData((prevData) => prevData + `${data}\n`);
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
              p._result,
              p._total,
              p._following,
              p._followers,
              p._session
            );
          })
        : [];
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
              _p._result,
              _p._total,
              _p._following,
              _p._followers,
              _p._session
            );
          })
        : [];
    setProcesses(proc);
  }, []);

  return (
    <>
      <Navigation />
      <main>
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
          killBot={killBot}
          addToPool={addToPool}
          updateProcessResult={updateProcessResult}
          processes={processes}
        />
      </main>
      {router.pathname === "/" ? (
        <>
          <ShowProcesses
            killBot={killBot}
            getSession={getSession}
            removeProcess={removeProcess}
            removePreviousProcess={removePreviousProcess}
            processes={processes}
            text={"Running bots"}
            addPreviousProcess={addPreviousProcess}
            noProcessesText="No bots are currently running."
          />
          <ShowProcesses
            killBot={killBot}
            getSession={getSession}
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
