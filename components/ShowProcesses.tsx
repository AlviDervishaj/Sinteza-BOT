import { FC, useEffect } from "react";

import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "./Radix/Tabs";
import type { Process } from "../utils/Process";
import Image from "next/image";
import { Toast } from "./Radix";
import { Output } from "./Output";
import { ProcessSession } from "./ProcessSession";
import { Root } from "./Radix/Accordion/Root";
import { Accordion } from "./Radix/Accordion";

type Props = {
  processes: Process[];
  removeProcess: (process: Process) => void;
  noProcessesText: string;
  text: string;
  addPreviousProcess: (process: Process) => void;
  removePreviousProcess: (process: Process) => void;
  getSession: (process: Process) => void;
  killBot: (event: any, proc: Process) => void;
};

export const ShowProcesses: FC<Props> = ({
  processes,
  noProcessesText,
  removePreviousProcess,
  killBot,
  getSession,
  text,
}) => {
  if (!processes || processes.length === 0) {
    return (
      <div className="w-fit h-fit mx-auto py-6">
        <h2 className="text-xl tracking-wide">{noProcessesText}</h2>
      </div>
    );
  }
  useEffect(() => {
    processes &&
      processes.length > 0 &&
      processes.forEach((process) => {
        if (process.status === "STOPPED") {
          getSession(process);
        }
      });
  }, []);

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
                className={`${
                  text.toLowerCase().includes("previous")
                    ? "text-slate-200 data-[state=active]:text-white bg-red-400 data-[state=active]:bg-red-500"
                    : "text-slate-300 data-[state=active]:text-slate-100 bg-cyan-800 data-[state=active]:bg-cyan-900"
                } transition-colors duration-200 ease-in delay-0 hover:text-white`}
                key={`${process} ${index}`}
              >
                {process.username}
              </TabsTrigger>
            ))}
          </TabsList>
          <Root>
            {processes.map((process, index) => (
              <TabsContent
                value={process.username}
                key={`${process} ${index}`}
                className="bg-slate-400 w-full relative rounded-b-md p-4"
              >
                <Accordion value={process.username} title={"Username"}>
                  <pre className="text-black mx-auto font-bold bg-slate-100">
                    {process.username}
                  </pre>
                </Accordion>
                <Accordion value={process.device} title={"Device"}>
                  <pre className="text-black mx-auto font-bold">
                    {process.device}
                  </pre>
                </Accordion>
                <Accordion value={process.membership} title={"Membership"}>
                  <pre className="text-black mx-auto font-bold">
                    {process.membership}
                  </pre>
                </Accordion>
                <Accordion value={process.session} title={"Session"}>
                  <div className="w-full max-h-96 overflow-auto bg-slate-100 p-2">
                    <pre>{process.session}</pre>
                  </div>
                </Accordion>
                <pre
                  className={`py-1 font-bold tracking-wider ${
                    process.status === "RUNNING"
                      ? "text-slate-100"
                      : "text-red-600"
                  }`}
                >
                  {process.status}
                </pre>
                <div className="max-h-96 relative flex-1 overflow-y-auto mb-6 mt-2">
                  <p className="py-1 mb-20 break-words">{process.result}</p>
                </div>
                {/* <ProcessSession session={process.session} /> */}
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
          </Root>
        </TabsRoot>
      </div>
    </section>
  );
};
