// NextJs
import Head from "next/head";
import { ReactNode, useCallback, useEffect, useState } from "react";

// Socket IO
import { io, Socket } from "socket.io-client";
import { useEffectOnce, useInterval } from "usehooks-ts";

// Material UI
import { Close } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";

// Utils
import { Process, ProcessSkeleton } from "../utils";
import { BotFormData, EmitTypes, EventTypes, Jobs } from "../utils/Types";

// Components
import { ProcessesTable, ShowProcesses } from "../components";
import { SnackbarKey, SnackbarMessage, useSnackbar } from "notistack";
import { Device } from "../utils/Devices";

// Home 
let socket: Socket;
export default function Home() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const { closeSnackbar, enqueueSnackbar } = useSnackbar();

  const notifyActions = useCallback((id: SnackbarKey): ReactNode => (
    <>
      <Button variant="text" color="inherit" onClick={() => closeSnackbar(id)}>
        <Close color={"inherit"} />
      </Button>
    </>
  ), [closeSnackbar]);

  const notify = useCallback((
    message: SnackbarMessage,
    variant: "error" | "info" | "default" | "success"
  ): void => {
    enqueueSnackbar(message, { variant, action: notifyActions });
    return;
  }, [enqueueSnackbar, notifyActions])
  // close connection on reload / page leave
  useEffect(() => {
    function handleSocketConnection() {
      socket = io("ws://localhost:3030", { autoConnect: true, closeOnBeforeunload: true });

      socket.once("connect", () => {
        console.log("Connected to socket!");
      });

      socket.on<EmitTypes>("stop-process-message", (data: string) => {
        notify(data, "info");
      })

      // listen for event to get processes
      socket.on<EmitTypes>("get-processes-message", (response: ProcessSkeleton[]) => {
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
                _p._startTime,
              );
            })
            : [];
        setProcesses(proc);
      });
    }
    handleSocketConnection()
    return () => {
      socket.emit("close");
      socket.disconnect();
    }
  }, [notify])


  useEffectOnce(() => {
    socket.emit<EventTypes>("get-processes");
    return;
  })

  const handleStop = (username: string) => {
    socket.emit<EventTypes>("stop-process", username);
  }

  type NotScheduledType = {
    scheduled: false,
    startsAt: undefined,
    formData: BotFormData,
    startTime: number,
    status: "RUNNING" | "WAITING" | "STOPPED" | "FINISHED",
    membership: "FREE" | "PREMIUM",
    jobs: Jobs
  }
  const startBotAgain = (_process: Process) => {
    const a: NotScheduledType = {
      scheduled: false,
      startsAt: undefined,
      formData: {
        jobs: _process.jobs,
        device: new Device(_process.device.id, _process.device.name, _process.device.battery, { username: _process.username, configFile: _process.configFile }),
        username: _process.username,
        "working-hours": _process.config.args.working_hours,
        "speed-multiplier": _process.config.args.speed_multiplier,
        password: _process.config.args.password,
        "truncate-sources": _process.config.args.truncate_sources,
        "blogger-followers": _process.config.args.blogger_followers,
        "hashtag-likers-top": _process.config.args.hashtag_likers_top,
        "unfollow-skip-limit": _process.config.args.unfollow_skip_limit,
        "unfollow-non-followers": _process.config.args.unfollow_non_followers,
        config_name: _process.configFile
      },
      jobs: _process.jobs,
      membership: _process.membership,
      status: "RUNNING",
      startTime: Date.now(),
    }
    socket.emit<EventTypes>("start-process-again", a);
  }

  const removeProcessFromPool = (_username: string) => {
    socket.emit<EventTypes>("remove-process", _username);
  }


  // update table every 25 seconds
  useInterval(() => {
    socket.emit<EventTypes>("get-processes");
  }, 1000 * 5);
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Sinteza Description" />
        <meta name="title" content="Sinteza " />
        <meta
          name="description"
          content="A simple UI for Sinteza to start and monitor their devices."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.BASE_URL}`} />
        <meta property="og:title" content="Sinteza " />
        <meta
          property="og:description"
          content="A simple UI for Sinteza to start and monitor their devices."
        />
        <meta
          property="og:image"
          content={`${process.env.BASE_URL}/images/svg/logo-color.svg`}
        />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`${process.env.BASE_URL}`} />
        <meta property="twitter:creator" content="@empty" />
        <meta property="twitter:title" content="Sinteza " />
        <meta
          property="twitter:description"
          content="A simple UI for Sinteza to start and monitor their devices."
        />
        <meta
          property="twitter:image"
          content={`${process.env.BASE_URL}/images/svg/logo-color.svg`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Sinteza</title>
      </Head>
      <Box sx={{ margin: "2rem 0", width: "100%", height: "100%" }}>
        <Box sx={{ margin: "0 auto", overflow: "auto" }}>
          <Typography variant="h4" sx={{ paddingLeft: "2rem" }}>
            Processes
          </Typography>
          <ProcessesTable processes={processes} />
          <ShowProcesses processes={processes} removeProcess={removeProcessFromPool} handleStop={handleStop} startAgain={startBotAgain} />
        </Box>
      </Box>
    </>
  );
}
