import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Render App component to the DOM with StrictMode disabled
createRoot(document.getElementById("root")!).render(<App />);
