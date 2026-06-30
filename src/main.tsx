import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const redirect = window.sessionStorage.getItem("ws:redirect");

if (redirect) {
  window.sessionStorage.removeItem("ws:redirect");
  const url = new URL(redirect);
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
