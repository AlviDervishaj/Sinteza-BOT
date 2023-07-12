import { FC } from "react";

import type { Process } from "../utils/Process";
import { Accordion } from "./MaterialUI/Accordion/Accordion";
import { Box, Typography } from "@mui/material";

type Props = {
  processes: Process[];
  noProcessesText: string;
  text: string;
  removePreviousProcess: (process: Process) => void;
  killBot: (event: any, proc: Process) => void;
};

export const ShowProcesses: FC<Props> = ({
  processes,
  noProcessesText,
  removePreviousProcess,
  killBot,
  text,
}) => {
  if (!processes || processes.length === 0) {
    return (
      <div className="w-fit h-fit mx-auto py-6">
        <h2 className="text-xl tracking-wide">{noProcessesText}</h2>
      </div>
    );
  }

  return (
    <Box>
      <Typography variant="h5" className="text-center" paddingBottom={"0.7rem"}>
        {text}
      </Typography>
      <Accordion
        processes={processes}
        killBot={killBot}
        removePreviousProcess={removePreviousProcess}
      />
    </Box>
  );
};
