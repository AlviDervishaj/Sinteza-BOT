import { FC, useState } from "react";
import { Process } from "../../../utils/Process";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
} from "@mui/material";
import { Snackbar } from "../Snackbar";
import axios from "axios";
import { SnackbarKey, SnackbarMessage, useSnackbar } from "notistack";
import { Close } from "@mui/icons-material";

type Props = {
  process: Process;
};
export const ChangeBotConfig: FC<Props> = ({ process }) => {
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
    enqueueSnackbar(message, {
      variant,
      action: notifyActions,
    });
    return;
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleDevicePreview = async (event: any, process: Process) => {
    event.preventDefault();
    notify("Opening preview", "info");
    setIsLoading(true);
    const res = await axios.post("/api/previewDevice", {
      deviceId: process.device.id,
    });
    if (res.status === 200) {
      notify("Preview Closed", "info");
      // toggle
      setIsLoading(false);
    }
  };
  return (
    <section>
      <Snackbar
        description={`Previewing device that is running for ${process.username}`}
        title={`Preview ${process.device.name}`}
        icon="info"
        variant="contained"
        color="primary"
        key={process.device.id}
        text={
          isLoading ? (
            <CircularProgress color="inherit" size={25} />
          ) : (
            "Preview"
          )
        }
        type="custom"
        onClick={(event) => handleDevicePreview(event, process)}
        tooltip="Open Preview"
        customEventHandler={() => {
          return;
        }}
      />
    </section>
  );
};
