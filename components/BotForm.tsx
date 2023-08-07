// React
import { FC, useCallback, useEffect, useState, ReactNode } from "react";

// Notistack
import { SnackbarKey, SnackbarMessage, useSnackbar } from "notistack";

// Material UI
import {
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Tooltip,
  Select,
  TextField,
  Typography,
  Grid,
  FormControlLabel,
  FormGroup,
  Switch,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { Close } from "@mui/icons-material";

// DayJs
import dayjs, { Dayjs } from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime";
import Duration from "dayjs/plugin/duration";
import Calendar from "dayjs/plugin/calendar";

// Hooks
import { useInterval } from "usehooks-ts";

// Utils
import { Process, ProcessSkeleton } from "../utils/Process";
import { Device } from "../utils/Devices";
import {
  BotFormData,
  Jobs,
  EventTypes,
  EmitTypes,
  DeviceSkeleton
} from "../utils/Types";
import { io, Socket } from "socket.io-client";
import { Output } from "./Output";

dayjs.extend(RelativeTime);
dayjs.extend(Duration);
dayjs.extend(Calendar);

let socket: Socket;

export const BotForm: FC = () => {
  // input changes trigger socket connection 
  const [processes, setProcesses] = useState<Process[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [alreadyCalled, setAlreadyCalled] = useState<boolean>(false);
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [membership, setMembership] = useState<"PREMIUM" | "FREE">("FREE");
  const [scheduledTime, setScheduledTime] = useState<Dayjs | null>(dayjs());
  const { closeSnackbar, enqueueSnackbar } = useSnackbar();
  const [isUnfollowedChecked, setIsUnfollowedChecked] =
    useState<boolean>(false);
  const [isHashtagChecked, setIsHashtagChecked] = useState<boolean>(false);
  const [data, setData] = useState<string>("");
  const [formData, setFormData] = useState<BotFormData>({
    username: "",
    device: new Device("", "", "", null),
    password: "",
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

  const notifyActions = useCallback((id: SnackbarKey): ReactNode => (
    <>
      <Button variant="text" color="inherit" onClick={() => closeSnackbar(id)}>
        <Close color={"inherit"} />
      </Button>
    </>
  ), [closeSnackbar]);

  const refreshDevices = (): void => {
    socket.emit<EventTypes>("get-devices");
    return;
  }

  const notify = useCallback((
    message: SnackbarMessage,
    variant: "error" | "info" | "default" | "success"
  ): void => {
    enqueueSnackbar(message, { variant, action: notifyActions });
    return;
  }, [enqueueSnackbar, notifyActions])

  // check for schduled time
  const checkScheduledTime = (): dayjs.Dayjs | false => {
    if (scheduledTime === null) return false;
    return scheduledTime;
  };

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
    if (!formData.username || formData.username.trim() === "") {
      return notify("Please enter a username.", "error");
    }
    if (!formData.device.id || formData.device.id.trim() === "") {
      return notify("Please select a device.", "error");
    }
    if (!formData.password || formData.password.trim() === "") {
      logData("[INFO] Password: DEFAULT");
    }
    if (!formData["speed-multiplier"] || formData["speed-multiplier"] === 0) {
      logData("[INFO] Speed Multiplier: DEFAULT");
    }
    if (
      !formData["truncate-sources"] ||
      formData["truncate-sources"].trim() === ""
    ) {
      logData("[INFO] Truncate Sources: DEFAULT");
    }
    if (
      !formData["blogger-followers"] ||
      formData["blogger-followers"].length === 0
    ) {
      logData("[INFO] Blogger Followers: To be commented");
    }
    if (
      !formData["hashtag-likers-top"] ||
      formData["hashtag-likers-top"].length === 0
    ) {
      logData("[INFO] Hashtag Likes Top: To be commented");
    }
    if (
      !formData["unfollow-non-followers"]) {
      logData("[INFO] Unfollow Non Followers: To be commented");
    }
    if (
      !formData["unfollow-skip-limit"]) {
      logData("[INFO] Unfollow Skip Limit: DEFAULT");
    }
    if (!formData["working-hours"] || formData["working-hours"].length === 0) {
      logData("[INFO] Working Hours: DEFAULT");
    }
    return true;
  };

  // reactive schedule change
  const handleScheduledChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setIsScheduled(event.target.checked);
    return;
  };

  // handle job options
  const handleHashtagChecked = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setIsHashtagChecked(event.target.checked);
    return;
  };
  // handle job options
  const handleUnfollowedChecked = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setIsUnfollowedChecked(event.target.checked);
    return;
  };

  // hande schedule
  const handleSchedule = (_isScheduled: dayjs.Dayjs | false): number | false => {
    if (_isScheduled !== false) {
      const startTime: number = _isScheduled.valueOf();
      const timeNow: number = dayjs().valueOf();
      const millis: number = startTime - timeNow;
      if (millis < 120000) {
        notify("Starting bot now ...", "info");
        return false;
      }
      notify("Bot scheduled !", "success");
      return millis;
    }
    return false;
  };

  // check jobs 
  const checkJobs = (): Jobs => {
    // check if hashtags and unfollowed are checked
    if (isHashtagChecked) {
      if (isUnfollowedChecked) {
        // all options selected
        return ["hashtags", "unfollow"];
      }
      else {
        return ["hashtags", "follow"];
      }
    }
    if (isUnfollowedChecked) {
      // all options selected
      return ["unfollow"];
    }
    else {
      return ["follow"];
    }
  };

  // schedule Bot start
  const scheduleBot = async (result: number, _isScheduled: Dayjs): Promise<void> => {
    notify(
      `Bot will start ${dayjs(_isScheduled.valueOf()).fromNow()} `,
      "info"
    );
    // call api to get device battery
    const data: {
      formData: BotFormData,
      membership: "FREE" | "PREMIUM",
      jobs: Jobs,
      scheduled: string | false,
      startTime: number,
      startsAt: number,
      status: "RUNNING" | "WAITING" | "FINISHED" | "STOPPED"
    } = {
      formData: formData,
      membership,
      jobs: checkJobs(),
      scheduled: _isScheduled.toString(),
      startsAt: result,
      status: "WAITING",
      startTime: Date.now()
    };
    socket.emit<EventTypes>("create-process", data);
    return;
  }

  const checkIfUsernameIsRunning = (): boolean => {
    if (
      processes.filter(
        (p) =>
          p.username === formData.username &&
          (p.status === "RUNNING" || p.status === "WAITING")
      ).length > 0
    ) {
      notify("Bot is already running !", "error");
      return true;
    }
    else return false;
  }
  const callApi = async (): Promise<void> => {
    const _isScheduled = checkScheduledTime();
    if (alreadyCalled) return;
    if (checkFormData() !== true) return;
    setAlreadyCalled(true);
    logData("[INFO] Checking if device is available...");
    // get device
    const device = formData.device;
    if (checkIfUsernameIsRunning()) {
      return;
    }
    if (device.process) {
      notify("Device is in use.", "error");
      return;
    }
    logData("[INFO] Starting bot checks... ");
    // start bot
    // cron job
    const result = handleSchedule(_isScheduled);
    if (result !== false && _isScheduled !== false) {
      scheduleBot(result, _isScheduled);
    } else {
      const data: {
        formData: BotFormData,
        membership: "FREE" | "PREMIUM",
        jobs: Jobs,
        scheduled: string | false,
        startTime: number,
        status: "RUNNING" | "WAITING" | "FINISHED" | "STOPPED"
      } = {
        formData,
        membership,
        jobs: checkJobs(),
        scheduled: false,
        status: "RUNNING",
        startTime: Date.now()
      };
      createProcess(data);
      setAlreadyCalled(false);
    }
  };
  function createProcess(data: {
    formData: BotFormData,
    membership: "FREE" | "PREMIUM",
    jobs: Jobs,
    scheduled: string | false,
    startTime: number,
    status: "RUNNING" | "WAITING" | "FINISHED" | "STOPPED"
  }) {
    socket.emit<EventTypes>("create-process", data);
  }


  useEffect(() => {
    function handleSocketConnection() {

      socket = io("ws://localhost:3030", { autoConnect: true, closeOnBeforeunload: true });
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

      socket.on<EmitTypes>("get-devices-message", (data: DeviceSkeleton[]): void => {
        logData(`[INFO] ${data.length} devices connected.`)
        // convert to Device class
        if (data.length <= 0) { setDevices([]); return; }
        let temp: Device[] = [];
        data.forEach((_device: DeviceSkeleton) => {
          if (temp.find((_d: Device) => _d.id === _device._id)) return;
          else {
            temp.push(new Device(_device._id, _device._name, _device._battery, _device._process));
          }
        });
        setDevices(temp);
        return;
      });
      socket.on<EmitTypes>("create-process-message", (data: string | Process[]) => {
        if (typeof data === "string") {
          return;
        }
        else {
          notify("Bot started !", "success");
        }
      });

      socket.once("connect", () => {
        console.log("Connected to socket!");
      });
      socket.on<EmitTypes>("start-bot-checks-message", (data: string): void => {
        if (data.trim() !== "") {
          notify(data, "error");
          return;
        }
      })
      socket.on<EmitTypes>("create-processes-message", (data: string | Process): void => {
        if (typeof data === "string") {
          notify(data.replace("[ERROR]", ""), "error");
          return;
        }
        else {
          console.log({ data });
          return;
        }
      });
    }
    handleSocketConnection();
    return () => {
      socket.emit("close");
      socket.disconnect();
    }
  }, [logData, notify])

  useInterval(() => {
    socket.emit<EventTypes>("get-processes");
  }, 1000 * 3)
  useInterval(() => {
    socket.emit<EventTypes>("get-devices");
  }, 1000 * 2)

  return (
    <>
      <Container maxWidth="sm">
        <Typography variant="h3" textAlign={"center"} margin={"2rem 0 3rem"}>
          Add a Bot
        </Typography>
        <Grid container spacing={2} gap={4}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                type="text"
                id="username"
                name="username"
                required
                label="Username"
                value={formData.username}
                autoComplete="no"
                onChange={(event) =>
                  setFormData((previousData: BotFormData) => ({
                    ...previousData,
                    username: event.target.value,
                  }))
                }
                placeholder="Enter username"
              />
              <Typography paragraph>
                Instagram username of the user that the bot will run for
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="select-device">Select a Device</InputLabel>
                <Select
                  id="devices"
                  labelId="select-device"
                  label="Select a device"
                  required
                  value={formData.device.id}
                  onChange={(event) =>
                    setFormData((previousData: BotFormData) => {
                      return ({
                        // find the device by id
                        ...previousData,
                        device: devices.filter(
                          (device) => device.id === event.target.value
                        )[0],
                      });
                    })
                  }
                >
                  {devices.length > 0 ? (
                    devices.sort((a: Device, b: Device) => {
                      if (a.name > b.name) return 1;
                      else if (a.name === b.name) return 0;
                      else return -1;
                    }).map((device) => (
                      <MenuItem key={device.id} value={device.id}>
                        {device.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value={""}>
                      Getting devices ...
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
              <Typography paragraph>
                Refresh the devices by clicking the button below.
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                type="password"
                id="password"
                name="password"
                label="Password"
                value={formData.password}
                autoComplete="no"
                onChange={(event) =>
                  setFormData((previousData: BotFormData) => ({
                    ...previousData,
                    password: event.target.value,
                  }))
                }
                placeholder="Enter password"
              />
              <Typography paragraph>Instagram password of the user</Typography>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="select-membership">
                  Select a membership
                </InputLabel>
                <Select
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
                </Select>
              </FormControl>
              <Typography paragraph>
                Select the membership of the client.
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                type="number"
                id="speed-multiplier"
                name="speed-multiplier"
                label="Speed"
                value={formData["speed-multiplier"]}
                autoComplete="no"
                onChange={(event) =>
                  setFormData((previousData: BotFormData) => ({
                    ...previousData,
                    "speed-multiplier": event.target.value as any,
                  }))
                }
                placeholder="Enter Speed"
              />
              <Typography paragraph>Format: Just a number</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="text"
                id="truncateSources"
                name="truncateSources"
                label="Truncate Sources"
                value={formData["truncate-sources"]}
                autoComplete="no"
                onChange={(event) =>
                  setFormData((previousData: BotFormData) => ({
                    ...previousData,
                    "truncate-sources": event.target.value,
                  }))
                }
                placeholder="Truncate Process"
              />
              <Typography paragraph>Format: Start-End</Typography>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                type="text"
                id="bloggerFollowers"
                name="bloggerFollowers"
                label="Blogger Followers"
                value={formData["blogger-followers"]}
                disabled={isUnfollowedChecked}
                autoComplete="no"
                onChange={(event) =>
                  setFormData((previousData: BotFormData) => ({
                    ...previousData,
                    ["blogger-followers"]: event.target.value
                      .toString()
                      .split(" "),
                  }))
                }
                placeholder="Blogger followers"
              />
              <Typography paragraph>Format: Username1 ...</Typography>
            </Grid>
            <Grid item xs={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isHashtagChecked}
                      onChange={handleHashtagChecked}
                      inputProps={{ "aria-label": "controlled" }}
                      size={"medium"}
                      value="hashtag-likers-top"
                    />
                  }
                  label="Hashtag ?"
                />
              </FormGroup>
              <TextField
                type="text"
                id="hashtagLikesTop"
                name="hashtagLikesTop"
                label="Hashtag Likers Top"
                value={formData["hashtag-likers-top"]}
                disabled={!isHashtagChecked}
                autoComplete="no"
                onChange={(event) =>
                  setFormData((previousData: BotFormData) => ({
                    ...previousData,
                    ["hashtag-likers-top"]: event.target.value
                      .toString()
                      .split(" "),
                  }))
                }
                placeholder="Hashtag likes top"
              />
              <Typography paragraph>Format: hashtag1 ...</Typography>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isUnfollowedChecked}
                      onChange={handleUnfollowedChecked}
                      inputProps={{ "aria-label": "controlled" }}
                      size={"medium"}
                      value="unfollow-non-followers"
                    />
                  }
                  label="Unfollow ?"
                />
              </FormGroup>
              <TextField
                type="text"
                id="unfollowNonFollowers"
                name="unfollowNonFollowers"
                value={formData["unfollow-non-followers"]}
                label="Unfollow Non Followers"
                autoComplete="no"
                disabled={!isUnfollowedChecked}
                onChange={(event) =>
                  setFormData((previousData: BotFormData) => ({
                    ...previousData,
                    ["unfollow-non-followers"]: event.target.value,
                  }))
                }
                placeholder="Unfollow non followers"
              />
              <Typography paragraph>Format: Min-Max</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="text"
                id="unfollowSkipLimit"
                name="unfollowSkipLimit"
                value={formData["unfollow-skip-limit"]}
                label="Unfollow Skip Limit"
                autoComplete="no"
                onChange={(event) =>
                  setFormData((previousData: BotFormData) => ({
                    ...previousData,
                    ["unfollow-skip-limit"]: event.target.value,
                  }))
                }
                placeholder="Unfollow skip limit"
              />
              <Typography paragraph>Format: Number</Typography>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                type="text"
                id="workingHours"
                name="workingHours"
                value={formData["working-hours"]}
                autoComplete="no"
                label="Working Hours"
                onChange={(event) =>
                  setFormData((previousData: BotFormData) => ({
                    ...previousData,
                    ["working-hours"]: event.target.value.toString().split(" "),
                  }))
                }
                placeholder="Working hours"
              />
              <Typography paragraph>Format: HH.MM-HH.MM HH.MM-HH.MM</Typography>
            </Grid>
            <Grid item xs={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isScheduled}
                      onChange={handleScheduledChange}
                      inputProps={{ "aria-label": "controlled" }}
                      size={"medium"}
                    />
                  }
                  label="Schedule ?"
                />
              </FormGroup>
              <DateTimePicker
                label="Schedule Start Time"
                disabled={!isScheduled}
                disablePast
                value={scheduledTime}
                yearsPerRow={3}
                closeOnSelect={false}
                onChange={(newValue) => setScheduledTime(newValue)}
              />
            </Grid>
          </Grid>
          <Grid container spacing={3} sx={{ paddingBottom: '2rem' }}>
            <Grid item>
              <Tooltip title="Start Bot">
                <Button
                  variant="contained"
                  color="success"
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
