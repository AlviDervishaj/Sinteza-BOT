"use client";
import { Box, Typography } from "@mui/material";
import { FC, useRef, useEffect } from "react";

type Props = {
  data: string;
};

export const Output: FC<Props> = ({ data }) => {
  const refBox = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const elBox = refBox.current;
    if (elBox) {
      elBox.scrollTop = elBox.scrollHeight;
    }
  }, [data]);

  return (
    <>
      <Box
        ref={refBox}
        sx={{
          height: "20rem",
          position: "relative",
          overflow: "auto",
          backgroundColor: "#ced4da",
        }}
      >
        <Typography
          variant="subtitle1"
          component={"pre"}
          sx={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontSize: "1rem",
            margin: "0.5rem 1rem",
            padding: "1rem",
            lineHeight: "2rem",
            color: "#2b2d42",
          }}
        >
          {data}
        </Typography>
      </Box>
    </>
  );
};
