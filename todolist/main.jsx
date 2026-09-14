import React from "react";
import { createRoot } from "react-dom/client";
import App from "../ABES/ABES.jsx";
import "./style.css";

class AppErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: "32px", color: "#F3EFE3", background: "#15251F", minHeight: "100vh", fontFamily: "monospace" }}>
          <h2>ABES could not load</h2>
          <p>{this.state.error.message}</p>
          <p>Open the browser developer console for more details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);
