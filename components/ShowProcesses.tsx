import { FC } from "react";

import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "./Radix/Tabs";
import type { Process } from "../utils/Process";
import Image from "next/image";
import { Toast } from "./Radix";

type Props = {
  processes: Process[];
  removeProcess: (process: Process) => void;
  noProcessesText: string;
  text: string;
  addPreviousProcess: (process: Process) => void;
  removePreviousProcess: (process: Process) => void;
};

export const ShowProcesses: FC<Props> = ({
  processes,
  removeProcess,
  noProcessesText,
  addPreviousProcess,
  removePreviousProcess,
  text,
}) => {
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
    // remove process
    removeProcess(proc);
    // add it to previous processes
    addPreviousProcess(proc);
  };
  if (!processes || processes.length === 0) {
    return (
      <div className="w-fit h-fit mx-auto py-6">
        <h2 className="text-xl tracking-wide">{noProcessesText}</h2>
      </div>
    );
  }
  return (
    <section className="w-fit h-fit mx-auto py-6">
      <h2 className="text-2xl tracking-wide py-4">{text}</h2>
      <div className="w-full flex flex-col">
        <TabsRoot
          className="w-processTab max-w-none"
          value={processes[0].username}
        >
          <TabsList label="Processes">
            {processes.map((process, index) => (
              <TabsTrigger
                value={process.username}
                className="transition-colors duration-200 ease-in delay-0 text-slate-300 hover:text-white data-[state=active]:text-slate-100 bg-cyan-800 data-[state=active]:bg-cyan-900"
                key={`${process} ${index}`}
              >
                {process.username}
              </TabsTrigger>
            ))}
          </TabsList>
          {processes.map((process, index) => (
            <TabsContent
              value={process.username}
              key={`${process} ${index}`}
              className="bg-slate-400 w-full relative p-3 rounded-b-md"
            >
              <pre className="py-1">Device {process.device}</pre>
              <pre className="py-1">Username {process.username}</pre>
              <pre className="py-1">Membership {process.membership}</pre>
              <pre className="py-1">Status {process.status}</pre>
              <pre className="pt-1 pb-8">{process.result}</pre>
              {process.status !== "STOPPED" ? (
                <button
                  onClick={(event) => killBot(event, process)}
                  className="border border-red-500 bg-red-400 hover:bg-red-500 rounded-md w-fit h-fit cursor-pointer p-4"
                >
                  <Image
                    src={"/knife.png"}
                    alt="Knife"
                    width={32}
                    height={32}
                  />
                </button>
              ) : (
                <Toast
                  process={process}
                  removePreviousProcess={removePreviousProcess}
                />
              )}
            </TabsContent>
          ))}
        </TabsRoot>
      </div>
    </section>
  );
};
