import React from "react";
import ReactDOM from "react-dom/client";

import ChartMogulApp from "./ChartMogulApp";

import "./index.css";
import { HelpScoutContextProvider } from "@helpscout/ui-kit";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HelpScoutContextProvider>
      <ChartMogulApp />
    </HelpScoutContextProvider>
  </React.StrictMode>
);
