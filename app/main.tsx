import React from 'react';
import ReactDOM from 'react-dom/client';

import "./styles/globals.scss";
import "./styles/markdown.scss";
import "./styles/highlight.scss";

import { Home } from "./components/home";
import { McpInitializer } from "./components/mcp-initializer";

import { useChatStore } from "./store/chat";
import { useEffect } from "react";

// This is a temporary solution. Configuration should be handled differently in Vite.
const serverConfig = { isVercel: false };

const App = () => {
  useEffect(() => {
    useChatStore.getState().initMcp();
  }, []);

  return (
    <>
      <Home />
      {serverConfig?.isVercel && (
        <>
        </>
      )}
    </>
  );
};

const Root = () => {
  return (
    <>
      <McpInitializer />
      <App />
      {serverConfig?.isVercel && (
        <>
        </>
      )}
    </>
  );
};


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);