import { useState, SyntheticEvent, FC, memo } from "react";
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
import { Snackbar } from "../Snackbar";
import { URLcondition } from "../../../utils";
type Props = {
  processes: Process[];
};

export const Accordion: FC<Props> = memo<Props>(function Accordion({
  processes,
}) {
  const [expanded, setExpanded] = useState<string | false>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStarting, setIsStarting] = useState<boolean>(false);
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
    setIsLoading(true);
    const res = await axios.post(`${URLcondition}/previewDevice`, {
      deviceId: process.device.id,
    });
    if (res.status === 200) {
      if (
        res.data.includes(
          `adb: error: failed to get feature set: device '${process.device.id}' not found`
        )
      ) {
        notify("Device might be offline.", "error");
        setIsLoading(false);
        return;
      }
      // toggle
      setIsLoading(false);
      return;
    } else {
      notify("Something unexpected happend", "error");
      setIsLoading(false);
      return;
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

  const handleChange =
    (tab: string) => (event: SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? tab : false);
    };

  console.log({ acc: processes });

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
            <Typography variant="body1">
              Config  - {process.configFile}
            </Typography>
            <Output data={process.result} />
            <Box sx={{ display: "flex", marginTop: "1rem", columnGap: "2rem" }}>
              {process.status !== "RUNNING" && process.status !== "WAITING" ? (
                <>
                  <Tooltip title="Start bot again." arrow>
                    <span>
                      <Button
                        variant="outlined"
                        color="info"
                        key={process.username}
                        disabled={isStarting}
                      >
                        {isStarting ? (
                          <CircularProgress color="inherit" size={25} />
                        ) : (
                          "Start Bot"
                        )}
                      </Button>
                    </span>
                  </Tooltip>
                  {/* <ChangeBotConfig process={process} /> */}
                  <Tooltip title="Remove bot from pool." arrow>
                    <Button
                      variant="outlined"
                      color="error"
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
                text={
                  isLoading ? (
                    <CircularProgress color="inherit" size={25} />
                  ) : (
                    "Preview"
                  )
                }
                disabled={isLoading}
                key={`${process.device.id} ${process.username}`}
                about="Preview Device"
                aria-label="Preview Device"
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
});
