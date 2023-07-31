// React
import { FC, ReactElement, ReactNode, useState } from "react";

// Material UI
import { ChargingStation as ChargingNeededPhone, MobileOff, MobileFriendly } from '@mui/icons-material';
import { Grid, Button, Box, Modal } from "@mui/material";
import { DevicesList } from "../utils";

type Props = {
  devices: { name: string, id: string }[],
}

type DialogProps = {
  open: boolean,
  handleClose: () => void;
  children: ReactElement;

}

const Dialog: FC<DialogProps> = ({ open, handleClose, children }) => {
return (
  <Modal aria-labelledby="Phone pop-up" aria-describedby="Preview Phone status"
    keepMounted
    open={open}
    onClose={handleClose}>
    {children}
  </Modal>
)

}

export const Phones: FC<Props> = ({ devices }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedDevice, setSelectedDevice] = useState<{ id: string, name: string }>({ id: "", name: "" })
  const handleOpen = () => {
    setIsOpen(true);
    return;
  }

  const handleClose = () => {
    setIsOpen(false);
    return;
  }

  const handleSelection = (id: string) => {
    setIsOpen(true);
    const d = Object.entries(DevicesList).find(([key, value]: [key: string, value: string]) => key === id);
    if (d) {
      setSelectedDevice({ id: d[0], name: d[1] });
    }
    else {
      setSelectedDevice({ id: '', name: "Device not found !" });
    }
  }

  return (
    <Box sx={{ flexGrow: 1, padding: '1rem 3rem' }}>
      <Grid container spacing={2}>
        {
          Object.entries(DevicesList).map(([key, value]: [key: string, value: string]) => {
            if (devices.find(element => element.id === key && element.name === value)) {
              return <Grid item key={key}><Button onClick={(event) => handleSelection(event.currentTarget.value)} variant="outlined" value={key} color="info" key={`${value} ${key}`}>{value}</Button></Grid>
            }
            else {
              return <Grid item key={key}><Button onClick={(event) => handleSelection(event.currentTarget.value)} value={key} variant="outlined" color="error" key={`${key} ${value}`}>{value}</Button></Grid>
            }
          })
        }
      </Grid>
      <Dialog open={isOpen} handleClose={handleClose}>
        <h2>{selectedDevice.name}</h2>
      </Dialog>
    </Box>

  );
}
