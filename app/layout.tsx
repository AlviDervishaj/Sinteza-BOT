"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
// React & Next Js
import { Fragment } from "react";

// Material UI
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// Notistack
import { SnackbarProvider } from "notistack";

// Components
const LazyNavigation = dynamic(() =>
  import("../components/Navigation").then((mod) => mod.Navigation)
);

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sinteza Preview Devices",
  description:
    "Sinteza project to preview connected devices and their respective processes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lightTheme = createTheme({ palette: { mode: "light" } });

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider theme={lightTheme}>
          <CssBaseline enableColorScheme />
          <Fragment>
            <SnackbarProvider maxSnack={3} autoHideDuration={2500}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <LazyNavigation />
                <Box sx={{ width: "100%", height: "100%" }}>{children}</Box>
              </LocalizationProvider>
            </SnackbarProvider>
          </Fragment>
        </ThemeProvider>
      </body>
    </html>
  );
}
