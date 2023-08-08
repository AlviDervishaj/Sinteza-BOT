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

  return (
    <Box>
      <Typography variant="h5" paddingBottom={"0.7rem"} paddingLeft={"0.7rem"}>
        Expanded Info
      </Typography>
      <Accordion removeSchedule={removeSchedule} startAgain={startAgain} removeProcess={removeProcess} processes={processes} handleStop={handleStop} />
    </Box>
  );
};
