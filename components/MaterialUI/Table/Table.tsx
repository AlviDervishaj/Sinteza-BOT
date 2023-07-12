import { FC, useCallback, useEffect, useState, useMemo } from "react";
// uuid
import { v5 as uuidv5 } from "uuid";
import {
  DataGrid,
  GridColDef,
  GridColumnGroupingModel,
  GridEventListener,
  GridRowParams,
  useGridApiRef,
  GridRowIdGetter,
} from "@mui/x-data-grid";
import { Process, ProcessSkeleton } from "../../../utils/Process";
import { Box } from "@mui/material";
import { ConfigRowsSkeleton } from "../../../utils/Types";

type Props = {
  processes: Process[];
  getSession: (process: Process) => void;
  stopProcessByUsername: (username: string) => void;
};

export const ProcessesTable: FC<Props> = ({ processes }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [rows, setRows] = useState<ConfigRowsSkeleton[] | []>(
    processes.map((process) => process.session)
  );

  const ConfigCols: GridColDef[] = [
    {
      field: "overview-username",
      headerName: "Username",
      width: 200,
    },
    {
      field: "overview-status",
      headerName: "Status",
      width: 100,
    },
    {
      field: "overview-followers",
      headerName: "Followers",
      width: 200,
    },
    {
      field: "overview-following",
      headerName: "Following",
      width: 200,
    },
    {
      field: "last-session-activity-bottling",
      headerName: "Minutes of Bottling",
      width: 250,
    },
    {
      field: "last-session-activity-likes",
      headerName: "Likes",
      width: 200,
    },
    {
      field: "last-session-activity-follows",
      headerName: "Follows",
      width: 200,
    },
    {
      field: "last-session-activity-unfollows",
      headerName: "Unfollows",
      width: 200,
    },
    {
      field: "last-session-activity-stories-watched",
      headerName: "Stories Watched",
      width: 250,
    },
    {
      field: "last-session-activity-comments-done",
      headerName: "Comments Done",
      width: 250,
    },
    {
      field: "last-session-activity-pm-sent",
      headerName: "PM Sent",
      width: 200,
    },
    {
      field: "today-session-activity-bottling",
      headerName: "Minutes of Bottling",
      width: 250,
    },
    {
      field: "today-session-activity-likes",
      headerName: "Likes",
      width: 200,
    },
    {
      field: "today-session-activity-follows",
      headerName: "Follows",
      width: 200,
    },
    {
      field: "today-session-activity-unfollows",
      headerName: "Unfollows",
      width: 250,
    },
    {
      field: "today-session-activity-stories-watched",
      headerName: "Stories Watched",
      width: 250,
    },
    {
      field: "today-session-activity-pm-sent",
      headerName: "PM Sent",
      width: 200,
    },
    {
      field: "trends-new-followers-today",
      headerName: "New Followers Today",
      width: 260,
    },
    {
      field: "trends-new-followers-past-3-days",
      headerName: "New Followers past 3 days",
      width: 270,
    },
    {
      field: "trends-new-followers-past-week",
      headerName: "New Followers past week",
      width: 260,
    },
    {
      field: "trends-milestone",
      headerName: "Milestone",
      width: 200,
    },
    {
      field: "weekly-average-bottling",
      headerName: "Minutes of Bottling",
      width: 260,
    },
    {
      field: "weekly-average-followers-per-day",
      headerName: "Followers per day",
      width: 220,
    },
    {
      field: "weekly-average-likes",
      headerName: "Likes",
      width: 200,
    },
    {
      field: "weekly-average-follows",
      headerName: "Follows",
      width: 200,
    },
    {
      field: "weekly-average-unfollows",
      headerName: "Unfollows",
      width: 200,
    },
    {
      field: "weekly-average-stories-watched",
      headerName: "Stories Watched",
      width: 200,
    },
    {
      field: "weekly-average-comments-done",
      headerName: "Comments Done",
      width: 200,
    },
    {
      field: "weekly-average-pm-sent",
      headerName: "PM Sent",
      width: 200,
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
        { field: "last-session-activity-comments-done" },
        { field: "last-session-activity-pm-sent" },
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
        { field: "today-session-activity-comments-done" },
        { field: "today-session-activity-pm-sent" },
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
        { field: "weekly-average-comments-done" },
        { field: "weekly-average-pm-sent" },
      ],
    },
  ];
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  });
  return (
    <Box sx={{ height: 400, width: "100%" }}>
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
      />
    </Box>
  );
};
