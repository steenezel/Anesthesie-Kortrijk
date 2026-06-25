import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerCloudContentRefresh } from "./lib/cloudContentRefresh";
import { registerPwaUpdates } from "./pwa-register";

registerPwaUpdates();
registerCloudContentRefresh();

createRoot(document.getElementById("root")!).render(<App />);
