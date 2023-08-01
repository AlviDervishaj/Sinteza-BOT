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
  ShowProcesses
} from "../components";

// Utils
import {
  Process,
  ProcessSkeleton,
  ConfigRows,
  ConfigRowsSkeleton,
  GetSessionFromPython,
  DevicesList,
  pidFormattingLinux,
  BotFormData,
  start_bot,
} from "../utils";


import { ApiDevices } from "../utils/Types";

// Dayjs
import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime";
import Duration from "dayjs/plugin/duration";
import Calendar from "dayjs/plugin/calendar";
import { debounce, throttle } from "../utils/utils";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
// import { Phones } from "../components/Phones";

dayjs.extend(RelativeTime);
dayjs.extend(Duration);
dayjs.extend(Calendar);

export default function Sinteza({ Component, pageProps }: AppProps): ReactJSXElement {
  const router: NextRouter = useRouter();
  const scrollToMe = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<string>("");
  const [devices, setDevices] = useState<ApiDevices>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const lightTheme = createTheme({ palette: { mode: "light" } });
  const { closeSnackbar, enqueueSnackbar } = useSnackbar();

  // Throttled functions
  const throttledSetProcesses = throttle(setProcesses, 1000 * 6);

  const notifyActions = (id: SnackbarKey) => (
    <>
      <Button variant="text" color="inherit" onClick={() => closeSnackbar(id)}>
        <Close color={"inherit"} />
      </Button>
    </>
  );

  const writeDevices = async () => {
    await fetch('/api/writeDevices', {
      method: 'POST',
      mode: 'cors',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(devices),
    });
  }

  const readDevices = async () => {
    await fetch('/api/readDevices');
  }


  const notify = (
    message: SnackbarMessage,
    variant: "error" | "info" | "default" | "success"
  ) => {
    enqueueSnackbar(message, { variant, action: notifyActions });
    return;
  };

  // update devices
  const updateDevices = useCallback(async (device: { id: string, name: string, battery: string, process: Process | null }) => {
    setDevices((previous) =>
      previous.filter((d) => {
        if (
          d.id === device.id &&
          d.name === device.name
        ) {
          return device;
        } else return d;
      })
    );
  }, [])
  const removeSchedule = async (proc: Process) => {
    if (proc.scheduled !== false) {
      const startTime = dayjs(proc.scheduled).valueOf();
      const timeLeft = startTime - dayjs().valueOf();
      enqs(`Scheduled Bot to terminate ${proc.scheduled}`, {
        variant: "info",
        action: notifyActions,
        autoHideDuration: 2000,
      });
      // execute callback after bot started.
      setTimeout(async () => {
        const result = await axios.post(`/api/getPid`, {
          username: proc.username,
        });
        const data = result.data;
        let pid = "";
        try {
          pid = pidFormattingLinux(data);
        } catch (error) {
          enqs("Switch System variable in env to windows !");
          return;
        }
        await fetch(
          `/api/terminateProcess?${new URLSearchParams({
            pid,
          })}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "text/plain",
            },
          }
        );
        const _data: GetSessionFromPython = {
          username: proc.username,
          followers_now: proc.followers,
          following_now: proc.following,
        };
        const r = await axios.post(`/api/getSession`, _data);
        const d = r.data as ConfigRowsSkeleton;
        proc.session = d;
        proc.status = "STOPPED";
        axios
          .post(`/api/sendStatusToTelegram`, {
            username: proc.username,
          })
          .then((res) => {
            proc.result += res.data;
          });
        // add it to previous processes
        updateProcessesPool(proc);
      }, timeLeft + 2000);
      return;
    }
  }

  const killBot = async (proc: Process) => {
    removeSchedule(proc);
    // call terminateProcess
    const result = await axios.post(`/api/getPid`, {
      username: proc.username,
    });
    const data: string = result.data;
    let pid = '';
    try {
      pid = pidFormattingLinux(data);
    } catch (error) {
      // could not find process's pid. Meaning the bot is not running
      proc.status = "STOPPED";
      updateProcessesPool(proc);
      return;
    }
    await fetch(
      `/api/terminateProcess?${new URLSearchParams({ pid })}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "text/plain",
        },
      }
    );
    const _data: GetSessionFromPython = {
      username: proc.username,
      followers_now: proc.followers,
      following_now: proc.following,
    };
    const r = await axios.post(`/api/getSession`, _data);
    const d = r.data as ConfigRowsSkeleton;
    proc.session = d;
    proc.status = "STOPPED";
    proc.result += "\n[INFO] Bot stopped by user.\n";
    axios
      .post(`/api/sendStatusToTelegram`, {
        username: proc.username,
      })
      .then((res) => {
        proc.result += res.data;
      });
    // add it to previous processes
    updateProcessesPool(proc);
  };
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
      throttledSetProcesses((previous) =>
        previous.filter((p) => {
          if (
            p.username === _process.username &&
            p.device === _process.device
          ) {
            return;
          } else return p;
        })
      );
    }
  };

  const updateProcessesPool = useCallback((_process: Process) => {
    setProcesses((previous) =>
      previous.filter((p) => {
        if (
          p.username === _process.username &&
          p.device === _process.device
        ) {
          return _process;
        } else return p;
      })
    );
  }, []);

  // Add to Process pool
  const addToPool = (_process: Process) => {
    // check if process username is already in process pool
    const p = processes.filter((process) => {
      if (process.username === _process.username) {
        if (process.status === "RUNNING" || process.status === "WAITING") {
          return process;
        } else {
          // remove process from pool if status is not running or not waiting
          removeProcessFromPool(process);
          return undefined;
        }
      }
      return undefined;
    });
    // if process username in pool do nothing
    if (p.length > 0) {
      return;
    }
    // if process username not in pool add it
    setProcesses((previous) => [...previous, _process]);
  };

  const updateProcessFollowings = useCallback(
    (_process: Process, following: number, followers: number) => {
      _process.following = following;
      _process.followers = followers;
      _process.profile.followers = followers;
      _process.profile.following = following;
    },
    []
  );

  const readConfig = useCallback(async (process: Process) => {
    const result = await axios.post(`/api/readConfig`, {
      username: process.username,
    });
    const data = result.data;
    process.config = data;
  }, []);

  const rotateConfigEvery3Days = async (process: Process) => {
    console.log(`${process.username} switching to config3.yml...`);
    await killBot(process);
    process.configFile = 'config3.yml';
    process.startTime = Date.now();
    // start bot
    const d: BotFormData = {
      username: process.username,
      device: { id: process.device.id, name: process.device.name, battery: process.device.battery },
      config_name: process.configFile,
      jobs: process.jobs,
    }
    start_bot(d, (output: string) => {
      updateProcessResult(process, output);
    });
  };

  const switchConfigAfter2Days = async (process: Process) => {
    console.log(`${process.username} switching to config2.yml...`);
    await killBot(process);
    process.configFile = 'config2.yml';
    process.startTime = Date.now();

    // start bot
    const d: BotFormData = {
      username: process.username,
      device: process.device,
      config_name: process.configFile,
      jobs: process.jobs,
    }
    start_bot(d, (output: string) => {
      updateProcessResult(process, output);
    });
  }
  // 1000 * 60 * 60 * 24 * 2

  const debouncedSwitchConfig = debounce(switchConfigAfter2Days, 1000 * 60 * 5);
  const debouncedRotateConfig = debounce(rotateConfigEvery3Days, 1000 * 60 * 5);

  // update a process's result
  const updateProcessResult = (_process: Process, output: string) => {
    if (!_process.result.includes(output)) {
      _process.result += output;
      handleCrashesOutput(output, _process);
      if (output.includes("INFO | -------- START: ")) {
        _process.status = "RUNNING";
      }
      else if (output.includes(`INFO | Hello, @${_process.username}`)) {
        const c = output.split(" ").filter((el) => el);
        const followers = parseInt(c[8]);
        const following = parseInt(c[11]);
        updateProcessFollowings(_process, following, followers);
        readConfig(_process);
      } else if (output.includes("INFO | Current active-job:")) {
        // TODO: display current active job
      } else if (output.includes("INFO | Next session will start at:")) {
        _process.status = "WAITING";
        getSession(_process);
        const dateNow = dayjs().valueOf();
        const timeInFirstConfigInHours: number = dayjs().diff(dayjs(_process.startTime), 'hour');
        const twoDaysLater = dayjs(_process.startTime).add(2, "day").valueOf();
        const threeDaysLater = dayjs(_process.startTime).add(3, "day").valueOf();
        const difference2Days = dayjs(twoDaysLater).diff(dayjs(dateNow), 'hour');
        const difference3Days = dayjs(threeDaysLater).diff(dayjs(dateNow), 'hour');
        // if config is config2.yml switch to config3.yml after 3 days
        // meanwhile resume process with config2.yml
        if (_process.configFile === 'config2.yml') {
          _process.result += `Time in config2.yml: ${difference3Days} hours`;
          if (difference3Days <= 0) {
            debouncedRotateConfig(_process);
          }
        }
        // if config is config3.yml switch to config2.yml after one day of work
        else if (_process.configFile === 'config3.yml') {
          const timeInThirdConfig = dayjs(dateNow).diff(dayjs(_process.startTime), 'hour');
          _process.result += `Time in config3.yml: ${timeInThirdConfig} hours`;
          if (timeInThirdConfig >= 24) {
            debouncedSwitchConfig(_process);
          }
        }
        // if config is config1.yml switch to config2.yml after 2 days
        // meanwhile resume process with config1.yml
        else {
          const timeInFirstConfigInMinutes: number = dayjs().diff(dayjs(_process.startTime), 'minutes');
          _process.result += `Time in config1.yml: ${timeInFirstConfigInHours > 0 ? timeInFirstConfigInHours : timeInFirstConfigInMinutes} ${timeInFirstConfigInHours > 0 ? 'hours' : 'minutes'}`;
          if (difference2Days <= 0) {
            debouncedSwitchConfig(_process);
          }
        }
      } else if (
        output.includes(
          "This kind of exception will stop the bot (no restart)."
        ) ||
        output.includes(
          "RuntimeError: USB device"
        ) || output.includes(` ${_process.device} is offline`) ||
        output.includes(
          `adbutils.errors.AdbError: device '${_process.device}' not found`
        )
      ) {
        _process.status = "STOPPED";
        _process.total_crashes = 5;
        axios
          .post(`/api/sendStatusToTelegram`, {
            username: _process.username,
          })
          .then((res) => {
            _process.result += res.data;
            return _process;
          });
      } else if (output.includes("INFO | Completed sessions:")) {
        const tSessions = output.split("INFO | Completed sessions: ")[1];
        _process.total = parseInt(tSessions);
      } else if (
        output.includes("INFO | -------- FINISH: ") ||
        output.includes("INFO | This bot is backed with love by me for free")
      ) {
        _process.status = "FINISHED";
        readConfig(_process);
        getSession(_process);
      }
      updateProcessesPool(_process);
    }
  };

  // get session data for a process
  const getSession = async (process: Process) => {
    if (!process.username || process.username.trim() === "") return;
    const _data: GetSessionFromPython = {
      username: process.username,
      followers_now: process.followers,
      following_now: process.following,
    };
    const result = await axios.post(`/api/getSession`, _data);
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
    updateProcessesPool(process);
    return;
  };
  // Display Data

  // get adb devices
  const getDevices = async () => {
    const result = await fetch(`/api/getDevices`);
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
    let devices: ApiDevices = [];
    devicesID.forEach((id) => {
      Object.entries(DevicesList).forEach(
        async ([key, value]: [key: string, value: string]) => {
          if (key === id) {
            const result = await axios.post(`/api/deviceBattery`, {
              deviceId: key,
            });
            const data: string = result.data;
            let fData: string = "";
            if (data.includes(`device ${key}' not found`)) {
              fData = "X";
            } else {
              fData = `${data.trim().split(":")[1]}%`.trim();
            }
            devices.push({ id: key, name: value, battery: fData, process: null });
          }
        }
      );
    });
    notify("Devices Refreshed !", "info");
    logData(
      `[INFO] ${devices.length} device${devices.length > 1 ? "s" : ""
      } connected.`
    );
    setDevices(devices);
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
    const temp = [...processes];
    temp.map(async (process) => {
      const result = await axios.post(`/api/deviceBattery`, {
        deviceId: process.device.id,
      });
      const data: string = result.data;
      let fData: string = "";
      if (data.includes(`device '${process.device}' not found`)) {
        fData = "X";
      } else {
        fData = `${data.trim().split(":")[1]}%`.trim();
      }
      process.battery = fData;
      const device = devices.find((device) => device.id === process.device.id);
      if (device) {
        // update devices battery
        device.battery = fData;
        updateDevices(device);
      }
      // else do nothing.
      updateProcessesPool(process);
    });
  }

  // store in localstorage
  function storeInLS() {
    localStorage.setItem(
      "processes",
      JSON.stringify(processes.length > 0 ? processes : [])
    );

    // store devices too
    localStorage.setItem(
      "devices",
      JSON.stringify(devices.length > 0 ? devices : [])
    )
  }

  // get processes from local storage
  function getProcessesFromLS() {
    const p: ProcessSkeleton[] | [] = localStorage.getItem("processes")
      ? JSON.parse(localStorage.getItem("processes") as string)
      : [];
    // const throttleProcesses = throttle(setProcesses, 1000 * 10);
    // throttleProcesses(p);
    return p;
  }

  function getDevicesFromLS() {
    const d: ApiDevices = localStorage.getItem("devices")
      ? JSON.parse(localStorage.getItem("devices") as string)
      : [];
    return d;
  }

  // get processes from local storage
  useEffectOnce(() => {
    const p: ProcessSkeleton[] | [] = getProcessesFromLS();
    const d: ApiDevices = getDevicesFromLS();
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
            _p._battery,
            _p._jobs,
            _p._configFile
          );
        })
        : [];
    setProcesses(proc);
    setDevices(d);
  });

  // give app time to load
  useEffectOnce(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1200);
  });

  // also store in local storage when the user leaves the page
  useEventListener("beforeunload", storeInLS);
  // save processes in local storage every 25 seconds
  useInterval(storeInLS, 1000 * 25);
  // get processes from local storage every 25 seconds
  useInterval(getProcessesFromLS, 1000 * 25);
  // update devices every 50 seconds
  useInterval(writeDevices, 1000 * 50);
  // read from file
  // useInterval(readDevices, 1000 * 25);

  // get device's battery every 2 minutes
  useInterval(getDevicesBattery, 1000 * 60);

  if (isLoading)
    return (
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme: any) => theme.zIndex.drawer + 1 }}
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
                setDevices={setDevices}
                getDevices={getDevices}
                devices={devices}
                killBot={killBot}
                addToPool={addToPool}
                updateDevices={updateDevices}
                updateProcessResult={updateProcessResult}
                processes={processes}
              />
            </Box>
            {router.pathname === "/" ? (
              <Box sx={{ margin: "2rem 0", width: "100%", height: "100%" }}>
                <Box sx={{ margin: "0 auto", overflow: "auto" }}>
                  {/* <Phones devices={devices} /> */}
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
                    removeSchedule={removeSchedule}
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
