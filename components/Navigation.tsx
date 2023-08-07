import Link from "next/link";
import { FC } from "react";
import {
  AppBar,
  Container,
  Toolbar,
  Box,
} from "@mui/material";
export const Navigation: FC = () => {
  return (
    <AppBar position="static" color="primary">
      <Container maxWidth="sm">
        <Toolbar disableGutters>
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              gap: '5rem',
              width: '100vw',
              flexDirection: 'row',
              justifyContent: "space-between",
              justifyItems: "space-between",
              alignItems: "center",
            }}
          >
            <Link
              style={{
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: "1.2rem",
                letterSpacing: ".05rem",
                color: "inherit",
                textDecoration: "none",
              }}
              prefetch={false}
              href="/"
            >
              Dashboard
            </Link>
            <Link
              style={{
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: "1.2rem",
                letterSpacing: ".05rem",
                color: "inherit",
                textDecoration: "none",
              }}
              prefetch={false}
              href="/addBulk"
            >
              Add Bot Bulk
            </Link>
            <Link
              style={{
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: "1.2rem",
                letterSpacing: ".05rem",
                color: "inherit",
                textDecoration: "none",
              }}
              prefetch={false}
              href="/add"
            >
              Add Bot
            </Link>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};