// NextJs
import { Box, Typography } from "@mui/material";
import Head from "next/head";
import { ProcessesTable, ShowProcesses } from "../components";
// Home 
export default function Home() {

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Sinteza Description" />
        <meta name="title" content="Sinteza " />
        <meta
          name="description"
          content="A simple UI for Sinteza to start and monitor their devices."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.BASE_URL}`} />
        <meta property="og:title" content="Sinteza " />
        <meta
          property="og:description"
          content="A simple UI for Sinteza to start and monitor their devices."
        />
        <meta
          property="og:image"
          content={`${process.env.BASE_URL}/images/svg/logo-color.svg`}
        />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`${process.env.BASE_URL}`} />
        <meta property="twitter:creator" content="@empty" />
        <meta property="twitter:title" content="Sinteza " />
        <meta
          property="twitter:description"
          content="A simple UI for Sinteza to start and monitor their devices."
        />
        <meta
          property="twitter:image"
          content={`${process.env.BASE_URL}/images/svg/logo-color.svg`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Sinteza</title>
      </Head>
      <Box sx={{ margin: "2rem 0", width: "100%", height: "100%" }}>
        <Box sx={{ margin: "0 auto", overflow: "auto" }}>
          <Typography variant="h4" sx={{ paddingLeft: "2rem" }}>
            Processes
          </Typography>
          <ProcessesTable />
          <ShowProcesses />
        </Box>
      </Box>
    </>
  );
}
