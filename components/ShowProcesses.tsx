import { FC } from "react";
import path from "path";

import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "./Radix";
import type { Process, ProcessesPool } from "../utils/Process";
import Image from "next/image";
type Props = {
  processes: ProcessesPool;
  removeProcess: (process: Process) => void;
  removeAllProcesses: () => void;
};
export const ShowProcesses: FC<Props> = ({
  processes,
  removeAllProcesses,
  removeProcess,
}) => {
  console.log({ processes });
  const condition =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/"
      : "https://sinteza.vercel.app/";

  const killBot = async (event: any, proc: Process) => {
    event.preventDefault();
    // call terminateProcess
    const result = await fetch(
      `${condition}api/terminateProcess?${new URLSearchParams({
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
        .split(" ")
    );
    // remove all elements except the last one.
    const command = _processes.filter((p) => {
      p[-2] === "--config" && (p[-5] != "egrep" || p[-5] != "grep");
    });
    console.log({ command });
  };
  if (!processes.processes || processes.processes.length === 0) {
    return (
      <div className="w-fit h-fit mx-auto py-6">
        <h2 className="text-xl tracking-wide">
          No processes are currently running
        </h2>
      </div>
    );
  }
  return (
    <section className="w-fit h-fit mx-auto py-6">
      <h2>Select From available processes</h2>
      <div className="w-full flex flex-col">
        <TabsRoot className="w-screen" value={processes.processes[0].username}>
          <TabsList label="Processes">
            {processes.processes.map((process, index) => (
              <TabsTrigger
                value={process.username}
                className="text-slate-600 data-[state=active]:text-slate-200 bg-cyan-800"
                key={`${process} ${index}`}
              >
                {process.username}
              </TabsTrigger>
            ))}
          </TabsList>
          {processes.processes.map((process, index) => (
            <TabsContent
              value={process.username}
              key={`${process} ${index}`}
              className="bg-slate-400 w-full relative"
            >
              <pre>Device {process.device}</pre>
              <pre>Username {process.username}</pre>
              <pre>Membership {process.membership}</pre>
              <pre>Status {process.status}</pre>
              <pre>{process.result}</pre>
              <button
                onClick={(event) => killBot(event, process)}
                className="border border-red-500 bg-red-400 hover:bg-red-500 rounded-md w-fit h-fit bg-transparent cursor-pointer p-4"
              >
                <Image src={"/knife.png"} alt="Knife" width={32} height={32} />
              </button>
            </TabsContent>
          ))}
        </TabsRoot>
      </div>
    </section>
  );
};
