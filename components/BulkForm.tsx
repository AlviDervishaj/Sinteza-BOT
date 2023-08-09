// React
import { FC, useCallback, useEffect, useState } from "react";

// Material UI
import {
  Button,
  Container,
  Tooltip,
  TextField,
  Typography,
  Grid,
  Box,
  Stack,
} from "@mui/material";

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
  ConfigNames,
} from "../utils/Types";
import { io, Socket } from "socket.io-client";
import { Output } from "./Output";

export type BulkFormData = {
  usernames: string[];
  devices: Device[];
  jobs: Jobs;
  config_name?: ConfigNames;
  "speed-multiplier"?: number;
  "truncate-sources"?: string;
  "blogger-followers"?: string[];
  "hashtag-likers-top"?: string[];
  "unfollow-non-followers"?: string;
  "unfollow-skip-limit"?: string;
  "working-hours"?: string[];
};

export type BulkWriteData = {
  formData: BulkFormData;
  membership: Array<"FREE" | "PREMIUM">;
  scheduled: string | false;
  startTime: number;
  status: "RUNNING" | "WAITING" | "FINISHED" | "STOPPED";
};
let socket: Socket;
export const BulkForm: FC = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [devices, setDevices] = useState<string>("");
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [usernames, setUsernames] = useState<string>("");
  const [memberships, setMemberships] = useState<string>("");
  const [data, setData] = useState<string>("");
  const [alreadyCalled, setAlreadyCalled] = useState<boolean>(false);

  const refreshDevices = (): void => {
    socket.emit<EventTypes>("get-devices");
    return;
  };

  const logData = useCallback((data: string): void => {
    setData((prev) => {
      if (prev.includes(data)) return prev;
      prev += `${data}\n`;
      return prev;
    });
    return;
  }, []);

  const _logData = useCallback((data: string): void => {
    setData((prev) => {
      prev += `${data}\n`;
      return prev;
    });
    return;
  }, []);

  // check form data
  const checkFormData = (): void | true => {
    if (usernames.trim() === "") {
      return logData("Please enter usernames.");
    }
    if (devices.trim() === "") {
      return logData("Please enter a device ID.");
    }
    if (memberships.trim() === "") {
      return logData("Please enter a membership.");
    }
    return true;
  };

  const checkIfUsernameIsRunning = (_username: string): boolean => {
    const isRunning =
      processes.filter(
        (p) =>
          p.username === _username &&
          (p.status === "RUNNING" || p.status === "WAITING")
      ).length > 0;
    if (isRunning) {
      logData(`${_username} is already running !`);
      return true;
    } else return false;
  };

  function getDevices(devicesIds: Array<string>): Array<Device> {
    const _devices = [];
    for (const device of availableDevices) {
      if (devicesIds.includes(device.id)) {
        _devices.push(device);
      }
    }
    return _devices;
  }

  const checkIfDeviceIsBeingUsed = (_deviceId: string): boolean => {
    const isRunning =
      processes.filter(
        (p) =>
          p.device.id === _deviceId &&
          (p.status === "RUNNING" || p.status === "WAITING")
      ).length > 0;
    if (isRunning) {
      logData(`${_deviceId} is already running !`);
      return true;
    } else return false;
  };
  const callApi = async (): Promise<void> => {
    if (alreadyCalled) return;
    if (checkFormData() !== true) return;
    // check usernames
    const splitUsernames: string[] = usernames.split(" ");
    const splitDevices: string[] = devices.split(" ");
    const splitMemberships: string[] = memberships.split(" ");
    // check length of data entered
    if (
      splitDevices.length !== splitUsernames.length &&
      splitUsernames.length !== splitMemberships.length
    ) {
      return _logData(
        "Please enter the same ammount of usernames, devices and memberships !"
      );
    }
    // check usernames
    _logData("[INFO] Checking if any users are running");
    splitUsernames.forEach((username: string) => {
      if (checkIfUsernameIsRunning(username)) {
        return;
      }
    });
    // check devices
    _logData("[INFO] Checking if device is available");
    splitDevices.forEach((deviceId: string) => {
      if (checkIfDeviceIsBeingUsed(deviceId)) {
        return;
      }
    });
    _logData("[INFO] Checking memberships");
    splitMemberships.forEach((_membership: string) => {
      if (_membership !== "FREE" && _membership !== "PREMIUM") {
        _logData(`Membership value error.`);
        _logData(`${_membership} must either be FREE or PREMIUM`);
        return;
      }
    });
    // now data is correct
    // convert deviceId to Device
    let _devices: Device[] = getDevices(splitDevices);
    const data: BulkWriteData = {
      formData: {
        usernames: splitUsernames,
        devices: _devices,
        jobs: ["follow"],
        config_name: "config.yml",
        "speed-multiplier": 1,
        "blogger-followers": [""],
        "hashtag-likers-top": [""],
        "working-hours": ["0-24"],
      },
      membership: splitMemberships as Array<"FREE" | "PREMIUM">,
      scheduled: false,
      startTime: Date.now(),
      status: "RUNNING",
    };

    createProcesses(data);
    setAlreadyCalled(false);
    _logData("Stared processes.");
  };
  function createProcesses(data: BulkWriteData) {
    socket.emit<EventTypes>("create-processes", data);
  }

  useEffect(() => {
    function handleSocketConnection() {
      socket = io("ws://localhost:3030", {
        autoConnect: true,
        closeOnBeforeunload: true,
      });
      socket.on("connect", () => {
        console.log("Connected from bot!");
      });

      socket.on<EmitTypes>("create-processes-message", (output: string) => {
        if (output.includes("[ERROR]")) logData(output);
      });

      socket.on<EmitTypes>(
        "get-devices-message",
        (data: DeviceSkeleton[]): void => {
          logData(`[INFO] ${data.length} devices connected.`);
          // convert to Device class
          if (data.length <= 0) {
            setAvailableDevices([]);
            return;
          }
          let temp: Device[] = [];
          data.forEach((_device: DeviceSkeleton) => {
            if (temp.find((_d: Device) => _d.id === _device._id)) return;
            else {
              temp.push(
                new Device(
                  _device._id,
                  _device._name,
                  _device._battery,
                  _device._process
                )
              );
            }
          });
          setAvailableDevices(temp);
          return;
        }
      );

      socket.on<EmitTypes>(
        "get-processes-message",
        (result: string | ProcessSkeleton[]): void => {
          if (typeof result === "string") {
            return;
          } else {
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
                      _p._startTime
                    );
                  })
                : [];
            setProcesses(proc);
            return;
          }
        }
      );
      socket.on<EmitTypes>("start-bot-checks-message", (data: string): void => {
        if (data.trim() !== "") {
          logData(data);
          return;
        }
      });
      socket.on<EmitTypes>(
        "create-processes-message",
        (data: string | Process): void => {
          console.log({ data });
          return;
        }
      );
    }
    handleSocketConnection();
    return () => {
      socket.emit("close");
      socket.disconnect();
    };
  }, [logData]);

  useInterval(() => {
    socket.emit<EventTypes>("get-processes");
  }, 1000 * 3);
  useInterval(() => {
    socket.emit<EventTypes>("get-devices");
  }, 1000 * 2);

  return (
    <>
      <Container maxWidth="sm">
        <Typography variant="h3" textAlign={"center"} margin={"2rem 0 3rem"}>
          Add a Bot Bulk
        </Typography>
        <Box>
          <Stack spacing={2}>
            <TextField
              type="text"
              id="usernames"
              name="usernames"
              required
              label="Usernames"
              value={usernames}
              autoComplete="no"
              onChange={(event) => setUsernames(event.target.value)}
              placeholder="Enter usernames"
            />
            <TextField
              type="text"
              id="devices"
              name="devices"
              required
              label="Devices"
              value={devices}
              autoComplete="no"
              onChange={(event) => setDevices(event.target.value)}
            />
            <Box>
              <TextField
                type="text"
                id="memberships"
                name="memberships"
                required
                fullWidth
                label="Memberships"
                value={memberships}
                autoComplete="no"
                onChange={(event) => setMemberships(event.target.value)}
              />
              <Typography>* Correct values : FREE or PREMIUM</Typography>
            </Box>
          </Stack>
          <Grid
            container
            spacing={3}
            sx={{ paddingBottom: "2rem", margin: "0 auto" }}
          >
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
                <Button
                  variant="contained"
                  color="info"
                  onClick={() => refreshDevices()}
                >
                  Refresh Devices
                </Button>
              </Tooltip>
            </Grid>
          </Grid>
        </Box>
      </Container>
      <Output data={data} />
    </>
  );
};
