// React & Next Js
import { FC, useEffect } from "react";

// Material UI
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

// Utils
import { Process } from "../../../utils/Process";

type Props = {
  process: Process;
};

export const ProfileTable: FC<Props> = ({ process }) => {
  return (
    <Box sx={{ margin: 1 }}>
      <Typography variant="h6" gutterBottom component="div">
        {process.username} Profile
      </Typography>
      <Table size="small" aria-label={`${process.username}-config`}>
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
