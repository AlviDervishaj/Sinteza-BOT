import { FC, useState, useEffect } from "react";
import type { Dispatch, MouseEvent, SetStateAction } from "react";
import { Process } from "../utils/Process";
import {
  BotFormData,
  ConfigRows,
  SessionConfigSkeleton,
  SessionProfileSkeleton,
} from "../utils/Types";
import { start_bot, start_bot_checks } from "../utils/api-client";
import {
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Grid,
} from "@mui/material";

type Props = {
  setError: (error: string) => void;
  setData: (data: string) => void;
  logData: (data: string) => void;
  getDevices: () => void;
  displayError: (error: string) => void;
  devices: { id: string; name: string }[];
  processes: Process[];
  addToPool: (process: Process) => void;
  killBot: (event: any, process: Process) => void;
  updateProcessResult: (process: Process, result: string) => void;
};

export const BotForm: FC<Props> = ({
  setError,
  getDevices,
  devices,
  logData,
  processes,
  killBot,
  addToPool,
  updateProcessResult,
}) => {
  const [alreadyCalled, setAlreadyCalled] = useState<boolean>(false);
  const [membership, setMembership] = useState<"PREMIUM" | "FREE">("FREE");
  const [formData, setFormData] = useState<BotFormData>({
    username: "",
    device: { id: "", name: "" },
    password: "",
    "speed-multiplier": 1,
    "truncate-sources": "",
    "blogger-followers": [],
    "hashtag-likers-top": [],
    "unfollow-non-followers": "",
    "unfollow-skip-limit": "",
    "working-hours": [],
  });
  useEffect(() => {
    getDevices();
  }, []);
  const checkFormData = () => {
    if (!formData.username || formData.username.trim() === "") {
      return setError("Please enter a username.");
    }
    if (!formData.device || formData.device.name.trim() === "") {
      return setError("Please select a device.");
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
      logData("[INFO] Hashta Likes Top: DEFAULT");
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
    start_bot_checks(formData, (output: string) => {
      logData(output);
    });
    // start process
    setAlreadyCalled(false);
    // const data = await result.text();
    // logData(data);
  };
  const callApi = async (event: MouseEvent) => {
    event.preventDefault();
    if (alreadyCalled) return;
    if (checkFormData() !== true) return;
    setAlreadyCalled(true);
    logData("[INFO] Starting bot checks... ");
    await startBotChecks();
    logData("[INFO] Starting bot...");
    const p = new Process(
      formData.device,
      formData.username,
      membership,
      "RUNNING",
      "",
      [],
      0,
      0,
      ConfigRows,
      SessionConfigSkeleton,
      SessionProfileSkeleton
    );
    start_bot(formData, (output: string) => {
      updateProcessResult(p, output);
      addToPool(p);
    });
    setAlreadyCalled(false);
  };
  return (
    <>
      <Container maxWidth="sm">
        <Typography variant="h3" textAlign={"center"} marginBottom={"3rem"}>
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
                  {devices &&
                    devices.map((device) => (
                      <MenuItem key={device.id} value={device.id}>
                        {device.name}
                      </MenuItem>
                    ))}
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
            <Grid item>
              <TextField
                type="text"
                id="hashtagLikesTop"
                name="hashtagLikesTop"
                label="Hashtag Likers Top"
                value={formData["hashtag-likers-top"]}
                autoComplete="no"
                onChange={(event) =>
                  setFormData((previousData: BotFormData) => ({
                    ...previousData,
                    ["hashtag-likers-top"]: event.target.value
                      .trim()
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
              <TextField
                type="text"
                id="unfollowNonFollowers"
                name="unfollowNonFollowers"
                value={formData["unfollow-non-followers"]}
                label="Unfollow Non Followers"
                autoComplete="no"
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
              <Typography paragraph>Format: any</Typography>
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
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={4}>
              <Button
                disabled={alreadyCalled}
                onClick={(event) => callApi(event)}
                color="success"
                variant="contained"
              >
                Start Bot
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                onClick={() => getDevices()}
                color="info"
                variant="contained"
              >
                Refresh Devices
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                onClick={(event) =>
                  killBot(
                    event,
                    processes.filter(
                      (p) =>
                        p.device === formData.device &&
                        p.username === formData.username
                    )[0]
                  )
                }
                color="error"
                variant="contained"
              >
                Kill Bot
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
