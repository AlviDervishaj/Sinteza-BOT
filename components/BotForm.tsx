// React
import { FC, useState } from "react";

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
import { useEffectOnce } from "usehooks-ts";

// Utils
import { Process } from "../utils/Process";
import {
  BotFormData,
  ConfigRows,
  SessionConfigSkeleton,
  SessionProfileSkeleton,
} from "../utils/Types";
import { start_bot, start_bot_checks } from "../utils/api-client";
import axios from "axios";
import { URLcondition } from "../utils";

type Props = {
  setData: (data: string) => void;
  logData: (data: string) => void;
  getDevices: () => void;
  devices: { id: string; name: string }[];
  processes: Process[];
  addToPool: (process: Process) => void;
  killBot: (event: any, process: Process) => void;
  updateProcessResult: (process: Process, result: string) => void;
};

dayjs.extend(RelativeTime);
dayjs.extend(Duration);
dayjs.extend(Calendar);

export const BotForm: FC<Props> = ({
  getDevices,
  logData,
  devices,
  processes,
  addToPool,
  updateProcessResult,
}) => {
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
    enqueueSnackbar(message, { variant, action: notifyActions });
    return;
  };
  const [alreadyCalled, setAlreadyCalled] = useState<boolean>(false);
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [membership, setMembership] = useState<"PREMIUM" | "FREE">("FREE");
  const [scheduledTime, setScheduledTime] = useState<Dayjs | null>(dayjs());
  const { closeSnackbar, enqueueSnackbar } = useSnackbar();
  const [isUnfollowedChecked, setIsUnfollowedChecked] =
    useState<boolean>(false);
  const [scheduledBots, setScheduledBots] = useState<Process[]>([]);
  const [isHashtagChecked, setIsHashtagChecked] = useState<boolean>(false);
  const [formData, setFormData] = useState<BotFormData>({
    username: "",
    device: { id: "", name: "" },
    password: "",
    "speed-multiplier": 1,
    "truncate-sources": "",
    "blogger-followers": [""],
    "hashtag-likers-top": [""],
    "unfollow-non-followers": "",
    "unfollow-skip-limit": "",
    "working-hours": ["8.30-16.40", "18.15-22.46"],
  });

  const checkScheduledTime = (): dayjs.Dayjs | false => {
    if (scheduledTime === null) return false;
    return scheduledTime;
  };
  useEffectOnce(() => {
    getDevices();
  });
  const checkFormData = () => {
    if (!formData.username || formData.username.trim() === "") {
      return notify("Please enter a username.", "error");
    }
    if (!formData.device.id || formData.device.name.trim() === "") {
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
      logData("[INFO] Blogger Followers: DEFAULT");
    }
    if (
      !formData["hashtag-likers-top"] ||
      formData["hashtag-likers-top"].length === 0
    ) {
      logData("[INFO] Hashtag Likes Top: DEFAULT");
    }
    if (
      !formData["unfollow-non-followers"] ||
      formData["unfollow-non-followers"].trim() === ""
    ) {
      logData("[INFO] Unfollow Non Followers: DEFAULT");
    }
    if (
      !formData["unfollow-skip-limit"] ||
      formData["unfollow-skip-limit"].trim() === ""
    ) {
      logData("[INFO] Unfollow Skip Limit: DEFAULT");
    }
    if (!formData["working-hours"] || formData["working-hours"].length === 0) {
      logData("[INFO] Working Hours: DEFAULT");
    }
    return true;
  };
  const startBotChecks = async () => {
    // start process
    start_bot_checks(formData, (output: string) => {
      logData(output);
    });
    setAlreadyCalled(false);
  };

  const getBatteryPercentage = async (device: string) => {
    const result = await axios.post(`${URLcondition}/deviceBattery`, {
      deviceId: device,
    });
    const data = result.data;
    const fBattery: string = data.trim().split(":")[1];
    return fBattery.trim();
  };

  const handleScheduledChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsScheduled(event.target.checked);
  };

  const handleHashtagChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsHashtagChecked(event.target.checked);
  };
  const handleUnfollowedChecked = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsUnfollowedChecked(event.target.checked);
  };
  const checkIfDeviceIsBeingUsed = () => {
    const p = processes.filter(
      (p) =>
        p.device.id === formData.device.id &&
        (p.status === "RUNNING" || p.status === "WAITING")
    );
    if (p.length > 0) {
      notify("Device is already in use !", "error");
      return true;
    } else return false;
  };

  const handleSchedule = (_isScheduled: dayjs.Dayjs | false) => {
    if (_isScheduled !== false) {
      const startTime = _isScheduled.valueOf();
      const timeNow = dayjs().valueOf();
      const millis = startTime - timeNow;
      if (millis < 120000) {
        notify("Starting bot now ...", "info");
        return false;
      }
      notify("Bot scheduled !", "success");
      return millis;
    }
    return false;
  };

  const checkOptions = () => {
    // check if hashtags and unfollowed are checked
    if (isHashtagChecked) {
      if (isUnfollowedChecked) {
        // all options selected
        return ["hashtags", "unfollow"];
      }
      if (!isUnfollowedChecked) {
        return ["hashtags", "follow"];
      }
    }
    if (isUnfollowedChecked) {
      // all options selected
      return ["unfollow"];
    }
    if (!isUnfollowedChecked) {
      return ["follow"];
    }
  };


  const scheduleBot = async (result: number, _isScheduled: Dayjs, options: string[] | undefined) => {
    notify(
      `Bot will start ${dayjs(_isScheduled.valueOf()).fromNow()} `,
      "info"
    );
    const battery = await getBatteryPercentage(formData.device.id);
    // call api to get device battery
    const p = new Process(
      formData.device,
      formData.username,
      membership,
      "WAITING",
      "[INFO] Waiting for scheduled time...\n",
      0,
      0,
      0,
      ConfigRows,
      SessionConfigSkeleton,
      SessionProfileSkeleton,
      0,
      _isScheduled.toString(),
      `${battery}%`
    );
    setScheduledBots((previous) => [...previous, p])
    addToPool(p);
    setTimeout(() => {
      if (
        processes.filter(
          (p) =>
            p.username === formData.username &&
            (p.status === "RUNNING" || p.status === "WAITING")
        ).length > 0
      ) {
        notify("Bot is already running !", "error");
        return;
      }
      if (scheduledBots.filter((p) => p.username === formData.username).length > 0) {
        notify("Bot already scheduled !", "error");
        return;
      }
      p.status = "RUNNING";
      p.scheduled = false;
      start_bot(formData, (output: string) => {
        updateProcessResult(p, output);
      });
      notify("Bot started !", "success");
      setAlreadyCalled(false);
    }, result);
    return;
  }

  const checkIfUsernameIsRunning = () => {
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

  const callApi = async () => {
    const options = checkOptions();
    const _isScheduled = checkScheduledTime();
    if (alreadyCalled) return;
    if (checkFormData() !== true) return;
    setAlreadyCalled(true);
    logData("[INFO] Checking if device is available...");
    if (checkIfDeviceIsBeingUsed()) {
      return;
    }
    if (checkIfUsernameIsRunning()) {
      return;
    }
    logData("[INFO] Starting bot checks... ");
    await startBotChecks();
    // cron job
    const result = handleSchedule(_isScheduled);
    if (result !== false && _isScheduled !== false) {
      scheduleBot(result, _isScheduled, options);
    } else {
      logData("[INFO] Starting bot...");
      const battery = await getBatteryPercentage(formData.device.id);
      const p = new Process(
        formData.device,
        formData.username,
        membership,
        "RUNNING",
        "",
        0,
        0,
        0,
        ConfigRows,
        SessionConfigSkeleton,
        SessionProfileSkeleton,
        0,
        false,
        `${battery}%`
      );
      start_bot(formData, (output: string) => {
        updateProcessResult(p, output);
      });
      notify("Bot started !", "success");
      addToPool(p);
      setAlreadyCalled(false);
    }
  };
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
                    setFormData((previousData: BotFormData) => ({
                      // find the device by id
                      ...previousData,
                      device: devices.filter(
                        (device) => device.id === event.target.value
                      )[0],
                    }))
                  }
                >
                  {devices.length > 0 ? (
                    devices.sort((a, b) => {
                      if (a.name > b.name) return 1;
                      else if (a.name === b.name) return 0;
                      else return -1;
                    }).map((device) => (
                      <MenuItem key={device.id} value={device.id}>
                        {device.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value={""}>No devices found</MenuItem>
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
          <Grid container spacing={3}>
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
                <Button variant="contained" color="info" onClick={getDevices}>
                  Refresh Devices
                </Button>
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
