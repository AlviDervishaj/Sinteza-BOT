import Head from "next/head";
import { NextPage } from "next";

import { BotForm } from "../components/BotForm";

const AddBot: NextPage = () => {
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
        <meta property="twitter:creator" content="" />
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
        <title>Sinteza | Add Bot</title>
      </Head>
      <BotForm />
    </>
  );
};
export default AddBot;
