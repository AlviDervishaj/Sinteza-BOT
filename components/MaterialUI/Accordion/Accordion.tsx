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
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem
} from "@mui/material";
import { ExpandMore, Close } from "@mui/icons-material";

import { SnackbarKey, SnackbarMessage, useSnackbar } from "notistack";

// Axios
import axios from "axios";

// Components
import { Process } from "../../../utils/Process";
import { Output } from "../../Output";
import { URLcondition } from "../../../utils";
import { ConfigNames } from "../../../utils/Types";
type Props = {
  process: Process;
  startAgain: (_process: Process) => void;
  removeProcess: (_username: string) => void;
  handleStop: (_username: string) => void;
  removeSchedule: (_username: string) => void;
};

export const Accordion: FC<Props> = memo<Props>(function Accordion({
  process,
  removeSchedule,
  removeProcess,
  startAgain,
  handleStop
}) {
  const [expanded, setExpanded] = useState<string | false>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closeSnackbar, enqueueSnackbar } = useSnackbar();
  const [config, setConfig] = useState<ConfigNames>(process.configFile);


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
    const res = await axios.post(`/api/previewDevice`, {
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

  const handleConfigChange = (event: SelectChangeEvent) => {
    setConfig(event.target.value as ConfigNames);
    process.configFile = event.target.value as ConfigNames;
  }


  const handleChange =
    (tab: string) => (event: SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? tab : false);
    };

  return (
    <A
      expanded={
        expanded ===
        `${process.username} ${process.status} ${process.device}`
      }
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
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
                <Tooltip title="Start bot again." arrow>
                  <span>
                    <Button
                      variant="outlined"
                      color="info"
                      key={process.username}
                      onClick={() => startAgain(process)}
                    >
                      Start Again
                    </Button>
                  </span>
                </Tooltip>
                <FormControl sx={{ maxWidth: 120 }} size="small">
                  <InputLabel id="select-config-process">Config</InputLabel>
                  <Select
                    labelId="select-config-process"
                    id="select-config-process-values"
                    value={config}
                    label="Config"
                    onChange={(event: SelectChangeEvent) => handleConfigChange(event)}
                  >
                    <MenuItem value={"config.yml"}>config.yml</MenuItem>
                    <MenuItem value={"config2.yml"}>config2.yml</MenuItem>
                    <MenuItem value={"unfollow.yml"}>unfollow.yml</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <Tooltip title="Remove bot from pool." arrow>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeProcess(process.username)}
                  >
                    Remove
                  </Button>
                </Tooltip>
              </Box>
            </>
          ) : (
            <Box>
              <Tooltip title="Stop bot" arrow>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => process.scheduled ? removeSchedule(process.username) : handleStop(process.username)}
                >
                  {process.scheduled ? "Remove Schedule" : "Stop"}
                </Button>
              </Tooltip>
            </Box>
          )}
          <Box>
            <Tooltip title="Preview device" arrow>
              <Button
                variant="contained"
                color="primary"
                key={`${process.device.id} ${process.username}`}
                onClick={(event) => handleDevicePreview(event, process)}
              >{
                  isLoading ? (
                    <CircularProgress color="inherit" size={25} />
                  ) : (
                    "Preview"
                  )
                }</Button>
            </Tooltip>
          </Box>
        </Box>
        {process.status === "STOPPED" || process.status === "FINISHED" ?
          <Typography variant="body1" color="red" sx={{ padding: '0.5rem 0 0.5rem 0' }}>
            * Be sure to change the config file manually before starting the bot.
          </Typography>
          : null}
      </AccordionDetails>
    </A >
  );
});
