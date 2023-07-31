import Link from "next/link";
import { FC} from "react";
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
              width: "100%",
              display: "flex",
              placeItems: "center",
              justifyContent: "space-evenly",
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
