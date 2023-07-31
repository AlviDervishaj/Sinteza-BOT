import { FC, useEffect } from "react";
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

type Props = {
  process: Process;
  header: string;
  mutateProcessConfig: (process: Process) => void;
  mutateProcessProfile: (process: Process) => void;
  label: string;
  getSession: (process: Process) => void;
};

export const ProfileTable: FC<Props> = ({
  process,
  getSession,
  header,
  label,
}) => {
  useEffect(() => {
    getSession(process);
  }, [getSession, process]);
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
          {Object.entries(process.profile).map(
            ([key, value]: [key: string, value: any], index: number) => (
              <TableRow key={key + index}>
                <TableCell>{key}</TableCell>
                <TableCell>{value}</TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </Box>
  );
};
