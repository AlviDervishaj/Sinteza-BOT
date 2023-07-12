import { useState, SyntheticEvent, FC } from "react";
import {
  Typography,
  AccordionSummary,
  AccordionDetails,
  Accordion as A,
  Box,
  Button,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Process } from "../../../utils/Process";
import { Output } from "../../Output";
type Props = {
  removePreviousProcess: (process: Process) => void;
  processes: Process[];
  killBot: (event: any, process: Process) => void;
};

export const Accordion: FC<Props> = ({
  processes,
  removePreviousProcess,
  killBot,
}) => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange =
    (tab: string) => (event: SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? tab : false);
    };

  return (
    <Box>
      {processes.map((process, index) => (
        <A
          expanded={
            expanded ===
            `${process.username} ${process.status} ${process.device}`
          }
          key={index}
          onChange={handleChange(
            `${process.username} ${process.status} ${process.device}`
          )}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography
              key={`${process.username} ${index}`}
              sx={{ width: "33%", flexShrink: 0 }}
            >
              {process.username}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>Device: {process.device}</Typography>
            <Output data={process.result} error="" />
            <Button
              variant="outlined"
              color="error"
              onClick={(event) => killBot(event, process)}
              sx={{ margin: "1rem 1rem 0 0" }}
            >
              Stop
            </Button>
          </AccordionDetails>
        </A>
      ))}
    </Box>
  );
};
