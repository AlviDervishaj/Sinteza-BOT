"use client";
// Next Js & React
import { Backdrop, CircularProgress, Skeleton } from "@mui/material";
import { ReactNode, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Metadata } from "next";

// Socket IO
import { io, Socket } from "socket.io-client";

// Custom Hooks
import { useEffectOnce, useInterval } from "usehooks-ts";

// Material UI
import { Close } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";

// Utils
import { Device } from "../utils/Devices";
import { Process, ProcessSkeleton } from "../utils";
import { BotFormData, EmitTypes, EventTypes, Jobs } from "../utils/Types";

// Feedback
import { SnackbarKey, SnackbarMessage, useSnackbar } from "notistack";

// Loader
import { GridLoader } from "react-spinners";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import Image from "next/image";

// Components
const LazyProcessTable = dynamic(
  () =>
    import("../components/MaterialUI/Table/Table").then(
      (mod) => mod.ProcessesTable
    ),
  {
    loading: () => (
      <Skeleton
        variant="rectangular"
        sx={{ bgcolor: "grey.200", margin: "2rem auto" }}
        width={"95%"}
        height={200}
      />
    ),
  }
);
const LazyShowProcesses = dynamic(
  () => import("../components/ShowProcesses").then((mod) => mod.ShowProcesses),
  {
    loading: () => (
      <Skeleton
        variant="rectangular"
        sx={{ bgcolor: "grey.200", margin: "1rem auto" }}
        width={"90%"}
        height={60}
      />
    ),
  }
);
// Page Metadata
export const metadata: Metadata = {
  title: "Sinteza | Add Bot",
  authors: [{ name: "Sinteza", url: "" }],
  creator: "Sinteza",
  description: "Management website for instagram bots made for Sinteza.",
  keywords: [
    "sinteza",
    "instagram",
    "bot",
    "robot",
    "automate",
    "python",
    "typescript",
    "nextjs",
  ],
  viewport: { width: "device-width", initialScale: 1 },
};
let socket: Socket;
function View() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isKilling, setIsKilling] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const router: AppRouterInstance = useRouter();
  // Home
  const [processes, setProcesses] = useState<Process[]>([]);
  const [message, setMessage] = useState<string>("");
  const { closeSnackbar, enqueueSnackbar } = useSnackbar();

  const notifyActions = useCallback(
    (id: SnackbarKey): ReactNode => (
      <>
        <Button
          variant="text"
          color="inherit"
          onClick={() => closeSnackbar(id)}
        >
          <Close color={"inherit"} />
        </Button>
      </>
    ),
    [closeSnackbar]
  );

  const handlePageRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      router.push("/");
      setIsRefreshing(false);
    }, 1000 * 1);
  };

  const notify = useCallback(
    (
      message: SnackbarMessage,
      variant: "error" | "info" | "default" | "success"
    ): void => {
      enqueueSnackbar(message, { variant, action: notifyActions });
      return;
    },
    [enqueueSnackbar, notifyActions]
  );
  // close connection on reload / page leave
  useEffect(() => {
    function handleSocketConnection() {
      socket = io("ws://localhost:3030", {
        autoConnect: true,
        closeOnBeforeunload: true,
      });

      socket.on<EmitTypes>("stop-process-message", (data: string) => {
        if (data.includes("[ERROR]")) {
          notify(data.replace("[ERROR]", ""), "error");
          setIsKilling(false);
          return;
        }
        notify(data, "info");
        setIsKilling(false);
      });

      socket.on<EmitTypes>("remove-schedule-message", (result: string) => {
        notify(result, "info");
      });

      // listen for event to get processes
      socket.on<EmitTypes>(
        "get-processes-message",
        (response: ProcessSkeleton[]) => {
          const proc =
            response.length > 0
              ? response.map((_p) => {
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
          setTimeout(() => {
            setIsLoading(false);
          }, 1000 * 2);
        }
      );
    }
    handleSocketConnection();
    return () => {
      socket.emit("close");
      socket.disconnect();
    };
  }, [notify]);

  useEffectOnce(() => {
    setMessage("Getting devices...");
    socket.emit<EventTypes>("get-devices-battery");
    setTimeout(() => {
      setMessage("Getting sessions...");
      socket.emit<EventTypes>("get-sessions");
      setTimeout(() => {
        setMessage("Getting processess...");
        socket.emit<EventTypes>("get-processes");
      }, 1000 * 2.1);
    }, 1000 * 2.1);
    return;
  });

  const handleStop = (username: string) => {
    setIsKilling(true);
    socket.emit<EventTypes>("stop-process", username);
  };

  const removeSchedule = (username: string) => {
    socket.emit<EventTypes>("remove-schedule", username);
  };

  type NotScheduledType = {
    scheduled: false;
    startsAt: undefined;
    formData: BotFormData;
    startTime: number;
    status: "RUNNING" | "WAITING" | "STOPPED" | "FINISHED";
    membership: "FREE" | "PREMIUM";
    jobs: Jobs;
  };
  const startBotAgain = useCallback((_process: Process) => {
    const _modified_process: NotScheduledType = {
      scheduled: false,
      startsAt: undefined,
      formData: {
        jobs: _process.jobs,
        device: new Device(
          _process.device.id,
          _process.device.name,
          _process.device.battery,
          { username: _process.username, configFile: _process.configFile }
        ),
        username: _process.username,
        "working-hours": _process.config.args.working_hours,
        "speed-multiplier": _process.config.args.speed_multiplier,
        password: _process.config.args.password,
        "truncate-sources": _process.config.args.truncate_sources,
        "blogger-followers": _process.config.args.blogger_followers
          ? _process.config.args.blogger_followers
          : [""],
        "hashtag-likers-top": _process.config.args.hashtag_likers_top,
        "unfollow-skip-limit": _process.config.args.unfollow_skip_limit,
        "unfollow-non-followers": _process.config.args.unfollow_non_followers,
        config_name: _process.configFile,
      },
      jobs: _process.jobs,
      membership: _process.membership,
      status: "RUNNING",
      startTime: Date.now(),
    };
    socket.emit<EventTypes>("start-process-again", _modified_process);
  }, []);

  const removeProcessFromPool = (_username: string) => {
    socket.emit<EventTypes>("remove-process", _username);
  };

  const previewDevice = (_id: string) => {
    socket.emit<EventTypes>("preview-device", _id);
    return;
  }

  // update devices
  useInterval(
    () => {
      socket.emit<EventTypes>("get-devices-battery");
    },
    process.env.NODE_ENV === "development" ? 1000 * 3 : 1000 * 15
  );

  // update sessions
  useInterval(() => {
    socket.emit<EventTypes>("get-sessions");
  }, 1000 * 45);
  // update processes
  useInterval(
    () => {
      socket.emit<EventTypes>("get-processes");
    },
    process.env.NODE_ENV === "development" ? 1000 * 5 : 1000 * 15
  );
  if (isLoading) {
    return (
      <Backdrop
        sx={{
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          placeContent: "center",
          flexDirection: "column",
          gap: "2rem",
          zIndex: (theme: any) => theme.zIndex.drawer + 1,
        }}
        open={isLoading}
      >
        <GridLoader color="#00bbf9" loading={isLoading} margin={6} size={30} />
        <Typography variant="h4" sx={{ paddingLeft: "2rem", color: "#fff" }}>
          {message}
        </Typography>
      </Backdrop>
    );
  }
  return (
    <Box sx={{ margin: "0", width: "100%", height: "100%", padding: "1rem" }}>
      {error ? (
        <Box
          sx={{
            width: "100%",
            height: "calc(100vh - 4rem)",
            padding: "4rem 0",
            display: "flex",
            flexDirection: "column",
            justifyItems: "center",
            placeItems: "center",
            gap: "2rem",
            backgroundColor: "grey.200",
          }}
        >
          <Image src="/danger.png" alt="Robot" width={64} height={64} />
          {error.split("\n").map((line) => (
            <Typography key={line} variant="h4" sx={{ paddingLeft: "2rem" }}>
              {line}
            </Typography>
          ))}

          <Button variant="contained" color="info" onClick={handlePageRefresh}>
            {isRefreshing === false ? (
              "Refresh"
            ) : (
              <CircularProgress size={20} color="inherit" />
            )}
          </Button>
        </Box>
      ) : (
        <Box sx={{ margin: "0 auto", overflow: "auto" }}>
          <Typography variant="h4" sx={{ paddingLeft: "2rem" }}>
            Processes
          </Typography>
          <LazyProcessTable processes={processes} />
          <Typography variant="h4" sx={{ paddingLeft: "2rem" }}>
            Expanded Info
          </Typography>
          <LazyShowProcesses
            previewDevice={previewDevice}
            removeSchedule={removeSchedule}
            processes={processes}
            removeProcess={removeProcessFromPool}
            handleStop={handleStop}
            startAgain={startBotAgain}
            isKilling={isKilling}
          />
        </Box>
      )}
    </Box>
  );
}

export default View;
