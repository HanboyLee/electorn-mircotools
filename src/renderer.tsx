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
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home';
import Settings from './pages/Settings';
import CsvValidation from './pages/CsvValidator';
import ImageAnalyze from './pages/AnalyzeByImage';
import { themes } from './themes';
import { useSettingsStore } from './store/hooks/settings';
import { GlobalStyle } from './themes/GlobalStyle';

const App: React.FC = () => {
  const { settings } = useSettingsStore();

  return (
    <ConfigProvider theme={themes[settings.theme]}>
      <GlobalStyle theme={settings.theme} />
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/csv-validation" element={<CsvValidation />} />
            <Route path="/image-analyze" element={<ImageAnalyze />} />
          </Routes>
        </MainLayout>
      </Router>
    </ConfigProvider>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(<App />);

console.log('👋 This message is being logged by "renderer.js", included via webpack');
