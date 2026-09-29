import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "mapbox-gl/dist/mapbox-gl.css";
import App from "@/App";
import { AppAuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/context/theme-context";
import "@/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppAuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AppAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
