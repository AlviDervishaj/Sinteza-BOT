import { useState, SyntheticEvent, FC } from "react";
import {
  Typography,
  AccordionSummary,
  AccordionDetails,
  Accordion as A,
  Box,
  Button,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { ExpandMore, Close } from "@mui/icons-material";

import { SnackbarKey, SnackbarMessage, useSnackbar } from "notistack";

// Axios
import axios from "axios";

// Components
import { Process } from "../../../utils/Process";
import { Output } from "../../Output";
import { ChangeBotConfig } from "../Dialog/Dialog";
import { Snackbar } from "../Snackbar";
import { start_bot } from "../../../utils/api-client";
import { BotFormData } from "../../../utils";
type Props = {
  removeProcessFromPool: (process: Process) => void;
  processes: Process[];
  updateProcessResult: (process: Process, result: string) => void;
  killBot: (event: any, process: Process) => void;
};

export const Accordion: FC<Props> = ({
  processes,
  removeProcessFromPool,
  updateProcessResult,
  killBot,
}) => {
  const [expanded, setExpanded] = useState<string | false>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closeSnackbar, enqueueSnackbar } = useSnackbar();

  const sortedProcesses = processes.sort((a, b) => {
    if (a.username < b.username) {
      return -1;
    }
    if (a.username > b.username) {
      return 1;
    }
    return 0;
  });

  const notifyActions = (id: SnackbarKey) => (
    <>
      <Button variant="text" color="inherit" onClick={() => closeSnackbar(id)}>
        <Close color={"inherit"} />
      </Button>
    </>
  );

  const notify = (
    message: SnackbarMessage,
    variant: "error" | "info" | "default" | "success"
  ) => {
    enqueueSnackbar(message, {
      variant,
      action: notifyActions,
    });
    return;
  };

  const handleDevicePreview = async (event: any, process: Process) => {
    event.preventDefault();
    notify("Opening preview", "info");
    setIsLoading(true);
    const res = await axios.post("/api/previewDevice", {
      deviceId: process.device.id,
    });
    if (res.status === 200) {
      notify("Preview Closed", "info");
      // toggle
      setIsLoading(false);
    }
  };

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

  const startBotAgain = (event: any, process: Process) => {
    event.preventDefault();
    process.scheduled = false;
    process.total_crashes = 0;
    const data = {
      username: process.username,
      password: "",
      device: process.device,
    };
    start_bot(data, (output: string) => {
      process.status = "RUNNING";
      updateProcessResult(process, output);
    });
  };

  const handleChange =
    (tab: string) => (event: SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? tab : false);
    };

  return (
    <Box sx={{ width: 9 / 10, margin: "0 auto" }}>
      {sortedProcesses.map((process, index) => (
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
              {process.username} - {process.device.name}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>Device: {process.device.name}</Typography>
            <Output data={process.result} />
            <Box sx={{ display: "flex", marginTop: "1rem", columnGap: "2rem" }}>
              {process.status !== "RUNNING" && process.status !== "WAITING" ? (
                <>
                  <Tooltip title="Start bot again." arrow>
                    <Button
                      variant="outlined"
                      color="info"
                      onClick={(event) => startBotAgain(event, process)}
                    >
                      Start bot
                    </Button>
                  </Tooltip>
                  {/* <ChangeBotConfig process={process} /> */}
                  <Tooltip title="Remove bot from pool." arrow>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeProcessFromPool(process)}
                    >
                      Remove
                    </Button>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={(event) => killBot(event, process)}
                  >
                    {process.scheduled ? "Remove Schedule" : "Stop"}
                  </Button>
                </>
              )}
              <Snackbar
                description={`Previewing device that is running for ${process.username}`}
                title={`Preview ${process.device.name}`}
                icon="info"
                variant="contained"
                color="primary"
                key={process.device.id}
                text={
                  isLoading ? (
                    <CircularProgress color="inherit" size={25} />
                  ) : (
                    "Preview"
                  )
                }
                disabled={isLoading}
                type="custom"
                onClick={(event) => handleDevicePreview(event, process)}
                tooltip="Open Preview"
                customEventHandler={() => {
                  return;
                }}
              />
            </Box>
          </AccordionDetails>
        </A>
      ))}
    </Box>
  );
};
