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

  const mapColorsToStatus = (status: string) => {
    switch (status) {
      case "WAITING":
        return "#70798c";
      case "FINISHED":
        return "#3da35d";
      case "STOPPED":
        return "#d7010f";
      default:
        return "#233d4d";
    }
  };

  const handleChange =
    (tab: string) => (event: SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? tab : false);
    };

  return (
    <Box sx={{ width: 9 / 10 }}>
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
            expandIcon={<ExpandMore sx={{ color: "#fff" }} />}
            aria-controls="pannel-content"
            id="pannel-header"
            sx={{
              backgroundColor: mapColorsToStatus(process.status),
              color: "white",
            }}
          >
            <Typography
              key={`${process.username} ${index}`}
              sx={{
                width: "40%",
                flexShrink: 0,
                letterSpacing: "0.1rem",
                fontWeight: "bold",
              }}
            >
              {process.username}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>Device: {process.device.name}</Typography>
            <Output data={process.result} />
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
