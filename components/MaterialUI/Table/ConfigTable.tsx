import { FC, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { Process } from "../../../utils/Process";
import {  } from "../../../utils/utils";

// Axios
import axios from "axios";
import { SessionConfig, SessionConfigSkeleton } from "../../../utils/Types";

type Props = {
  process: Process;
  header: string;
  mutateProcessConfig: (process: Process) => void;
  mutateProcessProfile: (process: Process) => void;
  label: string;
};

export const ConfigTable: FC<Props> = ({
  process,
  header,
  label,
  mutateProcessConfig,
}) => {
  const [config, setConfig] = useState<SessionConfig>(SessionConfigSkeleton);

  useEffect(() => {
    if (process.status === "RUNNING") {
      const getConfig = async () => {
        const res = await axios.get(
          `/api/getConfig?${new URLSearchParams({
            username: process.username,
          })}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = res.data as SessionConfig;
        if (data) {
          setConfig(data);
          process.config = data;
          mutateProcessConfig(process);
        }
      };
      getConfig();
    } else setConfig(process.config);
  }, [mutateProcessConfig, process]);
  return (
    <Box sx={{ margin: 1 }}>
      <Typography variant="h6" gutterBottom component="div">
        {header}
      </Typography>
      <Table size="small" aria-label={label}>
        <TableHead>
          <TableRow>
            <TableCell>Key</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(config).map(
            ([key, value]: [key: string, value: any]) =>
              Array.isArray(value) ? (
                <TableRow key={key}>
                  <TableCell>{key}</TableCell>
                  <TableCell>
                    {value.map((v) => (
                      <p key={v}>{v}</p>
                    ))}
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={key}>
                  <TableCell>{key}</TableCell>
                  <TableCell>{value.toString()}</TableCell>
                </TableRow>
              )
          )}
        </TableBody>
      </Table>
    </Box>
  );
};
