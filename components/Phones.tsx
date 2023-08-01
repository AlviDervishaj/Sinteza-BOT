// React
import { FC, useState } from "react";

import { Grid, Button, Modal, Typography, Box } from "@mui/material";
import { DevicesList, Process } from "../utils";
import { ApiDevices } from "../utils/Types";
import { SmartToy } from "@mui/icons-material";

type Props = {
  devices: ApiDevices,
}


export const Phones: FC<Props> = ({ devices }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedDevice, setSelectedDevice] = useState<{ id: string, name: string, process: Process | null, battery: string }>({ id: "", name: "", battery: "", process: null })
  const handleClose = () => {
    setIsOpen(false);
    return;
  }

  const handleSelection = (id: string) => {
    setIsOpen(true);
    const d = devices.find((device) => device.id === id);
    if (d) {
      setSelectedDevice(d);
    }
    else {
      setSelectedDevice({ id: '', name: "Device not found !", process: null, battery: "X" });
    }
  }

  const modalStyling = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: 4,
    boxShadow: 24,
    p: 4,
  };

  return (
    <Box sx={{ flexGrow: 1, padding: '1rem 3rem' }}>
      <Grid container spacing={2}>
        {
          Object.entries(DevicesList).map(([key, value]: [key: string, value: string]) => {
            if (devices.find(element => element.id === key && element.name === value)) {
              return <Grid item key={key}>
                <Button onClick={(event) => handleSelection(event.currentTarget.value)} variant="outlined" value={key} color="info" key={`${value} ${key}`}>
                  {value}
                </Button>
              </Grid>
            }
            else {
              return <Grid item key={key}>
                <Button onClick={(event) => handleSelection(event.currentTarget.value)} value={key} variant="outlined" color="error" key={`${key} ${value}`}>
                  {value}
                </Button>
              </Grid>
            }
          })
        }
      </Grid>
      <Modal
        aria-labelledby="Phone pop-up"
        aria-describedby="Preview Phone status"
        open={isOpen}
        onClose={handleClose}>
        <Box sx={modalStyling}>
          {selectedDevice.name === "Device not found !" ? <Typography>{selectedDevice.name}</Typography> : <>
            <Typography sx={{fontSize: 30, paddingBottom: 3}}>{selectedDevice.name}</Typography>
            <Typography color={selectedDevice.process ? 'black' : 'red'} sx={{fontSize: 20}}>
              {selectedDevice.process ? selectedDevice.process.username : "No process"}
            </Typography>
            <Typography>{selectedDevice.process?.configFile}</Typography>
          </>}
        </Box>
      </Modal>
    </Box>

  );
}
