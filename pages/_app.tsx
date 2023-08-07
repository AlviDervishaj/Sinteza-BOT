// Fonts
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

// React & Next Js
import { useState, Fragment } from "react";
import type { AppProps } from "next/app";

// Material UI
import CssBaseline from "@mui/material/CssBaseline";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Backdrop from "@mui/material/Backdrop";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Notistack
import {
  SnackbarProvider,
} from "notistack";

// Hooks
import { useEffectOnce } from "usehooks-ts";

// Components
import {
  Navigation,
} from "../components";

// Dayjs
import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime";
import Duration from "dayjs/plugin/duration";
import Calendar from "dayjs/plugin/calendar";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";

dayjs.extend(RelativeTime);
dayjs.extend(Duration);
dayjs.extend(Calendar);



export default function Sinteza({ Component, pageProps }: AppProps): ReactJSXElement {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const lightTheme = createTheme({ palette: { mode: "light" } });

  useEffectOnce(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2300);
  })

  if (isLoading)
    return (
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme: any) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline enableColorScheme />
      <Fragment>
        <SnackbarProvider maxSnack={3} autoHideDuration={2500}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Navigation />
            <Box>
              <Component {...pageProps} />
            </Box>
          </LocalizationProvider>
        </SnackbarProvider>
      </Fragment>
    </ThemeProvider>
  );
}
