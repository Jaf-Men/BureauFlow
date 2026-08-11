import { ConfigProvider } from 'antd';
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import auroraTheme from "./theme/ant-theme";

createRoot(document.getElementById("root")!).render(
  <ConfigProvider theme={auroraTheme}>
    <App />
  </ConfigProvider>
);