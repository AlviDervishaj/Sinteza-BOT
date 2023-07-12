import Head from "next/head";
import { Dispatch, SetStateAction } from "react";
type Props = {
  devices: string[];
  device: string;
  getDevices: () => void;
  setDevice: Dispatch<SetStateAction<string>>;
};
export default function Home({}: Props) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Sinteza Description" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Sinteza</title>
      </Head>
    </>
  );
}
