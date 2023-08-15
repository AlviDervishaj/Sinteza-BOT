"use client";
import { Metadata } from "next";
import dynamic from "next/dynamic";
// Components
const LazyBulkForm = dynamic(() =>
  import("../../components/BulkForm").then((mod) => mod.BulkForm)
);

export const metadata: Metadata = {
  title: "Sinteza | Add Bot Bulk",
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

function AddBulk() {
  return (
    <>
      <LazyBulkForm />
    </>
  );
}
export default AddBulk;
