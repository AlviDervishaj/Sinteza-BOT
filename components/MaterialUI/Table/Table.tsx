"use client";
import { useState, useMemo, memo } from "react";

// uuid
import { v5 as uuidv5 } from "uuid";

// Material UI
import {
  DataGrid,
  GridColDef,
  GridColumnGroupingModel,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { useEffectOnce } from "usehooks-ts";

// Utils
import { Process } from "../../../utils";

// DayJs
import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime";
import Duration from "dayjs/plugin/duration";
import Calendar from "dayjs/plugin/calendar";

dayjs.extend(RelativeTime);
dayjs.extend(Duration);
dayjs.extend(Calendar);

const GridToolbar = () => {
  return (
    <GridToolbarContainer
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignContent: "center",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignContent: "center",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <GridToolbarExport />
        <GridToolbarFilterButton />
      </Box>
      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
};

export const ProcessesTable = memo<{ processes: Process[] }>(function Table({
  processes,
}) {
  // Table Columns
  const ConfigCols: GridColDef[] = [
    {
      field: "overview-username",
      headerName: "Username",
      width: 100,
    },
    {
      field: "overview-battery",
      headerName: "Battery",
      width: 60,
    },
    {
      field: "overview-status",
      headerName: "Status",
      width: 100,
    },
    {
      field: "overview-scheduled",
      headerName: "Scheduled",
      minWidth: 170,
    },
    {
      field: "overview-total-crashes",
      headerName: "Crashes",
      width: 70,
    },
    {
      field: "overview-total-sessions",
      headerName: "Sessions",
      width: 80,
    },
    {
      field: "overview-starting-followers",
      headerName: "S Followers",
      width: 100,
    },
    {
      field: "overview-starting-following",
      headerName: "S Following",
      width: 100,
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
      field: "trends-new-followers-today",
      headerName: "Today",
      width: 60,
    },
    {
      field: "trends-new-followers-past-3-days",
      headerName: "3 days",
      width: 60,
    },
    {
      field: "trends-new-followers-past-week",
      headerName: "Past Week",
      width: 90,
    },
    {
      field: "weekly-average-botting",
      headerName: "Botting",
      width: 60,
    },
    {
      field: "weekly-average-followers-per-day",
      headerName: "Followers/day",
      width: 120,
    },
    {
      field: "weekly-average-likes",
      headerName: "Likes",
      width: 40,
    },
    {
      field: "weekly-average-follows",
      headerName: "Follows",
      width: 68,
    },
    {
      field: "weekly-average-unfollows",
      headerName: "Unfollows",
      width: 80,
    },
    {
      field: "weekly-average-stories-watched",
      headerName: "Stories W",
      width: 90,
    },
    {
      field: "last-session-activity-botting",
      headerName: "Botting",
      width: 60,
    },
    {
      field: "last-session-activity-likes",
      headerName: "Likes",
      width: 50,
    },
    {
      field: "last-session-activity-follows",
      headerName: "Follows",
      width: 68,
    },
    {
      field: "last-session-activity-unfollows",
      headerName: "Unfollows",
      width: 80,
    },
    {
      field: "last-session-activity-stories-watched",
      headerName: "Stories W",
      width: 90,
    },
    {
      field: "today-session-activity-botting",
      headerName: "Botting",
      width: 60,
    },
    {
      field: "today-session-activity-likes",
      headerName: "Likes",
      width: 50,
    },
    {
      field: "today-session-activity-follows",
      headerName: "Follows",
      width: 68,
    },
    {
      field: "today-session-activity-unfollows",
      headerName: "Unfollows",
      width: 80,
    },
    {
      field: "today-session-activity-stories-watched",
      headerName: "Stories W",
      width: 90,
    },
  ];

  // Table Rows
  const ConfigRows = useMemo(() => {
    return processes.map((process) => {
      const session = process.session;
      return {
        ...session,
        id: uuidv5(process.username, uuidv5.URL),
        "overview-username": process.username,
        "overview-total-crashes": process.total_crashes,
        "overview-status": process.status,
        "overview-battery": process.device.battery,
        "overview-scheduled": process.scheduled
          ? dayjs(process.scheduled).calendar()
          : "No",
        "overview-total-sessions": process.total,
        "overview-starting-followers": process.followers,
        "overview-starting-following": process.following,
        "overview-followers": session["overview-followers"],
        "overview-following": session["overview-following"],
      };
    });
  }, [processes]);

  const ConfigColsGroupingModel: GridColumnGroupingModel = [
    {
      groupId: "Overview",
      description: "Overview of last activity",
      children: [
        { field: "overview-username" },
        { field: "overview-battery" },
        { field: "overview-status" },
        { field: "overview-scheduled" },
        { field: "overview-total-sessions" },
        { field: "overview-total-crashes" },
        { field: "overview-starting-followers" },
        { field: "overview-starting-following" },
        { field: "overview-followers" },
        { field: "overview-following" },
      ],
    },
    {
      groupId: "Trends",
      description: "Trends",
      children: [
        {
          groupId: "New Followers",
          description: "New Followers",
          children: [
            { field: "trends-new-followers-today" },
            { field: "trends-new-followers-past-3-days" },
            { field: "trends-new-followers-past-week" },
          ],
        },
      ],
    },
    {
      groupId: "7-Day Average",
      description: "7-Day Average",
      children: [
        { field: "weekly-average-botting" },
        { field: "weekly-average-followers-per-day" },
        { field: "weekly-average-likes" },
        { field: "weekly-average-follows" },
        { field: "weekly-average-unfollows" },
        { field: "weekly-average-stories-watched" },
      ],
    },
    {
      groupId: "Last Session Activity",
      description: "Last Session activity",
      children: [
        { field: "last-session-activity-botting" },
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
        { field: "today-session-activity-botting" },
        { field: "today-session-activity-likes" },
        { field: "today-session-activity-follows" },
        { field: "today-session-activity-unfollows" },
        { field: "today-session-activity-stories-watched" },
      ],
    },
  ];

  return (
    <Box
      sx={{
        height: "fit-content",
        width: "100%",
        padding: "2rem",
      }}
      id="processes-table"
    >
      <DataGrid
        aria-label="Processes Table"
        experimentalFeatures={{ columnGrouping: true }}
        autoHeight
        pagination
        rows={ConfigRows}
        columns={ConfigCols}
        checkboxSelection
        disableRowSelectionOnClick
        columnGroupingModel={ConfigColsGroupingModel}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } },
          sorting: {
            sortModel: [{ field: "overview-username", sort: "asc" }],
          },
        }}
      />
    </Box>
  );
});
