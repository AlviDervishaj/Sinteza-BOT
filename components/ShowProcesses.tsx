import { FC } from "react";

import { Process } from "../utils/Process";
import { Accordion } from "./MaterialUI/Accordion/Accordion";
import { Box, Typography } from "@mui/material";

type Props = {
  processes: Process[],
  handleStop: (username: string) => void,
  removeProcess: (_username: string) => void,
  startAgain: (_process: Process) => void,
  removeSchedule: (_username: string) => void;
}

export const ShowProcesses: FC<Props> = ({ processes, removeSchedule, handleStop, startAgain, removeProcess }) => {
  if (!processes || processes.length === 0) {
    return (
      <Box>
        <Typography sx={{ letterSpacing: "0.05em" }} variant="h6" paddingLeft={"2rem"}>
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
    <Box>
      <Typography variant="h5" paddingBottom={"0.7rem"} paddingLeft={"0.7rem"}>
        Expanded Info
      </Typography>
      <Box sx={{ width: 9 / 10, margin: "0 auto" }}>
        {sortedProcesses.map((process: Process) => (
          <Accordion key={process.username}
            removeSchedule={removeSchedule}
            startAgain={startAgain}
            removeProcess={removeProcess}
            process={process}
            handleStop={handleStop} />
        ))}
      </Box>
    </Box>
  );
};
