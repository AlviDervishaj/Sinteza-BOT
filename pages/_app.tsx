// Fonts
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

// React & Next Js
import { useRef, useState, useCallback, Fragment } from "react";
import type { AppProps } from "next/app";
import { NextRouter, useRouter } from "next/router";

// Material UI
import {
  CssBaseline,
  CircularProgress,
  Typography,
  Box,
  Backdrop,
  Button,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Close } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Notistack
import {
  SnackbarProvider,
  useSnackbar,
  SnackbarKey,
  SnackbarMessage,
  enqueueSnackbar as enqs,
} from "notistack";

// Axios
import axios from "axios";

// Hooks
import { useEffectOnce, useEventListener, useInterval } from "usehooks-ts";

// Components
import {
  Navigation,
  Output,
  ProcessesTable,
  ShowProcesses,
  Snackbar,
} from "../components";
// Utils
import {
  Process,
  ProcessSkeleton,
  ConfigRows,
  ConfigRowsSkeleton,
  GetSessionFromPython,
  DevicesList,
  URLcondition,
  start_bot,
  BotFormData,
} from "../utils";
// Dayjs
import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime";
import Duration from "dayjs/plugin/duration";
import Calendar from "dayjs/plugin/calendar";

dayjs.extend(RelativeTime);
dayjs.extend(Duration);
dayjs.extend(Calendar);

