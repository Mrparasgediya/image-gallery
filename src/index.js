import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core";

const THEME = createMuiTheme({
  typography: {
    fontFamily: ["Pacifico", "cursive"].join(","),
  },
});

ReactDOM.render(
  <BrowserRouter>
    <MuiThemeProvider theme={THEME}>
      <App />
    </MuiThemeProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
