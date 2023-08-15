"use client";

// React & NextJs
import { FC, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Material UI
import {
  Button,
  Container,
  Tooltip,
  TextField,
  Typography,
  Box,
  Stack,
  Skeleton,
  Backdrop,
} from "@mui/material";

// Hooks
import { useInterval, useTimeout } from "usehooks-ts";

// Utils
import { Process } from "../utils/Process";
import { Device } from "../utils/Devices";
import {
  Jobs,
  EventTypes,
  EmitTypes,
  DeviceSkeleton,
  ConfigNames,
} from "../utils/Types";

// Socket IO
import { io, Socket } from "socket.io-client";
import { GridLoader } from "react-spinners";

// Components
const LazyOutput = dynamic(() => import("./Output").then((mod) => mod.Output), {
  loading: () => (
    <Skeleton
      variant="rectangular"
      sx={{ bgcolor: "grey.200", margin: "1rem auto" }}
      width={"100%"}
      height={"20rem"}
    />
  ),
});

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
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
    setIsLoading(true);
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

      socket.on<EmitTypes>("create-processes-message", (output: string) => {
        setIsLoading(false);
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

      socket.on<EmitTypes>("start-bot-checks-message", (data: string): void => {
        if (data.trim() !== "") {
          logData(data);
          return;
        }
      });
      socket.on<EmitTypes>("create-processes-message", (data: string): void => {
        logData(data);
        return;
      });
    }
    handleSocketConnection();
    return () => {
      socket.emit("close");
      socket.disconnect();
    };
  }, [logData]);

  useTimeout(() => {
    setIsLoading(false);
  }, 1000 * 2.1);

  useInterval(() => {
    socket.emit<EventTypes>("get-devices");
  }, 1000 * 5);
  if (isLoading) {
    return (
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme: any) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <GridLoader color="#00bbf9" loading={isLoading} margin={6} size={30} />
      </Backdrop>
    );
  }
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
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-evenly",
                paddingBottom: "2rem",
              }}
            >
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
              <Tooltip title="Refresh Devices">
                <Button
                  variant="contained"
                  color="info"
                  onClick={() => refreshDevices()}
                >
                  Refresh Devices
                </Button>
              </Tooltip>
            </Box>
          </Stack>
        </Box>
      </Container>
      <LazyOutput data={data} />
    </>
  );
};
