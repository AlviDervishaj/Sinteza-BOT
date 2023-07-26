import { FC } from "react";

import type { Process } from "../utils/Process";
import { Accordion } from "./MaterialUI/Accordion/Accordion";
import { Box, Typography } from "@mui/material";

type Props = {
  processes: Process[];
  noProcessesText: string;
  text: string;
  removeProcessFromPool: (process: Process) => void;
  killBot: (event: any, proc: Process) => void;
  updateProcessResult: (process: Process, result: string) => void;
  removeSchedule: (event: any, proc: Process) => void;
};

export const ShowProcesses: FC<Props> = ({
  processes,
  noProcessesText,
  removeProcessFromPool,
  killBot,
  updateProcessResult,
  text,
  removeSchedule,
}) => {
  if (!processes || processes.length === 0) {
    return (
      <Box>
        <Typography sx={{ letterSpacing: "0.05em" }}>
          {noProcessesText}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" paddingBottom={"0.7rem"}>
        {text}
      </Typography>
      <Accordion
        removeSchedule={removeSchedule}
        processes={processes}
        updateProcessResult={updateProcessResult}
        killBot={killBot}
        removeProcessFromPool={removeProcessFromPool}
      />
    </Box>
  );
};
