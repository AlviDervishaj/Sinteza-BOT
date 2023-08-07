// React
import { FC, useCallback, useEffect, useState } from "react";

// Material UI
import {
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Tooltip,
  TextField,
  Typography,
  Grid,
  Select as MuiSelect
} from "@mui/material";

import Select, { MultiValue } from "react-select";

// Hooks
import { useInterval } from "usehooks-ts";

// Utils
import { Process, ProcessSkeleton } from "../utils/Process";
import { Device } from "../utils/Devices";
import {
  Jobs,
  EventTypes,
  EmitTypes,
  DeviceSkeleton,
  ConfigNames
} from "../utils/Types";
import { io, Socket } from "socket.io-client";
import { Output } from "./Output";
import { debounce } from "../utils/utils";

type BulkFormData = {
  usernames: string[],
  devices: Device[],
  jobs: Jobs,
  config_name?: ConfigNames;
  "speed-multiplier"?: number;
  "truncate-sources"?: string,
  "blogger-followers"?: string[],
  "hashtag-likers-top"?: string[],
  "unfollow-non-followers"?: string,
  "unfollow-skip-limit"?: string,
  "working-hours"?: string[],
}

let socket: Socket;
export const BulkForm: FC = () => {
  // input changes trigger socket connection 
  const [processes, setProcesses] = useState<Process[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceNames, setDeviceNames] = useState<{ value: string, label: string }[]>([]);
  const [membership, setMembership] = useState<"PREMIUM" | "FREE">("FREE");
  const [data, setData] = useState<string>("");
  const [alreadyCalled, setAlreadyCalled] = useState<boolean>(false);
  const [formData, setFormData] = useState<BulkFormData>({
    usernames: [],
    devices: [],
    jobs: ['follow'],
    config_name: 'config.yml',
    "speed-multiplier": 1,
    "truncate-sources": "",
    "blogger-followers": [""],
    "hashtag-likers-top": [""],
    "unfollow-non-followers": "",
    "unfollow-skip-limit": "",
    "working-hours": ["8.30-16.40", "18.15-22.46"],
  });

  const refreshDevices = (): void => {
    socket.emit<EventTypes>("get-devices");
    return;
  }

  const logData = useCallback((data: string): void => {
    setData((prev) => {
      if (prev.includes(data)) return prev;
      prev += `${data}\n`;
      return prev
    });
    return;
  }, []);

  // check form data
  const checkFormData = (): void | true => {
    if (formData.usernames.length === 0) {
      return logData("Please enter usernames.");
    }
    if (formData.devices.length === 0) {
      return logData("Please select a device.");
    }
    return true;
  };

  const checkIfUsernameIsRunning = (_username: string): boolean => {
    const isRunning = processes.filter(
      (p) =>
        p.username === _username &&
        (p.status === "RUNNING" || p.status === "WAITING")
    ).length > 0
    if (isRunning) {
      logData(`${_username} is already running !`);
      return true;
    }
    else return false;
  }
  const callApi = async (): Promise<void> => {
    if (alreadyCalled) return;
    if (checkFormData() !== true) return;
    if (formData.usernames[0].split(",").length !== formData.devices.length) {
      logData("Please enter the same ammount of usernames and devices !");
      return;
    }
    logData("[INFO] Checking if device is available...");
    // check usernames
    formData.usernames.forEach((username: string) => {
      if (checkIfUsernameIsRunning(username)) {
        return;
      }
    });
    formData.devices.forEach((_device: Device) => {
      if (_device.process) {
        logData(`${_device.name} is in use.`);
        return;
      }
    })
    logData("[INFO] Starting bot checks... ");
    // start bot
    // cron job
    const data: {
      formData: BulkFormData,
      membership: "FREE" | "PREMIUM",
      jobs: Jobs,
      scheduled: string | false,
      startTime: number,
      status: "RUNNING" | "WAITING" | "FINISHED" | "STOPPED"
    } = {
      formData,
      membership,
      jobs: ['follow'],
      scheduled: false,
      status: "RUNNING",
      startTime: Date.now()
    };
    createProcesses(data);
    setAlreadyCalled(false);
  };
  function createProcesses(data: {
    formData: BulkFormData,
    membership: "FREE" | "PREMIUM",
    jobs: Jobs,
    scheduled: string | false,
    startTime: number,
    status: "RUNNING" | "WAITING" | "FINISHED" | "STOPPED"
  }) {
    socket.emit<EventTypes>("create-processes", data);
  }

  useEffect(() => {
    function handleSocketConnection() {
      socket = io("ws://localhost:3030", { autoConnect: true, closeOnBeforeunload: true });
      socket.on("connect", () => {
        console.log("Connected from bot!");
      });

      socket.on<EmitTypes>("create-processes-message", (output: string) => {
        if (output.includes("[ERROR]")) logData(output);
      })

      socket.on<EmitTypes>("get-devices-message", (data: DeviceSkeleton[]): void => {
        logData(`[INFO] ${data.length} devices connected.`)
        // convert to Device class
        if (data.length <= 0) { setDevices([]); return; }
        let temp: Device[] = [];
        let names: { value: string, label: string }[] = [];
        data.forEach((_device: DeviceSkeleton) => {
          if (temp.find((_d: Device) => _d.id === _device._id)) return;
          else {
            names.push({ value: _device._id, label: _device._name });
            temp.push(new Device(_device._id, _device._name, _device._battery, _device._process));
          }
        });
        setDevices(temp);
        setDeviceNames(names);
        return;
      });

      socket.on<EmitTypes>("get-processes-message", (result: string | ProcessSkeleton[]): void => {
        if (typeof result === "string") {
          return;
        }
        else {
          const proc =
            result.length > 0
              ? result.map((_p) => {
                return new Process(
                  _p._device,
                  _p._user.username,
                  _p._user.membership,
                  _p._status,
                  _p._result,
                  _p._total,
                  _p._following,
                  _p._followers,
                  _p._session,
                  _p._config,
                  _p._profile,
                  _p._total_crashes,
                  _p._scheduled,
                  _p._jobs,
                  _p._configFile,
                  _p._startTime,
                );
              })
              : [];
          setProcesses(proc);
          return;
        }
      });
      socket.on<EmitTypes>("start-bot-checks-message", (data: string): void => {
        if (data.trim() !== "") {
          logData(data);
          return;
        }
      })
      socket.on<EmitTypes>("create-processes-message", (data: string | Process): void => {
        console.log({ data });
        return;
      });
    }
    handleSocketConnection();
    return () => {
      socket.emit("close");
      socket.disconnect();
    }
  }, [logData])

  useInterval(() => {
    socket.emit<EventTypes>("get-processes");
  }, 1000 * 3)
  useInterval(() => {
    socket.emit<EventTypes>("get-devices");
  }, 1000 * 2);

  const handleMultipleDevicesSelected = debounce((data: MultiValue<{ label: string, value: string }>) => {
    console.log({ data });
    let temp: Device[] = [];
    data.forEach((_d: { label: string, value: string }) => {
      const d = devices.find((_device: Device) => _d.value === _device.id && _d.label === _device.name);
      if (d) {
        temp.push(d);
      }
    });
    formData.devices = temp;
  }, 500);

  return (
    <>
      <Container maxWidth="sm">
        <Typography variant="h3" textAlign={"center"} margin={"2rem 0 3rem"}>
          Add a Bot Bulk
        </Typography>
        <Grid container spacing={2} gap={4}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                type="text"
                id="usernames"
                name="usernames"
                required
                label="Usernames"
                value={formData.usernames}
                autoComplete="no"
                onChange={(event) =>
                  setFormData((previousData: BulkFormData) => ({
                    ...previousData,
                    usernames: event.target.value.split(" "),
                  }))
                }
                placeholder="Enter usernames"
              />
              <Typography paragraph>
                Instagram usernames *split by space*
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <Select
                  id="devices"
                  aria-label="Select devices"
                  isMulti
                  required
                  isClearable
                  isSearchable
                  options={deviceNames}
                  onChange={(event: MultiValue<{ label: string, value: string }>) => handleMultipleDevicesSelected(event)}
                />
              </FormControl>
              <Typography paragraph>
                Refresh the devices by clicking the button below.
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="select-membership">
                Select a membership
              </InputLabel>
              <MuiSelect
                id="membership"
                labelId="select-membership"
                label="Select a membership"
                required
                value={membership}
                onChange={(event) =>
                  setMembership(event.target.value as "PREMIUM" | "FREE")
                }
              >
                <MenuItem value="FREE">Free</MenuItem>
                <MenuItem value="PREMIUM">Premium</MenuItem>
              </MuiSelect>
            </FormControl>
            <Typography paragraph>
              Select the membership of the client.
            </Typography>
          </Grid>
          <Grid container spacing={3} sx={{ paddingBottom: '2rem' }}>
            <Grid item>
              <Tooltip title="Start Bot">
                <Button
                  variant="contained"
                  color="success"
                  disabled={alreadyCalled}
                  onClick={() => callApi()}
                >
                  Start Bot
                </Button>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Refresh Devices">
                <Button variant="contained" color="info" onClick={() => refreshDevices()}>
                  Refresh Devices
                </Button>
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>
      </Container>
      <Output data={data} />
    </>
  );
};
