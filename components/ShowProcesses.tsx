"use client";
// React & Next Js
import { FC } from "react";
import dynamic from "next/dynamic";
// Utils
import { Process } from "../utils/Process";
// Material UI
import { Box, Typography } from "@mui/material";
// Components
const LazyAccordion = dynamic(() =>
  import("./MaterialUI/Accordion/Accordion").then((mod) => mod.Accordion)
);
type Props = {
  processes: Process[];
  previewDevice: (_id: string) => void;
  handleStop: (username: string) => void;
  removeProcess: (_username: string) => void;
  startAgain: (_process: Process) => void;
  removeSchedule: (_username: string) => void;
  isKilling: boolean;
};

export const ShowProcesses: FC<Props> = ({
  processes,
  removeSchedule,
  handleStop,
  previewDevice,
  startAgain,
  removeProcess,
  isKilling,
}) => {
  if (!processes || processes.length === 0) {
    return (
      <Box>
        <Typography
          sx={{ letterSpacing: "0.05em" }}
          variant="h6"
          paddingLeft={"2rem"}
        >
          No processes currently running...
        </Typography>
      </Box>
    );
  }

  const sortedProcesses = processes.sort((a, b) => {
    if (a.username < b.username) {
      return -1;
    }
    if (a.username > b.username) {
      return 1;
    }
    return 0;
  });

  return (
    <Box sx={{ width: 9 / 10, margin: "0 auto" }}>
      {sortedProcesses.map((process: Process) => (
        <LazyAccordion
          isKilling={isKilling}
          key={process.username}
          removeSchedule={removeSchedule}
          startAgain={startAgain}
          previewDevice={previewDevice}
          removeProcess={removeProcess}
          process={process}
          handleStop={handleStop}
        />
      ))}
    </Box>
  );
};
