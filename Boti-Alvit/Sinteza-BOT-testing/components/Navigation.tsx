import Link from "next/link";
import { FC, useState, MouseEvent } from "react";
import { Home, Add, Adb, Menu } from "@mui/icons-material";
import {
  Stack,
  AppBar,
  Container,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu as M,
  MenuItem,
} from "@mui/material";
export const Navigation: FC = () => {
  return (
    <AppBar position="static" color="primary">
      <Container maxWidth="sm">
        <Toolbar disableGutters>
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              placeItems: "center",
              justifyContent: "space-between",
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
