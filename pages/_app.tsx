// Fonts
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

// React & Next Js
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import type { AppProps } from "next/app";
import { NextRouter, useRouter } from "next/router";

// Material UI
import {
  Button,
  Snackbar,
  IconButton,
  CssBaseline,
  Container,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Axios
import axios from "axios";

// Components
import { Navigation, Output, ProcessesTable } from "../components";
import { ShowProcesses } from "../components/ShowProcesses";
// Utils
import { Process, ProcessSkeleton } from "../utils/Process";
import { DevicesList } from "../utils/Devices";
import {
  ConfigRows,
  ConfigRowsSkeleton,
  GetSessionFromPython,
} from "../utils/Types";
import { URLcondition } from "../utils/utils";

export default function Sinteza({ Component, pageProps }: AppProps) {
  const [open, setOpen] = useState<boolean>(false);
  const router: NextRouter = useRouter();
  const scrollToMe = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<string>("");
  const [devices, setDevices] = useState<{ id: string; name: string }[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const lightTheme = createTheme({ palette: { mode: "light" } });

  // const exportToExcel = async () => {
  //   const result = await axios.post(`${URLcondition}api/exportToExcel`, {
  //     data: processes,
  //   });
  //   console.log({ data: result.data });
  // };

  const killBot = async (event: any, proc: Process) => {
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
    console.log({ data });
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
    const _data: GetSessionFromPython = {
      username: proc.username,
      followers_now: proc.followers,
      following_now: proc.following,
    };
    const r = await axios.post(`${URLcondition}api/getSession`, _data);
    const d = r.data as ConfigRowsSkeleton;
    proc.session = d;
    proc.status = "STOPPED";
    addToPool(proc);
    logData("[INFO] Bot stopped.");
    // remove process
    stopProcess(proc);
    // add it to previous processes
    addPreviousProcess(proc);
  };
  // Remove process
  const stopProcess = (_process: Process) => {
    getSession(_process);
    setOpen(true);
    _process.status = "STOPPED";
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
        setOpen(true);
      });
    }
  };

  //  Snackbar
  const handleSnackbarClose = (
    event: SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason == "clickaway") return console.log("clickaway");
    setOpen(false);
  };
  const action = (
    <>
      <Button color="secondary" size="small" onClick={handleSnackbarClose}>
        UNDO
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleSnackbarClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );

  // Remove previous Process
  const removeProcessFromPool = (_process: Process) => {
    setProcesses((previous) =>
      previous.filter(
        (process) => process.status !== "RUNNING" && _process !== process
      )
    );
  };
  // Add to previous Process pool
  const addPreviousProcess = (_process: Process) => {
    setProcesses((previous) =>
      previous.map((p) => {
        if (p === _process) {
          p = _process;
        }
        return p;
      })
    );
  };

  // Add to Process pool
  const addToPool = (_process: Process) => {
    setProcesses((previous) => {
      // check if process already exists
      const exists = previous.find((process) => {
        if (process.username === _process.username) {
          return true;
        }
        return false;
      });
      if (exists) {
        // change status of the previous bot
        const _previous = previous.map((process) => {
          if (
            process.username === _process.username &&
            process.device.id === _process.device.id &&
            process.status !== "RUNNING"
          ) {
            process = _process;
            process.status = _process.status;
            process.session = _process.session;
            process.followers = _process.followers;
            process.following = _process.following;
          }
          return process;
        });
        return [..._previous];
      } else return [...previous, _process];
    });
  };

  const updateProcessFollowers = (output: string, process: Process) => {
    const c = output.split(" ").filter((el) => el);
    const following = c[8];
    const followers = c[11];
    process.followers = parseInt(followers);
    process.following = parseInt(following);
    addToPool(process);
  };

  // update a process's result
  const updateProcessResult = (_process: Process, output: string) => {
    setProcesses((previous) =>
      previous.map((process) => {
        if (process === _process) {
          if (!process.result.includes(output)) {
            process.result += output;
          }
          if (output.includes(`INFO | Hello, @${process.username}`)) {
            updateProcessFollowers(output, process);
          } else if (output.includes("INFO | Next session will start at:")) {
            process.status = "WAITING";
            const _data: GetSessionFromPython = {
              username: process.username,
              followers_now: process.followers,
              following_now: process.following,
            };
            axios
              .post(`${URLcondition}api/getSession`, _data)
              .then((result) => {
                const data = result.data as ConfigRowsSkeleton;
                process.session = data;
                addToPool(process);
              });
          } else if (output.includes("INFO | -------- FINISH:")) {
            process.status = "FINISHED";
            const _data: GetSessionFromPython = {
              username: process.username,
              followers_now: process.followers,
              following_now: process.following,
            };
            axios
              .post(`${URLcondition}api/getSession`, _data)
              .then((result) => {
                const data = result.data as ConfigRowsSkeleton;
                process.session = data;
                addToPool(process);
              });
          }
        }
        return process;
      })
    );
  };

  // get session data for a process
  const getSession = async (process: Process) => {
    if (!process.username || process.username.trim() === "") return;
    const _data: GetSessionFromPython = {
      username: process.username,
      followers_now: process.followers,
      following_now: process.following,
    };
    const result = await axios.post(`${URLcondition}api/getSession`, _data);
    const data = result.data as ConfigRowsSkeleton;
    process.session = data;
    addToPool(process);
  };

  // // get adb devices
  // const getDevices = async () => {
  //   const getBusNumbers = await axios.get(`${URLcondition}api/getBusNumbers`);
  //   const busNumbers: string[] = (await getBusNumbers.data)
  //     .split("\n")
  //     .filter((d: string) => d.trim() !== "")
  //     .map((d: string) => {
  //       const bus_numbers = d.replace(":", "").split(" ");
  //       return bus_numbers.join(":");
  //     });
  //   let devicesArray: { id: string; name: string }[] = [];
  //   busNumbers.forEach(async (busNumber) => {
  //     const r = await axios.get(`${URLcondition}api/getDevices?`, {
  //       params: {
  //         bus_number: busNumber,
  //       },
  //     });
  //     const _d: string = await r.data;
  //     const _temp_d: string[] = _d.split(" ").filter((d) => d.trim() !== "");
  //     const _temp: { id: string; name: string } = {
  //       id: _temp_d[_temp_d.length - 1].replace("\n", ""),
  //       name: `${_temp_d[2]} ${_temp_d[3]} ${_temp_d[8]} ${_temp_d[9]}`,
  //     };
  //     devicesArray.push(_temp);
  //   });
  //   logData(
  //     `[INFO] ${devicesArray.length} device${
  //       devicesArray.length > 1 ? "s" : ""
  //     } connected.`
  //   );
  //   setDevices(devicesArray);
  // };

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
    logData(
      `[INFO] ${devices.length} device${
        devices.length > 1 ? "s" : ""
      } connected.`
    );
    setDevices(devices);
  };
  const displayError = (error: string) => {
    setError((prevError) => prevError + `${error}\n`);
    return;
  };
  const logData = (data: string) => {
    setData((prevData) => prevData + `${data}\n`);
  };
  // get connected devices
  useEffect(() => {
    getDevices();
  }, []);

  // store processes in local storage
  useEffect(() => {
    function storeInLS() {
      localStorage.setItem(
        "processes",
        JSON.stringify(processes.length > 0 ? processes : [])
      );
    }
    //  add event listener to handle before unload event
    window.addEventListener("beforeunload", storeInLS);
    // clean up function
    return () => {
      window.removeEventListener("beforeunload", storeInLS);
    };
  }, [processes]);

  // get processes from local storage
  useEffect(() => {
    const p: ProcessSkeleton[] | [] = localStorage.getItem("processes")
      ? JSON.parse(localStorage.getItem("processes") as string)
      : [];
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
              _p._profile
            );
          })
        : [];
    setProcesses(proc);
  }, []);

  // give app time to load
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);
  if (isLoading)
    return (
      <main
        style={{
          width: "100vw",
          padding: 0,
          margin: 0,
          height: "100vh",
          position: "relative",
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
        }}
      >
        <CircularProgress />
      </main>
    );

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline enableColorScheme />
      <Navigation />
      <Box>
        <Component
          {...pageProps}
          setData={setData}
          logData={logData}
          displayError={displayError}
          setError={setError}
          removeProcess={stopProcess}
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
        <Box sx={{ margin: "2rem 0", width: "100vw", height: "100vh" }}>
          <Container maxWidth="xl" sx={{ margin: "0 auto", overflow: "auto" }}>
            <Typography variant="h4" sx={{ paddingBottom: "1rem" }}>
              Processes
            </Typography>
            <ProcessesTable
              processes={processes}
              getSession={getSession}
              stopProcessByUsername={stopProcessByUsername}
            />
          </Container>
          <Box
            sx={{
              width: "100%",
              height: "fit-content",
              backgroundColor: "#e5e5e5",
              padding: "2rem",
            }}
          >
            <ShowProcesses
              text="Processes"
              killBot={killBot}
              noProcessesText="No Processes currently running..."
              processes={processes}
              removeProcessFromPool={removeProcessFromPool}
            />
          </Box>
        </Box>
      ) : null}
      <Snackbar
        open={open}
        autoHideDuration={3500}
        onClose={handleSnackbarClose}
        aria-label="Message"
        color="inherit"
        action={action}
        message="Process status changed to stopped. "
      />
      <div ref={scrollToMe}>
        {router.pathname !== "/" ? <Output data={data} /> : null}
      </div>
    </ThemeProvider>
  );
}