export default function Sinteza({ Component, pageProps }: AppProps) {
  const router: NextRouter = useRouter();
  const scrollToMe = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<string>("");
  const [devices, setDevices] = useState<{ id: string; name: string }[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const lightTheme = createTheme({ palette: { mode: "light" } });
  const { closeSnackbar, enqueueSnackbar } = useSnackbar();

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
  const killBot = useCallback(async (event: any, proc: Process) => {
    if (proc.scheduled !== false) {
      const startTime = dayjs(proc.scheduled).valueOf();
      const timeLeft = startTime - dayjs().valueOf();
      console.log(timeLeft);
      enqs(`Scheduled Bot to terminate ${proc.scheduled}`, {
        variant: "info",
        action: notifyActions,
        autoHideDuration: 2000,
      });
      // execute callback after bot started.
      setTimeout(async () => {
        event.preventDefault();
        // call terminateProcess
        const result = await fetch(
          `${URLcondition}api/fetchProcesses?${new URLSearchParams({
            username: proc.username,
          })}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "text/plain",
            },
          }
        );
        const data = await result.text();
        const _processes = data.split("\n").map((p) =>
          p
            .split("   ")
            .filter((s) => s.length)
            .join(" ")
        );
        // remove all elements except the last one.
        const command = _processes[0];
        // get pid of command
        const pid = command
          .split(" ")
          .filter((elem) => elem.trim() !== "")[1]
          .trim();
        await fetch(
          `${URLcondition}api/terminateProcess?${new URLSearchParams({ pid })}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "text/plain",
            },
          }
        );
        enqs(`${proc.username} stopped.`, {
          variant: "success",
          action: notifyActions,
          autoHideDuration: 2000,
        });
        const _data: GetSessionFromPython = {
          username: proc.username,
          followers_now: proc.followers,
          following_now: proc.following,
        };
        enqs("Getting session data ...", {
          variant: "info",
          action: notifyActions,
          autoHideDuration: 2000,
        });
        const r = await axios.post(`${URLcondition}api/getSession`, _data);
        const d = r.data as ConfigRowsSkeleton;
        proc.session = d;
        proc.status = "STOPPED";
        proc.result += "\n[INFO] Bot stopped by user.\n";
        axios
          .post(`${URLcondition}api/sendStatusToTelegram`, {
            username: proc.username,
          })
          .then((res) => {
            proc.result += res.data;
          });
        // add it to previous processes
        addToPool(proc);
      }, timeLeft + 2000);
      return;
    }
    event.preventDefault();
    // call terminateProcess
    const result = await fetch(
      `${URLcondition}api/fetchProcesses?${new URLSearchParams({
        username: proc.username,
      })}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "text/plain",
        },
      }
    );
    const data = await result.text();
    const _processes = data.split("\n").map((p) =>
      p
        .split("   ")
        .filter((s) => s.length)
        .join(" ")
    );
    // remove all elements except the last one.
    const command = _processes[0];
    // get pid of command
    const pid = command
      .split(" ")
      .filter((elem) => elem.trim() !== "")[1]
      .trim();
    await fetch(
      `${URLcondition}api/terminateProcess?${new URLSearchParams({ pid })}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "text/plain",
        },
      }
    );
    enqs(`${proc.username} stopped.`, {
      variant: "success",
      action: notifyActions,
      autoHideDuration: 2000,
    });
    const _data: GetSessionFromPython = {
      username: proc.username,
      followers_now: proc.followers,
      following_now: proc.following,
    };
    enqs(`Getting ${proc.username}'s data ...`, {
      variant: "info",
      action: notifyActions,
      autoHideDuration: 2000,
    });
    const r = await axios.post(`${URLcondition}api/getSession`, _data);
    const d = r.data as ConfigRowsSkeleton;
    proc.session = d;
    proc.status = "STOPPED";
    proc.result += "\n[INFO] Bot stopped by user.\n";
    axios
      .post(`${URLcondition}api/sendStatusToTelegram`, {
        username: proc.username,
      })
      .then((res) => {
        proc.result += res.data;
      });
    enqs(`${proc.username} sent to telegram.`, {
      variant: "info",
      action: notifyActions,
      autoHideDuration: 2000,
    });
    // add it to previous processes
    addToPool(proc);
  }, []);

  // stop process by username if needed
  const stopProcessByUsername = (username: string) => {
    const p = processes.filter((process) => {
      if (process.username === username) {
        return process;
      }
      return undefined;
    });
    if (p) {
      p.map((process) => {
        getSession(process);
      });
    }
  };

  const handleCrashesOutput = (output: string, _process: Process) => {
    if (output.includes(" INFO | - Total Crashes:				OK (1/5)")) {
      _process.total_crashes = 1;
    } else if (output.includes(" INFO | - Total Crashes:				OK (2/5)")) {
      _process.total_crashes = 2;
    } else if (output.includes(" INFO | - Total Crashes:				OK (3/5)")) {
      _process.total_crashes = 3;
    } else if (output.includes(" INFO | - Total Crashes:				OK (4/5)")) {
      _process.total_crashes = 4;
    } else if (output.includes(" INFO | - Total Crashes:				OK (5/5)")) {
      _process.total_crashes = 5;
      _process.status = "STOPPED";
    }
  };

  // Remove previous Process
  const removeProcessFromPool = (_process: Process) => {
    // remove process from pool if status is not running or not waiting
    if (_process.status !== "RUNNING" && _process.status !== "WAITING") {
      setProcesses((previous) =>
        previous.filter((p) => {
          if (
            p.username === _process.username &&
            p.device.id === _process.device.id
          ) {
            return;
          } else return p;
        })
      );
    }
  };

  // Add to Process pool
  const addToPool = (_process: Process) => {
    setProcesses((previous) => {
      // check if previous process matches this process username
      // if true then remove it from the pool and store the new one
      // else just add it to the pool
      const p = previous.filter((process) => {
        if (process.username === _process.username) {
          return;
        } else return process;
      });
      return [...p, _process];
    });
  };

  const updateProcessFollowings = useCallback(
    (_process: Process, following: number, followers: number) => {
      _process.following = following;
      _process.followers = followers;
    },
    []
  );

  const readConfig = useCallback(async (process: Process) => {
    const result = await axios.post(`${URLcondition}api/readConfig`, {
      username: process.username,
    });
    const data = result.data;
    process.config = data;
    addToPool(process);
  }, []);

  const deleteOlderLogs = useCallback(async (username: string) => {
    const response = await axios.post(`${URLcondition}api/deleteOlderLogs`, {
      username,
    });
    const data = response.data;
    console.log({ data });
  }, []);

  // update a process's result
  const updateProcessResult = useCallback(
    (_process: Process, output: string) => {
      setProcesses((previous) =>
        previous.map((process) => {
          if (process === _process) {
            if (!process.result.includes(output)) {
              process.result += output;
            }
            handleCrashesOutput(output, process);
            if (output.includes(`INFO | Hello, @${process.username}`)) {
              const c = output.split(" ").filter((el) => el);
              const following = parseInt(c[8]);
              const followers = parseInt(c[11]);
              updateProcessFollowings(process, following, followers);
              readConfig(process);
            } else if (output.includes("INFO | Current active-job:")) {
              // TODO: display current active job
            } else if (output.includes("INFO | Next session will start at:")) {
              process.status = "WAITING";
              getSession(process);
              deleteOlderLogs(process.username);
            } else if (
              output.includes(
                "This kind of exception will stop the bot (no restart)."
              ) ||
              output.includes(
                `RuntimeError: USB device ${process.device.id} is offline`
              )
            ) {
              process.status = "STOPPED";
              process.total_crashes = 5;
              axios
                .post(`${URLcondition}api/sendStatusToTelegram`, {
                  username: process.username,
                })
                .then((res) => {
                  process.result += res.data;
                  return process;
                });
            } else if (
              output.includes("INFO | -------- FINISH:") ||
              output.includes(
                "INFO | This bot is backed with love by me for free"
              )
            ) {
              process.status = "FINISHED";
              readConfig(process);
              getSession(process);
            }
          }
          return process;
        })
      );
    },
    []
  );

  // get session data for a process
  const getSession = async (process: Process) => {
    if (!process.username || process.username.trim() === "") return;
    const _data: GetSessionFromPython = {
      username: process.username,
      followers_now: process.followers,
      following_now: process.following,
    };
    const result = await axios.post(`${URLcondition}api/getSession`, _data);
    if (
      result.data ===
      "[ERROR] You have to run the bot at least once to generate a report!"
    ) {
      notify(
        `First time running ${process.username}. No Session available`,
        "info"
      );
      process.session = {
        "overview-username": process.username,
        "overview-status": process.status,
        "overview-followers": process.followers.toString(),
        "overview-following": process.following.toString(),
        ...ConfigRows,
      };
      return;
    }
    const data = result.data as ConfigRowsSkeleton;
    process.session = data;
    addToPool(process);
    return;
  };
  // Display Data

  // get adb devices
  const getDevices = async () => {
    const result = await fetch(`${URLcondition}api/getDevices`);
    const listOfDevices: string = (await result.text())
      .replace("List of devices attached", "")
      .replace("device", "");
    const devicesID = listOfDevices
      .trim()
      .split("\n")
      .map((d) => {
        const temp = d.replace("\r", "");
        const _t_stripped_temp = temp.replace("\t", "");
        return _t_stripped_temp.replace("device", "");
      });
    // map devices to name. from the json file
    let devices: { id: string; name: string }[] = [];
    devicesID.forEach((id) => {
      Object.entries(DevicesList).forEach(
        ([key, value]: [key: string, value: string]) => {
          if (key === id) {
            devices.push({ id: key, name: value });
          }
        }
      );
    });
    notify("Devices Refreshed !", "info");
    logData(
      `[INFO] ${devices.length} device${
        devices.length > 1 ? "s" : ""
      } connected.`
    );
    setDevices(devices);
  };
  // display error
  const displayError = (error: string) => {
    setError((prevError) => prevError + `${error}\n`);
    return;
  };
  // display data
  const logData = (data: string) => {
    setData((prevData) => prevData + `${data}\n`);
  };
  // get connected devices
  useEffectOnce(() => {
    getDevices();
  });

  function getDevicesBattery() {
    console.log("here ?");
    const temp = [...processes];
    temp.map(async (process) => {
      const result = await axios.post(`${URLcondition}api/deviceBattery`, {
        deviceId: process.device.id,
      });
      const data: string = result.data;
      const fData: string = `${data.trim().split(":")[1]}%`.trim();
      console.log({ fData });
      process.battery = fData;
      addToPool(process);
    });
  }

  // store in localstorage
  function storeInLS() {
    localStorage.setItem(
      "processes",
      JSON.stringify(processes.length > 0 ? processes : [])
    );
  }

  // get processes from local storage
  function getFromLS() {
    const p: ProcessSkeleton[] | [] = localStorage.getItem("processes")
      ? JSON.parse(localStorage.getItem("processes") as string)
      : [];
    return p;
  }

  // get processes from local storage
  useEffectOnce(() => {
    const p: ProcessSkeleton[] | [] = getFromLS();
    const proc =
      p.length > 0
        ? p.map((_p) => {
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
              _p._battery
            );
          })
        : [];
    setProcesses(proc);
  });

  // give app time to load
  useEffectOnce(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1200);
  });

  // also store in local storage when the user leaves the page
  useEventListener("beforeunload", storeInLS);
  // save processes in local storage every 10 seconds
  useInterval(storeInLS, 1000 * 10);
  // get processes from local storage every 10 second
  useInterval(getFromLS, 1000 * 10);

  // get device's battery every 5 minutes
  useInterval(getDevicesBattery, 1000 * 60 * 5);

  if (isLoading)
    return (
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline enableColorScheme />
      <Fragment>
        <SnackbarProvider maxSnack={3} autoHideDuration={2500}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Navigation />
            <Box>
              <Component
                {...pageProps}
                setData={setData}
                logData={logData}
                displayError={displayError}
                setError={setError}
                setDevices={setDevices}
                getDevices={getDevices}
                devices={devices}
                killBot={killBot}
                addToPool={addToPool}
                updateProcessResult={updateProcessResult}
                processes={processes}
              />
            </Box>
            {router.pathname === "/" ? (
              <Box sx={{ margin: "2rem 0", width: "100%", height: "100%" }}>
                <Box sx={{ margin: "0 auto", overflow: "auto" }}>
                  <Typography variant="h4" sx={{ paddingLeft: "2rem" }}>
                    Processes
                  </Typography>
                  <ProcessesTable
                    processes={processes}
                    getSession={getSession}
                    stopProcessByUsername={stopProcessByUsername}
                  />
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    height: "fit-content",
                    backgroundColor: "#e5e5e5",
                    padding: "2rem",
                  }}
                >
                  <ShowProcesses
                    text="Details"
                    updateProcessResult={updateProcessResult}
                    killBot={killBot}
                    noProcessesText="No Processes currently running..."
                    processes={processes}
                    removeProcessFromPool={removeProcessFromPool}
                  />
                </Box>
              </Box>
            ) : (
              <div ref={scrollToMe}>
                {router.pathname !== "/" ? <Output data={data} /> : null}
              </div>
            )}
          </LocalizationProvider>
        </SnackbarProvider>
      </Fragment>
    </ThemeProvider>
  );
}
