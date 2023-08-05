import { FC, useEffect, useState } from "react";

import { Process, ProcessSkeleton } from "../utils/Process";
import { Accordion } from "./MaterialUI/Accordion/Accordion";
import { Box, Typography } from "@mui/material";
import { io, Socket } from "socket.io-client";
import { EmitTypes, EventTypes } from "../utils/Types";
import { useEffectOnce, useInterval } from "usehooks-ts";
const socket: Socket = io("ws://localhost:3030", { autoConnect: true, closeOnBeforeunload: true });
export const ShowProcesses: FC = () => {
  const [processes, setProcesses] = useState<Process[]>([]);


  socket.on<EmitTypes>("get-processes-message", (data: ProcessSkeleton[] | string) => {
    if (typeof data === "string") {
      console.log({ data });
      return;
    }
    const proc =
      data.length > 0
        ? data.map((_p: ProcessSkeleton) => {
          return new Process(
            _p._device,
            _p._user.username,
            _p._user.membership,
            _p._status,
            _p._result,
            _p._total,
            _p._following,
            _p._followers,
            _p._session,
            _p._config,
            _p._profile,
            _p._total_crashes,
            _p._scheduled,
            _p._battery,
            _p._jobs,
          );
        })
        : [];
    setProcesses(proc);
  });

  useEffectOnce(() => {
    socket.emit<EventTypes>("get-processes");
  })

  // update every 15 seconds
  useInterval(() => {
    socket.emit<EventTypes>("get-processes");
  }, 1000 * 15);


  socket.on("connect", () => {
    console.log("Connected from Show Process !");
  });

  useEffect(() => {
    socket.connect();
    return () => {
      socket.emit('close');
      socket.disconnect();
    }
  }, [])

  if (!processes || processes.length === 0) {
    return (
      <Box>
        <Typography sx={{ letterSpacing: "0.05em" }}>
          {"No processes currently running..."}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" paddingBottom={"0.7rem"}>
        {"Expanded Info"}
      </Typography>
      <Accordion processes={processes} />
    </Box>
  );
};
