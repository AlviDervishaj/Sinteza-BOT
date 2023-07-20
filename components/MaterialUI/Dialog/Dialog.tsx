import { FC, useState } from "react";
import { Process } from "../../../utils/Process";
import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
} from "@mui/material";

type Props = {
  process: Process;
};
export const ChangeBotConfig: FC<Props> = ({ process }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const handleClose = () => setIsOpen(false);
  const handleOpen = () => setIsOpen(true);
  return (
    <section>
      <Tooltip title="Change bot config" arrow>
        <Button variant="outlined" color="warning" onClick={handleOpen}>
          Change Bot Config
        </Button>
      </Tooltip>
      <Dialog open={isOpen} onClose={handleClose}>
        <DialogTitle>Change {process.username} config</DialogTitle>
        <DialogContent>
          <DialogContentText>Description here</DialogContentText>
        </DialogContent>
      </Dialog>
    </section>
  );
};
