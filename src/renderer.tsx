/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home';
import Settings from './pages/Settings';
import CsvValidation from './pages/CsvValidator';
import { getStoredTheme, themes, ThemeType } from './themes';

const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeType>(getStoredTheme());

  return (
    <ConfigProvider theme={themes[theme]}>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/csv-validation" element={<CsvValidation />} />
          </Routes>
        </MainLayout>
      </Router>
    </ConfigProvider>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('👋 This message is being logged by "renderer.js", included via webpack');
