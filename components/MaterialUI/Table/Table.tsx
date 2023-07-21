import { FC, useCallback, useEffect, useState, useMemo } from "react";
// uuid
import { v5 as uuidv5 } from "uuid";
import {
  DataGrid,
  GridColDef,
  GridColumnGroupingModel,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { Process, ProcessSkeleton } from "../../../utils/Process";
import { Box } from "@mui/material";
import { ConfigRowsSkeleton } from "../../../utils/Types";

type Props = {
  processes: Process[];
  getSession: (process: Process) => void;
  stopProcessByUsername: (username: string) => void;
};

const GridToolbar = () => {
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
    </GridToolbarContainer>
  );
};

export const ProcessesTable: FC<Props> = ({ processes, getSession }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [rows, setRows] = useState<ConfigRowsSkeleton[] | []>(
    processes.map((process) => process.session)
  );

  const ConfigCols: GridColDef[] = [
    {
      field: "overview-username",
      headerName: "Username",
      width: 100,
    },
    {
      field: "overview-status",
      headerName: "Status",
      width: 92,
    },
    {
      field: "overview-membership",
      headerName: "Membership",
      width: 92,
    },
    {
      field: "overview-total-crashes",
      headerName: "Crashes",
      width: 70,
    },
    {
      field: "overview-followers",
      headerName: "Followers",
      width: 100,
    },
    {
      field: "overview-following",
      headerName: "Following",
      width: 100,
    },
    {
      field: "weekly-average-bottling",
      headerName: "Work Time",
      width: 85,
    },
    {
      field: "weekly-average-followers-per-day",
      headerName: "Followers/day",
      width: 110,
    },
    {
      field: "weekly-average-likes",
      headerName: "Likes",
      width: 50,
    },
    {
      field: "weekly-average-follows",
      headerName: "Follows",
      width: 60,
    },
    {
      field: "weekly-average-unfollows",
      headerName: "Unfollows",
      width: 80,
    },
    {
      field: "weekly-average-stories-watched",
      headerName: "Stories W",
      width: 80,
    },
    {
      field: "trends-new-followers-today",
      headerName: "Gains Today",
      width: 90,
    },
    {
      field: "trends-new-followers-past-3-days",
      headerName: "Gains past 3 days",
      width: 125,
    },
    {
      field: "trends-new-followers-past-week",
      headerName: "Gains past week",
      width: 120,
    },
    {
      field: "last-session-activity-bottling",
      headerName: "Work Time",
      width: 85,
    },
    {
      field: "last-session-activity-likes",
      headerName: "Likes",
      width: 50,
    },
    {
      field: "last-session-activity-follows",
      headerName: "Follows",
      width: 60,
    },
    {
      field: "last-session-activity-unfollows",
      headerName: "Unfollows",
      width: 80,
    },
    {
      field: "last-session-activity-stories-watched",
      headerName: "Stories W",
      width: 80,
    },
    {
      field: "today-session-activity-bottling",
      headerName: "Work Time",
      width: 85,
    },
    {
      field: "today-session-activity-likes",
      headerName: "Likes",
      width: 50,
    },
    {
      field: "today-session-activity-follows",
      headerName: "Follows",
      width: 60,
    },
    {
      field: "today-session-activity-unfollows",
      headerName: "Unfollows",
      width: 80,
    },
    {
      field: "today-session-activity-stories-watched",
      headerName: "Stories W",
      width: 80,
    },
  ];

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
    setRows(proc.length > 0 ? proc.map((process) => process.session) : []);
  }, []);

  const ConfigRows = useMemo(() => {
    return processes.map((process) => {
      const session = process.session;
      return {
        id: uuidv5(process.username, uuidv5.URL),
        "overview-username": process.username,
        "overview-total-crashes": process.total_crashes,
        "overview-membership": process.membership,
        "overview-status": process.status,
        "overview-followers": session["overview-followers"],
        "overview-following": session["overview-following"],
        ...session,
      };
    });
  }, [processes]);

  const ConfigColsGroupingModel: GridColumnGroupingModel = [
    {
      groupId: "Overview",
      description: "Overview of last activity",
      children: [
        { field: "overview-username" },
        { field: "overview-status" },
        { field: "overview-membership" },
        { field: "overview-total-crashes" },
        { field: "overview-followers" },
        { field: "overview-following" },
      ],
    },
    {
      groupId: "Last Session Activity",
      description: "Last Session activity",
      children: [
        { field: "last-session-activity-bottling" },
        { field: "last-session-activity-likes" },
        { field: "last-session-activity-follows" },
        { field: "last-session-activity-unfollows" },
        { field: "last-session-activity-stories-watched" },
      ],
    },
    {
      groupId: "Today's Session Activity",
      description: "Today's Session activity",
      children: [
        { field: "today-session-activity-bottling" },
        { field: "today-session-activity-likes" },
        { field: "today-session-activity-follows" },
        { field: "today-session-activity-unfollows" },
        { field: "today-session-activity-stories-watched" },
      ],
    },
    {
      groupId: "Trends",
      description: "Trends",
      children: [
        { field: "trends-new-followers-today" },
        { field: "trends-new-followers-past-3-days" },
        { field: "trends-new-followers-past-week" },
        { field: "trends-milestone" },
      ],
    },
    {
      groupId: "7-Day Average",
      description: "7-Day Average",
      children: [
        { field: "weekly-average-bottling" },
        { field: "weekly-average-followers-per-day" },
        { field: "weekly-average-likes" },
        { field: "weekly-average-follows" },
        { field: "weekly-average-unfollows" },
        { field: "weekly-average-stories-watched" },
      ],
    },
  ];
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  });

  return (
    <Box
      sx={{
        height: "fit-content",
        width: "100%",
        paddingBottom: "2rem",
      }}
      id="processes-table"
    >
      <DataGrid
        aria-label="Processes Table"
        experimentalFeatures={{ columnGrouping: true }}
        autoHeight
        pagination
        rows={ConfigRows}
        loading={loading}
        columns={ConfigCols}
        checkboxSelection
        disableRowSelectionOnClick
        columnGroupingModel={ConfigColsGroupingModel}
        slots={{ toolbar: GridToolbar }}
      />
    </Box>
  );
};