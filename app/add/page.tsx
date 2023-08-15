"use client";
// NextJs & React
import { Metadata } from "next";
import dynamic from "next/dynamic";
// Components
const LazyBotForm = dynamic(() =>
  import("../../components/BotForm").then((mod) => mod.BotForm)
);

export const metadata: Metadata = {
  title: "Sinteza | Add Bot",
  authors: [{ name: "Sinteza", url: "" }],
  creator: "Sinteza",
  description: "Management website for instagram bots made for Sinteza.",
  keywords: [
    "sinteza",
    "instagram",
    "bot",
    "robot",
    "automate",
    "python",
    "typescript",
    "nextjs",
  ],
  viewport: { width: "device-width", initialScale: 1 },
};
function AddBot() {
  return (
    <>
      <LazyBotForm />
    </>
  );
}
export default AddBot;
