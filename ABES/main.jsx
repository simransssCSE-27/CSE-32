import React from "react";
import { createRoot } from "react-dom/client";
import App from "./ABES.jsx";
import "./style.css";

class AppErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <div className="app-error"><h2>ABES could not load</h2><p>{this.state.error.message}</p></div>;
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary><App /></AppErrorBoundary>
  </React.StrictMode>
);
